// functions/index.ts
// Main Cloudflare Worker entry point with API routing

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createClerkClient } from '@clerk/backend';
import type { Env, AuthContext } from '../src/lib/types';

// Import route handlers
import { authRoutes } from './api/auth';
import { leadRoutes } from './api/leads';
import { callRoutes } from './api/calls';
import { recordingRoutes } from './api/recordings';

// =====================================================
// CREATE HONO APP
// =====================================================

const app = new Hono<{ Bindings: Env; Variables: { auth: AuthContext } }>();

// =====================================================
// MIDDLEWARE
// =====================================================

// CORS - Use environment variable for production, fallback to dev origins
app.use('*', cors({
  origin: (origin, c) => {
    // Get CORS_ORIGIN from environment (set in wrangler.toml)
    const envCorsOrigin = c.env?.CORS_ORIGIN;

    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://interactive-sales-ca.pages.dev',
      'https://scholarix-crm.pages.dev',
      ...(envCorsOrigin ? [envCorsOrigin] : []),
    ];

    return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  },
  credentials: true,
}));

// Logger
app.use('*', logger());

// =====================================================
// AUTH MIDDLEWARE (Clerk JWT verification)
// =====================================================

app.use('/api/*', async (c, next) => {
  // Skip auth for public endpoints
  const publicPaths = ['/api/auth/sync', '/api/health'];
  if (publicPaths.includes(c.req.path)) {
    return next();
  }

  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized', message: 'No token provided' }, 401);
  }

  const token = authHeader.substring(7);

  try {
    // Verify Clerk JWT token using official @clerk/backend SDK
    const CLERK_SECRET_KEY = c.env.CLERK_SECRET_KEY;

    if (!CLERK_SECRET_KEY) {
      console.error('CLERK_SECRET_KEY not configured');
      return c.json({ error: 'Server misconfiguration', message: 'Auth not configured' }, 500);
    }

    // Initialize Clerk client
    const clerk = createClerkClient({
      secretKey: CLERK_SECRET_KEY,
    });

    // Verify the session token
    const verifiedToken = await clerk.verifyToken(token, {
      jwtKey: CLERK_SECRET_KEY,
    });

    if (!verifiedToken || !verifiedToken.sub) {
      console.error('Token verification failed: Invalid token or missing subject');
      return c.json({ error: 'Unauthorized', message: 'Invalid token' }, 401);
    }

    const clerkUserId = verifiedToken.sub;
    console.log('✅ Token verified for user:', clerkUserId);

    // Get user from database
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE clerk_id = ?'
    ).bind(clerkUserId).first();

    if (!user) {
      console.error('User not found in database:', clerkUserId);
      return c.json({
        error: 'User not found',
        message: 'Please sync your account first. Sign out and sign back in.'
      }, 404);
    }

    console.log('✅ User found in database:', user.email);

    // Set auth context
    c.set('auth', {
      userId: user.id as number,
      clerkId: user.clerk_id as string,
      email: user.email as string,
      role: user.role as 'admin' | 'agent',
    });

    // Update last login
    await c.env.DB.prepare(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(user.id).run();

    return next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Token verification failed';
    return c.json({
      error: 'Unauthorized',
      message: errorMessage,
      hint: 'Try signing out and back in'
    }, 401);
  }
});

// =====================================================
// ROLE-BASED ACCESS CONTROL MIDDLEWARE
// =====================================================

function requireRole(...roles: ('admin' | 'agent')[]) {
  return async (c: any, next: () => Promise<void>) => {
    const auth = c.get('auth') as AuthContext;
    
    if (!roles.includes(auth.role)) {
      return c.json({ 
        error: 'Forbidden', 
        message: 'You do not have permission to access this resource' 
      }, 403);
    }

    return next();
  };
}

// =====================================================
// ROUTES
// =====================================================

// Health check
app.get('/', (c) => {
  return c.json({ 
    message: 'Scholarix CRM API', 
    version: '1.0.0',
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount route handlers
app.route('/api/auth', authRoutes);
app.route('/api/leads', leadRoutes);
app.route('/api/calls', callRoutes);
app.route('/api/recordings', recordingRoutes);

// =====================================================
// ERROR HANDLER
// =====================================================

app.onError((err, c) => {
  console.error('Application error:', err);
  
  return c.json({
    error: 'Internal Server Error',
    message: err.message,
    ...(c.env.ENVIRONMENT === 'development' && { stack: err.stack }),
  }, 500);
});

// =====================================================
// NOT FOUND HANDLER
// =====================================================

app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    message: `Route ${c.req.path} not found`,
  }, 404);
});

// =====================================================
// EXPORT WORKER
// =====================================================

export default app;

// For local development with Wrangler
export { app as fetch };

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

// Create activity log helper
export async function createActivityLog(
  db: D1Database,
  userId: number,
  action: string,
  entityType: string,
  entityId?: number,
  details?: any
) {
  return db.prepare(`
    INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    userId,
    action,
    entityType,
    entityId || null,
    details ? JSON.stringify(details) : null
  ).run();
}

// Pagination helper
export function getPaginationParams(url: URL) {
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
}

// Build WHERE clause from filters
export function buildWhereClause(filters: Record<string, any>): { where: string; params: any[] } {
  const conditions: string[] = [];
  const params: any[] = [];

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value) && value.length > 0) {
        conditions.push(`${key} IN (${value.map(() => '?').join(', ')})`);
        params.push(...value);
      } else if (typeof value === 'string' && key === 'search') {
        conditions.push(`(name LIKE ? OR email LIKE ? OR phone LIKE ?)`);
        params.push(`%${value}%`, `%${value}%`, `%${value}%`);
      } else {
        conditions.push(`${key} = ?`);
        params.push(value);
      }
    }
  });

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { where, params };
}
