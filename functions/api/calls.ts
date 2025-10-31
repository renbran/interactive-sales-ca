// functions/api/calls.ts
// Call management API routes

import { Hono } from 'hono';
import type { Env, AuthContext } from '../../src/lib/types';
import { createActivityLog, getPaginationParams, buildWhereClause } from '../index';
import { createTranscriptionService } from '../services/transcription';

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

// =====================================================
// TRANSCRIBE CALL RECORDING
// =====================================================

callRoutes.post('/:id/transcribe', async (c) => {
  const auth = c.get('auth');
  const id = parseInt(c.req.param('id'));
  const transcriptionService = new TranscriptionService(c.env.OPENAI_API_KEY);

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

    if (!call.recording_url) {
      return c.json({ error: 'No recording found for this call' }, 400);
    }

    // Update call status to transcribing
    await c.env.DB.prepare('UPDATE calls SET transcription_status = ? WHERE id = ?')
      .bind('processing', id)
      .run();

    // Process transcription asynchronously
    try {
      const transcriptionResult = await transcriptionService.transcribeCall(
        call.recording_url,
        id,
        call.lead_id
      );

      // Store transcription results
      await c.env.DB.prepare(`
        UPDATE calls 
        SET transcription = ?, 
            transcription_status = ?,
            sentiment_score = ?,
            key_topics = ?,
            action_items = ?,
            next_steps = ?,
            call_quality_score = ?,
            transcription_summary = ?
        WHERE id = ?
      `).bind(
        JSON.stringify(transcriptionResult.transcript),
        'completed',
        transcriptionResult.sentiment.score,
        JSON.stringify(transcriptionResult.keyTopics),
        JSON.stringify(transcriptionResult.actionItems),
        JSON.stringify(transcriptionResult.nextSteps),
        transcriptionResult.qualityScore,
        transcriptionResult.summary,
        id
      ).run();

      // Store segments
      for (const segment of transcriptionResult.segments) {
        await c.env.DB.prepare(`
          INSERT INTO transcription_segments 
          (call_id, segment_id, start_time, end_time, speaker, text, confidence)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
          id,
          segment.id,
          segment.start,
          segment.end,
          segment.speaker,
          segment.text,
          segment.confidence
        ).run();
      }

      // Store analytics
      await c.env.DB.prepare(`
        INSERT INTO call_analytics 
        (call_id, talk_time_ratio, interruptions, speaking_pace, sentiment_trend, engagement_score)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        transcriptionResult.analytics.talkTimeRatio,
        transcriptionResult.analytics.interruptions,
        transcriptionResult.analytics.speakingPace,
        JSON.stringify(transcriptionResult.analytics.sentimentTrend),
        transcriptionResult.analytics.engagementScore
      ).run();

      // Log activity
      await createActivityLog(
        c.env.DB,
        auth.userId,
        'transcription_completed',
        'call',
        id,
        { 
          sentiment: transcriptionResult.sentiment.label,
          topics: transcriptionResult.keyTopics.length,
          quality: transcriptionResult.qualityScore 
        }
      );

      return c.json({ 
        data: transcriptionResult, 
        message: 'Call transcribed successfully' 
      });

    } catch (transcriptionError) {
      // Update status to failed
      await c.env.DB.prepare('UPDATE calls SET transcription_status = ? WHERE id = ?')
        .bind('failed', id)
        .run();
      
      throw transcriptionError;
    }

  } catch (error) {
    console.error('Error transcribing call:', error);
    return c.json({ error: 'Failed to transcribe call' }, 500);
  }
});

// =====================================================
// GET CALL TRANSCRIPTION
// =====================================================

callRoutes.get('/:id/transcription', async (c) => {
  const auth = c.get('auth');
  const id = parseInt(c.req.param('id'));

  try {
    // Check if call exists and user has access
    const call = await c.env.DB.prepare(`
      SELECT c.*, 
             GROUP_CONCAT(ts.segment_id || ':' || ts.start_time || ':' || ts.end_time || ':' || ts.speaker || ':' || ts.text || ':' || ts.confidence, '|') as segments
      FROM calls c
      LEFT JOIN transcription_segments ts ON c.id = ts.call_id
      WHERE c.id = ?
      GROUP BY c.id
    `).bind(id).first();

    if (!call) {
      return c.json({ error: 'Call not found' }, 404);
    }

    if (call.user_id !== auth.userId && auth.role !== 'admin') {
      return c.json({ error: 'Access denied' }, 403);
    }

    // Get analytics
    const analytics = await c.env.DB.prepare('SELECT * FROM call_analytics WHERE call_id = ?')
      .bind(id)
      .first();

    // Parse segments
    const segments = call.segments ? call.segments.split('|').map(seg => {
      const [segmentId, start, end, speaker, text, confidence] = seg.split(':');
      return {
        id: parseInt(segmentId),
        start: parseFloat(start),
        end: parseFloat(end),
        speaker,
        text,
        confidence: parseFloat(confidence)
      };
    }) : [];

    const transcriptionData = {
      status: call.transcription_status,
      transcript: call.transcription ? JSON.parse(call.transcription) : null,
      summary: call.transcription_summary,
      sentiment: {
        score: call.sentiment_score,
        label: call.sentiment_score > 0.1 ? 'positive' : call.sentiment_score < -0.1 ? 'negative' : 'neutral'
      },
      keyTopics: call.key_topics ? JSON.parse(call.key_topics) : [],
      actionItems: call.action_items ? JSON.parse(call.action_items) : [],
      nextSteps: call.next_steps ? JSON.parse(call.next_steps) : [],
      qualityScore: call.call_quality_score,
      segments,
      analytics
    };

    return c.json({ data: transcriptionData });
  } catch (error) {
    console.error('Error getting transcription:', error);
    return c.json({ error: 'Failed to get transcription' }, 500);
  }
});
