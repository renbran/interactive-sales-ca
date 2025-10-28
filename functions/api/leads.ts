// functions/api/leads.ts
// Lead management API routes

import { Hono } from 'hono';
import type { Env, AuthContext } from '../../src/lib/types';
import { createActivityLog, getPaginationParams, buildWhereClause } from '../index';

export const leadRoutes = new Hono<{ Bindings: Env; Variables: { auth: AuthContext } }>();

// =====================================================
// GET ALL LEADS
// =====================================================

leadRoutes.get('/', async (c) => {
  const auth = c.get('auth');
  const url = new URL(c.req.url);
  const { page, limit, offset } = getPaginationParams(url);

  try {
    // Build filters
    const filters: Record<string, any> = {};
    
    // Only agents see their assigned leads, admins see all
    if (auth.role === 'agent') {
      filters.assigned_to = auth.userId;
    } else if (url.searchParams.get('assigned_to')) {
      filters.assigned_to = parseInt(url.searchParams.get('assigned_to')!);
    }

    if (url.searchParams.get('status')) {
      filters.status = url.searchParams.get('status');
    }
    if (url.searchParams.get('priority')) {
      filters.priority = url.searchParams.get('priority');
    }
    if (url.searchParams.get('source')) {
      filters.source = url.searchParams.get('source');
    }
    if (url.searchParams.get('search')) {
      filters.search = url.searchParams.get('search');
    }

    const { where, params } = buildWhereClause(filters);

    // Get total count
    const countQuery = await c.env.DB.prepare(
      `SELECT COUNT(*) as total FROM leads ${where}`
    ).bind(...params).first();

    const total = (countQuery?.total as number) || 0;

    // Get leads with details
    const leads = await c.env.DB.prepare(`
      SELECT 
        l.*,
        u.full_name as assigned_to_name,
        u.email as assigned_to_email,
        c.full_name as created_by_name,
        (SELECT COUNT(*) FROM calls WHERE lead_id = l.id) as total_calls,
        (SELECT COUNT(*) FROM conversations WHERE lead_id = l.id) as total_conversations,
        (SELECT MAX(call_date) FROM calls WHERE lead_id = l.id) as last_call_date
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      LEFT JOIN users c ON l.created_by = c.id
      ${where}
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(...params, limit, offset).all();

    return c.json({
      data: leads.results,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return c.json({ error: 'Failed to fetch leads' }, 500);
  }
});

// =====================================================
// GET LEAD BY ID
// =====================================================

leadRoutes.get('/:id', async (c) => {
  const auth = c.get('auth');
  const id = parseInt(c.req.param('id'));

  try {
    const lead = await c.env.DB.prepare(`
      SELECT 
        l.*,
        u.full_name as assigned_to_name,
        u.email as assigned_to_email,
        c.full_name as created_by_name,
        (SELECT COUNT(*) FROM calls WHERE lead_id = l.id) as total_calls,
        (SELECT COUNT(*) FROM conversations WHERE lead_id = l.id) as total_conversations,
        (SELECT MAX(call_date) FROM calls WHERE lead_id = l.id) as last_call_date
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      LEFT JOIN users c ON l.created_by = c.id
      WHERE l.id = ?
    `).bind(id).first();

    if (!lead) {
      return c.json({ error: 'Lead not found' }, 404);
    }

    // Check access: agents can only see their assigned leads
    if (auth.role === 'agent' && lead.assigned_to !== auth.userId) {
      return c.json({ error: 'Access denied' }, 403);
    }

    return c.json({ data: lead });
  } catch (error) {
    console.error('Error fetching lead:', error);
    return c.json({ error: 'Failed to fetch lead' }, 500);
  }
});

// =====================================================
// CREATE LEAD
// =====================================================

leadRoutes.post('/', async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json();

  try {
    const {
      name,
      email,
      phone,
      company,
      position,
      source = 'other',
      priority = 'medium',
      estimated_value = 0,
      assigned_to,
      notes,
    } = body;

    // Validation
    if (!name || !phone) {
      return c.json({ error: 'Name and phone are required' }, 400);
    }

    // Agents can only assign to themselves, admins can assign to anyone
    const finalAssignedTo = auth.role === 'agent' ? auth.userId : (assigned_to || auth.userId);

    const result = await c.env.DB.prepare(`
      INSERT INTO leads (
        name, email, phone, company, position, source, priority,
        estimated_value, assigned_to, created_by, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      name,
      email || null,
      phone,
      company || null,
      position || null,
      source,
      priority,
      estimated_value,
      finalAssignedTo,
      auth.userId,
      notes || null
    ).run();

    const leadId = result.meta.last_row_id;

    // Log activity
    await createActivityLog(
      c.env.DB,
      auth.userId,
      'lead_created',
      'lead',
      leadId,
      { name, phone }
    );

    // Fetch created lead
    const lead = await c.env.DB.prepare('SELECT * FROM leads WHERE id = ?')
      .bind(leadId)
      .first();

    return c.json({ data: lead, message: 'Lead created successfully' }, 201);
  } catch (error) {
    console.error('Error creating lead:', error);
    return c.json({ error: 'Failed to create lead' }, 500);
  }
});

// =====================================================
// UPDATE LEAD
// =====================================================

leadRoutes.put('/:id', async (c) => {
  const auth = c.get('auth');
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();

  try {
    // Check if lead exists and user has access
    const existingLead = await c.env.DB.prepare('SELECT * FROM leads WHERE id = ?')
      .bind(id)
      .first();

    if (!existingLead) {
      return c.json({ error: 'Lead not found' }, 404);
    }

    if (auth.role === 'agent' && existingLead.assigned_to !== auth.userId) {
      return c.json({ error: 'Access denied' }, 403);
    }

    // Build update query
    const updates: string[] = [];
    const params: any[] = [];

    const allowedFields = [
      'name', 'email', 'phone', 'company', 'position',
      'status', 'source', 'priority', 'estimated_value',
      'assigned_to', 'next_follow_up', 'notes'
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        // Agents can't change assigned_to
        if (field === 'assigned_to' && auth.role === 'agent') {
          return;
        }
        updates.push(`${field} = ?`);
        params.push(body[field]);
      }
    });

    if (updates.length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }

    params.push(id);

    await c.env.DB.prepare(`
      UPDATE leads SET ${updates.join(', ')} WHERE id = ?
    `).bind(...params).run();

    // Log activity
    await createActivityLog(
      c.env.DB,
      auth.userId,
      'lead_updated',
      'lead',
      id,
      Object.keys(body).reduce((acc, key) => {
        if (allowedFields.includes(key)) acc[key] = body[key];
        return acc;
      }, {} as any)
    );

    // Fetch updated lead
    const lead = await c.env.DB.prepare('SELECT * FROM leads WHERE id = ?')
      .bind(id)
      .first();

    return c.json({ data: lead, message: 'Lead updated successfully' });
  } catch (error) {
    console.error('Error updating lead:', error);
    return c.json({ error: 'Failed to update lead' }, 500);
  }
});

