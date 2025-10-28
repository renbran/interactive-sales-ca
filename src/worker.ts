// Cloudflare Workers API for Scholarix CRM
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import { D1Database } from '@cloudflare/workers-types';
import bcrypt from 'bcryptjs';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  ENVIRONMENT: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS middleware
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://your-domain.pages.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// JWT middleware for protected routes
const jwtMiddleware = jwt({
  secret: (c) => c.env.JWT_SECRET,
});

// Utility functions
const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

const generateToken = async (payload: any, secret: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(payload));
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, data);
  const token = btoa(JSON.stringify(payload)) + '.' + btoa(String.fromCharCode(...new Uint8Array(signature)));
  return token;
};

const logActivity = async (db: D1Database, userId: string, entityType: string, entityId: string, action: string) => {
  await db.prepare(`
    INSERT INTO activity_log (id, user_id, entity_type, entity_id, action, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    crypto.randomUUID(),
    userId,
    entityType,
    entityId,
    action,
    new Date().toISOString()
  ).run();
};

// Authentication Routes
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    // Validate user credentials
    const user = await c.env.DB.prepare(`
      SELECT * FROM users WHERE email = ? AND is_active = true
    `).bind(email).first();

    if (!user || !await comparePassword(password, user.password_hash)) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Update last login
    await c.env.DB.prepare(`
      UPDATE users SET last_login = ? WHERE id = ?
    `).bind(new Date().toISOString(), user.id).run();

    // Generate JWT token
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    }, c.env.JWT_SECRET);

    // Log activity
    await logActivity(c.env.DB, user.id, 'auth', user.id, 'login');

    return c.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        isActive: user.is_active === 1
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/auth/logout', jwtMiddleware, async (c) => {
  try {
    const payload = c.get('jwtPayload');
    await logActivity(c.env.DB, payload.userId, 'auth', payload.userId, 'logout');
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// User Management Routes (Admin only)
app.get('/api/admin/users', jwtMiddleware, async (c) => {
  try {
    const payload = c.get('jwtPayload');
    
    if (payload.role !== 'admin') {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    const users = await c.env.DB.prepare(`
      SELECT id, name, email, role, department, phone, is_active, last_login, created_at
      FROM users
      ORDER BY created_at DESC
    `).all();

    return c.json({
      success: true,
      users: users.results.map(user => ({
        ...user,
        isActive: user.is_active === 1
      }))
    });

  } catch (error) {
    console.error('Fetch users error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/admin/users', jwtMiddleware, async (c) => {
  try {
    const payload = c.get('jwtPayload');
    
    if (payload.role !== 'admin') {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    const { name, email, password, role, department, phone } = await c.req.json();

    // Check if email already exists
    const existingUser = await c.env.DB.prepare(`
      SELECT id FROM users WHERE email = ?
    `).bind(email).first();

    if (existingUser) {
      return c.json({ error: 'Email already exists' }, 400);
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();

    // Create user
    await c.env.DB.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, department, phone, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, true, ?, ?)
    `).bind(
      userId,
      name,
      email,
      passwordHash,
      role,
      department || null,
      phone || null,
      new Date().toISOString(),
      new Date().toISOString()
    ).run();

    // Log activity
    await logActivity(c.env.DB, payload.userId, 'user', userId, 'create');

    // Fetch created user
    const newUser = await c.env.DB.prepare(`
      SELECT id, name, email, role, department, phone, is_active, created_at
      FROM users WHERE id = ?
    `).bind(userId).first();

    return c.json({
      success: true,
      user: {
        ...newUser,
        isActive: newUser.is_active === 1
      }
    });

  } catch (error) {
    console.error('Create user error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.patch('/api/admin/users/:id', jwtMiddleware, async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = c.req.param('id');
    
    if (payload.role !== 'admin') {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    const updates = await c.req.json();
    const allowedFields = ['name', 'email', 'role', 'department', 'phone', 'isActive'];
    const updateFields = [];
    const updateValues = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        if (key === 'isActive') {
          updateFields.push('is_active = ?');
          updateValues.push(value ? 1 : 0);
        } else {
          updateFields.push(`${key} = ?`);
          updateValues.push(value);
        }
      }
    }

    if (updateFields.length === 0) {
      return c.json({ error: 'No valid fields to update' }, 400);
    }

    updateFields.push('updated_at = ?');
    updateValues.push(new Date().toISOString());
    updateValues.push(userId);

    await c.env.DB.prepare(`
      UPDATE users SET ${updateFields.join(', ')} WHERE id = ?
    `).bind(...updateValues).run();

    // Log activity
    await logActivity(c.env.DB, payload.userId, 'user', userId, 'update');

    // Fetch updated user
    const updatedUser = await c.env.DB.prepare(`
      SELECT id, name, email, role, department, phone, is_active, updated_at
      FROM users WHERE id = ?
    `).bind(userId).first();

    return c.json({
      success: true,
      user: {
        ...updatedUser,
        isActive: updatedUser.is_active === 1
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Lead Management Routes
app.get('/api/leads', jwtMiddleware, async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const { status, source, assigned_to, search, page = 1, limit = 20 } = c.req.query();

    let query = `
      SELECT l.*, u.name as assigned_to_name
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      WHERE 1=1
    `;
    const params = [];

    // Role-based filtering
    if (payload.role === 'agent') {
      query += ` AND l.assigned_to = ?`;
      params.push(payload.userId);
    }

    // Apply filters
    if (status) {
      query += ` AND l.status = ?`;
      params.push(status);
    }
    if (source) {
      query += ` AND l.source = ?`;
      params.push(source);
    }
    if (assigned_to && payload.role !== 'agent') {
      query += ` AND l.assigned_to = ?`;
      params.push(assigned_to);
    }
    if (search) {
      query += ` AND (l.name LIKE ? OR l.email LIKE ? OR l.phone LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY l.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const leads = await c.env.DB.prepare(query).bind(...params).all();

    return c.json({
      success: true,
      leads: leads.results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Fetch leads error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/leads', jwtMiddleware, async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const leadData = await c.req.json();

    const leadId = crypto.randomUUID();
    const now = new Date().toISOString();

    await c.env.DB.prepare(`
      INSERT INTO leads (
        id, name, email, phone, country, industry, company_size, 
        interest_level, source, status, assigned_to, notes, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      leadId,
      leadData.name,
      leadData.email,
      leadData.phone,
      leadData.country,
      leadData.industry,
      leadData.company_size,
      leadData.interest_level || 'cold',
      leadData.source || 'direct',
      'new',
      leadData.assigned_to || payload.userId,
      leadData.notes || '',
      now,
      now
    ).run();

    // Log activity
    await logActivity(c.env.DB, payload.userId, 'lead', leadId, 'create');

    const newLead = await c.env.DB.prepare(`
      SELECT l.*, u.name as assigned_to_name
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      WHERE l.id = ?
    `).bind(leadId).first();

    return c.json({
      success: true,
      lead: newLead
    });

  } catch (error) {
    console.error('Create lead error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Call Management Routes
app.post('/api/calls', jwtMiddleware, async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const callData = await c.req.json();

    const callId = crypto.randomUUID();
    const now = new Date().toISOString();

    await c.env.DB.prepare(`
      INSERT INTO calls (
        id, lead_id, user_id, status, started_at, duration, 
        outcome, qualification_score, next_steps, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      callId,
      callData.lead_id,
      payload.userId,
      callData.status || 'completed',
      callData.started_at || now,
      callData.duration || 0,
      callData.outcome,
      callData.qualification_score || 0,
      callData.next_steps || '',
      callData.notes || '',
      now
    ).run();

    // Update lead status if call was successful
    if (callData.outcome === 'interested' || callData.outcome === 'demo_booked') {
      await c.env.DB.prepare(`
        UPDATE leads SET status = 'qualified', updated_at = ? WHERE id = ?
      `).bind(now, callData.lead_id).run();
    }

    // Log activity
    await logActivity(c.env.DB, payload.userId, 'call', callId, 'create');

    return c.json({
      success: true,
      call: { id: callId, ...callData }
    });

  } catch (error) {
    console.error('Create call error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Analytics Routes
app.get('/api/admin/activity-log', jwtMiddleware, async (c) => {
  try {
    const payload = c.get('jwtPayload');
    
    if (payload.role !== 'admin') {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    const { limit = 50 } = c.req.query();

    const activities = await c.env.DB.prepare(`
      SELECT a.*, u.name as user_name
      FROM activity_log a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT ?
    `).bind(parseInt(limit)).all();

    return c.json({
      success: true,
      activities: activities.results
    });

  } catch (error) {
    console.error('Fetch activity log error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/api/admin/performance-metrics', jwtMiddleware, async (c) => {
  try {
    const payload = c.get('jwtPayload');
    
    if (payload.role !== 'admin') {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    const metrics = await c.env.DB.prepare(`
      SELECT 
        u.id as user_id,
        u.name as user_name,
        COUNT(DISTINCT c.id) as calls_made,
        COUNT(DISTINCT CASE WHEN c.status = 'completed' THEN c.id END) as calls_connected,
        COUNT(DISTINCT CASE WHEN c.outcome = 'demo_booked' THEN c.id END) as demos_booked,
        COUNT(DISTINCT CASE WHEN l.status = 'closed_won' THEN l.id END) as deals_closed,
        COALESCE(SUM(CASE WHEN l.status = 'closed_won' THEN l.deal_value END), 0) as revenue_generated,
        COALESCE(AVG(c.duration), 0) as avg_call_duration
      FROM users u
      LEFT JOIN calls c ON u.id = c.user_id
      LEFT JOIN leads l ON c.lead_id = l.id
      WHERE u.role IN ('agent', 'manager')
      GROUP BY u.id, u.name
      ORDER BY calls_made DESC
    `).all();

    return c.json({
      success: true,
      metrics: metrics.results
    });

  } catch (error) {
    console.error('Fetch performance metrics error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;