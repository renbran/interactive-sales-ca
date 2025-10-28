// functions/api/auth.ts
// Authentication and user sync API routes

import { Hono } from 'hono';
import type { Env } from '../../src/lib/types';

export const authRoutes = new Hono<{ Bindings: Env }>();

// =====================================================
// SYNC USER FROM CLERK TO DATABASE
// =====================================================
// This endpoint is called after a user signs up in Clerk
// to create their record in our database

authRoutes.post('/sync', async (c) => {
  try {
    const body = await c.req.json();
    const { clerk_id, email, full_name, role = 'agent' } = body;

    // Validation
    if (!clerk_id || !email || !full_name) {
      return c.json({ 
        error: 'Missing required fields', 
        message: 'clerk_id, email, and full_name are required' 
      }, 400);
    }

    // Check if user already exists
    const existingUser = await c.env.DB.prepare(
      'SELECT * FROM users WHERE clerk_id = ? OR email = ?'
    ).bind(clerk_id, email).first();

    if (existingUser) {
      return c.json({ 
        data: existingUser, 
        message: 'User already exists' 
      });
    }

    // Create user
    const result = await c.env.DB.prepare(`
      INSERT INTO users (clerk_id, email, full_name, role)
      VALUES (?, ?, ?, ?)
    `).bind(clerk_id, email, full_name, role).run();

    const userId = result.meta.last_row_id;

    // Fetch created user
    const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?')
      .bind(userId)
      .first();

    return c.json({ 
      data: user, 
      message: 'User synced successfully' 
    }, 201);
  } catch (error) {
    console.error('Error syncing user:', error);
    return c.json({ 
      error: 'Failed to sync user', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// =====================================================
// CLERK WEBHOOK HANDLER (Optional)
// =====================================================
// Automatically sync users when they sign up in Clerk

authRoutes.post('/webhook', async (c) => {
  try {
    const body = await c.req.json();
    const { type, data } = body;

    switch (type) {
      case 'user.created':
        // Sync new user to database
        const { id, email_addresses, first_name, last_name } = data;
        const email = email_addresses[0]?.email_address;
        const full_name = `${first_name} ${last_name}`.trim();

        if (!email || !full_name) {
          return c.json({ error: 'Missing user data' }, 400);
        }

        await c.env.DB.prepare(`
          INSERT INTO users (clerk_id, email, full_name, role)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(clerk_id) DO NOTHING
        `).bind(id, email, full_name, 'agent').run();

        return c.json({ message: 'User created' });

      case 'user.updated':
        // Update user in database
        const { id: userId, email_addresses: emails, first_name: fName, last_name: lName } = data;
        const updatedEmail = emails[0]?.email_address;
        const updatedName = `${fName} ${lName}`.trim();

        await c.env.DB.prepare(`
          UPDATE users 
          SET email = ?, full_name = ?, updated_at = CURRENT_TIMESTAMP
          WHERE clerk_id = ?
        `).bind(updatedEmail, updatedName, userId).run();

        return c.json({ message: 'User updated' });

      case 'user.deleted':
        // Soft delete user
        await c.env.DB.prepare(`
          UPDATE users 
          SET is_active = 0, updated_at = CURRENT_TIMESTAMP
          WHERE clerk_id = ?
        `).bind(data.id).run();

        return c.json({ message: 'User deleted' });

      default:
        return c.json({ message: 'Event not handled' });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

// =====================================================
// GET CURRENT USER INFO
// =====================================================

authRoutes.get('/me', async (c) => {
  const auth = c.get('auth');

  try {
    const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?')
      .bind(auth.userId)
      .first();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return c.json({ error: 'Failed to fetch user' }, 500);
  }
});
