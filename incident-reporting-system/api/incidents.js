/**
 * Vercel Serverless Function: DHL Incident API
 * Route: POST /api/incidents
 * Purpose: Accept incident data from UiPath and create incidents in Supabase
 */

const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // Validate API key
    const apiKey = req.headers['x-api-key'];
    const expectedKey = process.env.UIPATH_API_KEY || 'uipath-secret-key-12345';

    if (apiKey !== expectedKey) {
      return res.status(401).json({ error: 'Unauthorized - Invalid API key' });
    }

    const { title, description, priority, tags, source, external_id } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Missing required field: title' });
    }

    // Initialize Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase config');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get or create RPA system user
    const rpaEmail = 'rpa@dhl-incident-system.internal';
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', rpaEmail)
      .maybeSingle();

    let userId = existingUser?.id;

    if (!userId) {
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
        return res.status(500).json({ error: 'Failed to create system user' });
      }
      userId = newUser?.id;
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
      return res.status(500).json({ error: 'Failed to create incident: ' + incidentError.message });
    }

    // Log audit entry
    await supabase.from('incident_audit_log').insert({
      incident_id: incident?.id,
      action: 'created_via_rpa',
      actor_id: userId,
      details: {
        source: source || 'uipath',
        external_id: external_id,
        timestamp: new Date().toISOString(),
      },
    });

    // Success response
    return res.status(201).json({
      success: true,
      incident_id: incident?.id,
      message: `Incident "${title}" created successfully via RPA`,
      data: {
        id: incident?.id,
        title,
        description,
        priority,
        tags,
        source,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error?.message || 'Unknown error',
    });
  }
};
