import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
      sender,
      file_content,
      file_name,
      file_type
  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
      // include sender when provided (some schemas include a sender column)
      ...(sender ? { sender } : {}),

  try {
    // API key validation
    const apiKey = req.headers['x-api-key'] as string;
    const expectedKey = process.env.UIPATH_API_KEY || 'uipath-secret-key-12345';

    if (apiKey !== expectedKey) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, description, priority, tags, source, external_id } = req.body;

    // Validate
    if (!title?.trim()) {
      return res.status(400).json({ error: 'Title required' });
    }

    // Supabase setup
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get or create RPA user
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
      return res.status(500).json({ error: `Failed to create incident: ${incidentError.message}` });
    }

    // Audit log
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

    // Success
    return res.status(201).json({
      success: true,
      incident_id: incident?.id,
      message: 'Incident created successfully',
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
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error?.message,
    });
  }
}
