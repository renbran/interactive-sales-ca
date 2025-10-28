// functions/api/calls.ts
// Call management API routes

import { Hono } from 'hono';
import type { Env, AuthContext } from '../../src/lib/types';
import { createActivityLog, getPaginationParams, buildWhereClause } from '../index';

export const callRoutes = new Hono<{ Bindings: Env; Variables: { auth: AuthContext } }>();

// =====================================================
// GET ALL CALLS
// =====================================================

callRoutes.get('/', async (c) => {
  const auth = c.get('auth');
  const url = new URL(c.req.url);
  const { page, limit, offset } = getPaginationParams(url);

  try {
    const filters: Record<string, any> = {};

    // Agents see only their calls, admins see all
    if (auth.role === 'agent') {
      filters.user_id = auth.userId;
    } else if (url.searchParams.get('user_id')) {
      filters.user_id = parseInt(url.searchParams.get('user_id')!);
    }

    if (url.searchParams.get('lead_id')) {
      filters.lead_id = parseInt(url.searchParams.get('lead_id')!);
    }
    if (url.searchParams.get('outcome')) {
      filters.outcome = url.searchParams.get('outcome');
    }

    const { where, params } = buildWhereClause(filters);

    // Get total count
    const countQuery = await c.env.DB.prepare(
      `SELECT COUNT(*) as total FROM calls ${where}`
    ).bind(...params).first();

    const total = (countQuery?.total as number) || 0;

    // Get calls with details
    const calls = await c.env.DB.prepare(`
      SELECT 
        c.*,
        l.name as lead_name,
        l.company as lead_company,
        u.full_name as user_name
      FROM calls c
      LEFT JOIN leads l ON c.lead_id = l.id
      LEFT JOIN users u ON c.user_id = u.id
      ${where}
      ORDER BY c.call_date DESC
      LIMIT ? OFFSET ?
    `).bind(...params, limit, offset).all();

    return c.json({
      data: calls.results,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching calls:', error);
    return c.json({ error: 'Failed to fetch calls' }, 500);
  }
});

// =====================================================
// GET CALL BY ID
// =====================================================

callRoutes.get('/:id', async (c) => {
  const auth = c.get('auth');
  const id = parseInt(c.req.param('id'));

  try {
    const call = await c.env.DB.prepare(`
      SELECT 
        c.*,
        l.name as lead_name,
        l.company as lead_company,
        u.full_name as user_name
      FROM calls c
      LEFT JOIN leads l ON c.lead_id = l.id
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `).bind(id).first();

    if (!call) {
      return c.json({ error: 'Call not found' }, 404);
    }

    // Agents can only see their own calls
    if (auth.role === 'agent' && call.user_id !== auth.userId) {
      return c.json({ error: 'Access denied' }, 403);
    }

    return c.json({ data: call });
  } catch (error) {
    console.error('Error fetching call:', error);
    return c.json({ error: 'Failed to fetch call' }, 500);
  }
});

// =====================================================
// CREATE CALL
// =====================================================

callRoutes.post('/', async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json();

  try {
    const {
      lead_id,
      call_date = new Date().toISOString(),
      duration = 0,
      outcome,
      notes,
      recording_url,
      recording_duration,
      script_used,
      sentiment,
      next_action,
    } = body;

    // Validation
    if (!lead_id || !outcome) {
      return c.json({ error: 'lead_id and outcome are required' }, 400);
    }

    // Check lead access
    const lead = await c.env.DB.prepare('SELECT * FROM leads WHERE id = ?')
      .bind(lead_id)
      .first();

    if (!lead) {
      return c.json({ error: 'Lead not found' }, 404);
    }

    if (auth.role === 'agent' && lead.assigned_to !== auth.userId) {
      return c.json({ error: 'You can only log calls for your assigned leads' }, 403);
    }

    // Create call
    const result = await c.env.DB.prepare(`
      INSERT INTO calls (
        lead_id, user_id, call_date, duration, outcome, notes,
        recording_url, recording_duration, script_used, sentiment, next_action
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      lead_id,
      auth.userId,
      call_date,
      duration,
      outcome,
      notes || null,
      recording_url || null,
      recording_duration || null,
      script_used || null,
      sentiment || null,
      next_action || null
    ).run();

    const callId = result.meta.last_row_id;

    // Log activity
    await createActivityLog(
      c.env.DB,
      auth.userId,
      'call_logged',
      'call',
      callId,
      { lead_id, outcome, duration }
    );

    // Fetch created call
    const call = await c.env.DB.prepare('SELECT * FROM calls WHERE id = ?')
      .bind(callId)
      .first();

    return c.json({ data: call, message: 'Call logged successfully' }, 201);
  } catch (error) {
    console.error('Error creating call:', error);
    return c.json({ error: 'Failed to log call' }, 500);
  }
});

// =====================================================
// UPDATE CALL
// =====================================================

callRoutes.put('/:id', async (c) => {
  const auth = c.get('auth');
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();

  try {
    // Check if call exists and user has access
    const existingCall = await c.env.DB.prepare('SELECT * FROM calls WHERE id = ?')
      .bind(id)
      .first();

    if (!existingCall) {
      return c.json({ error: 'Call not found' }, 404);
    }

    if (existingCall.user_id !== auth.userId && auth.role !== 'admin') {
      return c.json({ error: 'You can only edit your own calls' }, 403);
    }

    // Build update query
    const updates: string[] = [];
    const params: any[] = [];

    const allowedFields = ['duration', 'outcome', 'notes', 'sentiment', 'next_action'];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(body[field]);
      }
    });

    if (updates.length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }

    params.push(id);

    await c.env.DB.prepare(`
      UPDATE calls SET ${updates.join(', ')} WHERE id = ?
    `).bind(...params).run();

    // Log activity
    await createActivityLog(
      c.env.DB,
      auth.userId,
      'call_updated',
      'call',
      id,
      body
    );

    // Fetch updated call
    const call = await c.env.DB.prepare('SELECT * FROM calls WHERE id = ?')
      .bind(id)
      .first();

    return c.json({ data: call, message: 'Call updated successfully' });
  } catch (error) {
    console.error('Error updating call:', error);
    return c.json({ error: 'Failed to update call' }, 500);
  }
});

// =====================================================
// DELETE CALL
// =====================================================

callRoutes.delete('/:id', async (c) => {
  const auth = c.get('auth');
  const id = parseInt(c.req.param('id'));

  try {
    const call = await c.env.DB.prepare('SELECT * FROM calls WHERE id = ?')
      .bind(id)
      .first();

    if (!call) {
      return c.json({ error: 'Call not found' }, 404);
    }

    // Only allow user to delete their own calls, or admin to delete any
    if (call.user_id !== auth.userId && auth.role !== 'admin') {
      return c.json({ error: 'You can only delete your own calls' }, 403);
    }

    await c.env.DB.prepare('DELETE FROM calls WHERE id = ?').bind(id).run();

    // Log activity
    await createActivityLog(
      c.env.DB,
      auth.userId,
      'call_deleted',
      'call',
      id,
      { lead_id: call.lead_id }
    );

    return c.json({ message: 'Call deleted successfully' });
  } catch (error) {
    console.error('Error deleting call:', error);
    return c.json({ error: 'Failed to delete call' }, 500);
  }
});

// =====================================================
// UPLOAD CALL RECORDING
// =====================================================

callRoutes.post('/:id/recording', async (c) => {
  const auth = c.get('auth');
  const id = parseInt(c.req.param('id'));

  try {
    // Check if call exists and user has access
    const call = await c.env.DB.prepare('SELECT * FROM calls WHERE id = ?')
      .bind(id)
      .first();

    if (!call) {
      return c.json({ error: 'Call not found' }, 404);
    }

    if (call.user_id !== auth.userId && auth.role !== 'admin') {
      return c.json({ error: 'Access denied' }, 403);
    }

    // Get file from request
    const formData = await c.req.formData();
    const file = formData.get('recording') as File;

    if (!file) {
      return c.json({ error: 'No recording file provided' }, 400);
    }

    // Upload to R2
    const fileKey = `recordings/${call.lead_id}/${id}-${Date.now()}.${file.name.split('.').pop()}`;
    await c.env.RECORDINGS.put(fileKey, file.stream());

    // Generate public URL
    const recordingUrl = `https://recordings.scholarix.com/${fileKey}`;

    // Update call with recording URL
    await c.env.DB.prepare('UPDATE calls SET recording_url = ? WHERE id = ?')
      .bind(recordingUrl, id)
      .run();

    // Log activity
    await createActivityLog(
      c.env.DB,
      auth.userId,
      'recording_uploaded',
      'call',
      id,
      { url: recordingUrl }
    );

    return c.json({ 
      data: { url: recordingUrl }, 
      message: 'Recording uploaded successfully' 
    });
  } catch (error) {
    console.error('Error uploading recording:', error);
    return c.json({ error: 'Failed to upload recording' }, 500);
  }
});
