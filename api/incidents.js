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

    // Import Supabase dynamically
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get or create RPA user
    const rpaEmail = 'rpa@dhl-incident-system.internal';
    let userId;

    // Check if RPA user exists
    const { data: existingUser, error: selectError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', rpaEmail)
      .maybeSingle();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking RPA user:', selectError);
      throw selectError;
    }

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create RPA user
      const { data: newUser, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          email: rpaEmail,
          full_name: 'UiPath RPA System',
          role: 'system',
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating RPA user:', createError);
        throw createError;
      }

      userId = newUser.id;
    }

    // Create incident
    const { data: incident, error: incidentError } = await supabase
      .from('incidents')
      .insert({
        title: title.trim(),
        description: description || '',
        priority: priority || 'medium',
        status: 'submitted',
        tags: tags || [],
        created_by: userId,
      })
      .select('id')
      .single();

    if (incidentError) {
      console.error('Error creating incident:', incidentError);
      throw incidentError;
    }

    // Log to audit
    const { error: auditError } = await supabase
      .from('incident_audit_log')
      .insert({
        incident_id: incident.id,
        action: 'created_via_rpa',
        actor_id: userId,
        details: {
          source: source || 'uipath',
          external_id: external_id,
          timestamp: new Date().toISOString(),
        },
      });

    if (auditError) {
      console.error('Audit log error (non-critical):', auditError);
    }

    // Success response
    return res.status(201).json({
      success: true,
      incident_id: incident.id,
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
