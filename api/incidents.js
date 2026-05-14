// Helper function to generate UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Validate API key
    const apiKey = req.headers['x-api-key'];
    const expectedKey = process.env.UIPATH_API_KEY || 'uipath-secret-key-12345';

    if (!apiKey || apiKey !== expectedKey) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, description, priority, tags, source, external_id } = req.body;

    // Validate title
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Get Supabase config
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase env vars');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Use Supabase REST API directly via fetch (no SDK needed)
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey,
      'Prefer': 'return=representation',
    };

    // Step 1: Get or create RPA user
    const rpaEmail = 'rpa@dhl-incident-system.internal';

    const selectRes = await fetch(
      `${supabaseUrl}/rest/v1/user_profiles?email=eq.${encodeURIComponent(rpaEmail)}&select=id`,
      { headers, method: 'GET' }
    );

    const existingUsers = await selectRes.json();
    let userId;

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      userId = existingUsers[0].id;
    } else {
      // Create RPA user with explicit UUID
      const newUserId = generateUUID();
      const createRes = await fetch(`${supabaseUrl}/rest/v1/user_profiles`, {
        headers,
        method: 'POST',
        body: JSON.stringify({
          id: newUserId,
          email: rpaEmail,
          full_name: 'UiPath RPA System',
          role: 'system',
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.json();
        console.error('Error creating RPA user:', err);
        throw new Error(`Failed to create RPA user: ${JSON.stringify(err)}`);
      }

      const newUser = await createRes.json();
      userId = newUser[0]?.id || newUserId;

      if (!userId) {
        throw new Error('Failed to get new user ID');
      }
    }

    // Step 2: Create incident
    const incidentRes = await fetch(`${supabaseUrl}/rest/v1/incidents`, {
      headers,
      method: 'POST',
      body: JSON.stringify({
        title: title.trim(),
        description: description || '',
        priority: priority || 'medium',
        status: 'submitted',
        tags: tags || [],
        created_by: userId,
      }),
    });

    if (!incidentRes.ok) {
      const err = await incidentRes.json();
      console.error('Error creating incident:', err);
      throw new Error(`Failed to create incident: ${JSON.stringify(err)}`);
    }

    const incident = await incidentRes.json();
    const incidentId = incident[0]?.id;

    if (!incidentId) {
      throw new Error('Failed to get incident ID');
    }

    // Step 3: Log to audit (non-critical, don't fail if this errors)
    fetch(`${supabaseUrl}/rest/v1/incident_audit_log`, {
      headers,
      method: 'POST',
      body: JSON.stringify({
        incident_id: incidentId,
        action: 'created_via_rpa',
        actor_id: userId,
        details: {
          source: source || 'uipath',
          external_id: external_id,
          timestamp: new Date().toISOString(),
        },
      }),
    }).catch(err => console.error('Audit log error (non-critical):', err));

    // Success response
    return res.status(201).json({
      success: true,
      incident_id: incidentId,
      message: 'Incident created successfully',
    });
  } catch (error) {
    console.error('API Handler Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error?.message || 'Unknown error',
    });
  }
}
