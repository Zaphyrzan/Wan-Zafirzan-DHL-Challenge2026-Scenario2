/**
 * Vercel Serverless Function: UiPath RPA Integration Endpoint
 * Purpose: Accept incident data from UiPath and create incidents in Supabase
 * Route: POST /api/incidents
 */

import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      error: 'Only POST requests are supported',
    });
  }

  try {
    // Validate API key
    const apiKey = req.headers['x-api-key'] as string;
    const expectedKey = process.env.UIPATH_API_KEY || 'uipath-secret-key-12345';

    if (!apiKey || apiKey !== expectedKey) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        error: 'Invalid or missing API key',
      });
    }

    const { title, description, priority, tags, source, external_id } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: 'Title is required',
      });
    }

    // Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: 'Missing Supabase config',
      });
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

      if (createError) throw createError;
      userId = newUser?.id;
    }

    // Create incident
    const { data: incident, error: incidentError } = await supabase
      .from('incidents')
      .insert({
        title,
        description: description || '',
        priority: priority || 'medium',
        status: 'submitted',
        tags: tags || [],
        created_by: userId,
      })
      .select('id')
      .single();

    if (incidentError) throw incidentError;

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

    return res.status(201).json({
      success: true,
      incident_id: incident?.id,
      message: 'Incident created successfully',
    });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error?.message || 'Unknown error',
    });
  }
}