// =====================================================
// DELETE LEAD (Admin only)
// =====================================================

leadRoutes.delete('/:id', async (c) => {
  const auth = c.get('auth');
  
  if (auth.role !== 'admin') {
    return c.json({ error: 'Only admins can delete leads' }, 403);
  }

  const id = parseInt(c.req.param('id'));

  try {
    const lead = await c.env.DB.prepare('SELECT * FROM leads WHERE id = ?')
      .bind(id)
      .first();

    if (!lead) {
      return c.json({ error: 'Lead not found' }, 404);
    }

    await c.env.DB.prepare('DELETE FROM leads WHERE id = ?').bind(id).run();

    // Log activity
    await createActivityLog(
      c.env.DB,
      auth.userId,
      'lead_deleted',
      'lead',
      id,
      { name: lead.name }
    );

    return c.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return c.json({ error: 'Failed to delete lead' }, 500);
  }
});

// =====================================================
// GET LEAD CONVERSATIONS
// =====================================================

leadRoutes.get('/:id/conversations', async (c) => {
  const auth = c.get('auth');
  const id = parseInt(c.req.param('id'));

  try {
    // Check access
    const lead = await c.env.DB.prepare('SELECT * FROM leads WHERE id = ?')
      .bind(id)
      .first();

    if (!lead) {
      return c.json({ error: 'Lead not found' }, 404);
    }

    if (auth.role === 'agent' && lead.assigned_to !== auth.userId) {
      return c.json({ error: 'Access denied' }, 403);
    }

    const conversations = await c.env.DB.prepare(`
      SELECT 
        c.*,
        u.full_name as user_name,
        u.avatar_url as user_avatar
      FROM conversations c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.lead_id = ?
      ORDER BY c.created_at DESC
    `).bind(id).all();

    return c.json({ data: conversations.results });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return c.json({ error: 'Failed to fetch conversations' }, 500);
  }
});
