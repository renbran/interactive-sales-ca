# 🏗️ Data Integration & Synchronization Architecture

## Executive Summary

This document outlines the comprehensive architecture for integrating and synchronizing data across all layers of the Scholarix CRM application. It ensures data consistency, real-time updates, offline capabilities, and a robust data flow between Frontend → Backend → Database → Storage.

**Goals:**
- ✅ Always-synced data across all layers
- ✅ Real-time updates via WebSocket
- ✅ Offline-first architecture with conflict resolution
- ✅ Type-safe data contracts
- ✅ Optimistic UI updates
- ✅ Comprehensive error handling
- ✅ Audit trail for all operations

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  React Components                                            │
│       ↓↑                                                     │
│  Custom Hooks (useLeads, useCalls, useAnalytics)           │
│       ↓↑                                                     │
│  React Query (5min cache, optimistic updates)              │
│       ↓↑                                                     │
│  API Client + WebSocket Manager                             │
└─────────────────────────────────────────────────────────────┘
                         ↓↑ HTTPS/WSS
┌─────────────────────────────────────────────────────────────┐
│                  CLOUDFLARE WORKERS LAYER                   │
├─────────────────────────────────────────────────────────────┤
│  Hono API Server                                            │
│    • CORS Middleware                                        │
│    • Logger Middleware                                      │
│    • Clerk JWT Auth Middleware                             │
│    • Request Validation (Zod)                              │
│       ↓↑                                                     │
│  Route Handlers                                             │
│    • /api/auth    → Auth operations                        │
│    • /api/leads   → Lead CRUD                              │
│    • /api/calls   → Call management                        │
│    • /api/recordings → R2 storage operations              │
│       ↓↑                                                     │
│  Business Logic Layer                                       │
│    • Data validation                                        │
│    • Access control                                         │
│    • Activity logging                                       │
│    • Real-time broadcasting                                 │
└─────────────────────────────────────────────────────────────┘
                         ↓↑
┌──────────────────────────┐  ┌──────────────────────────────┐
│   CLOUDFLARE D1 (SQLite) │  │    CLOUDFLARE R2 STORAGE     │
│                          │  │                              │
│  • users                 │  │  • Call recordings (audio)   │
│  • leads                 │  │  • Transcription files       │
│  • calls                 │  │  • Analytics exports         │
│  • conversations         │  │  • Document attachments      │
│  • activity_log          │  │                              │
│  • call_analytics        │  │  Bucket: scholarix-recordings│
│  • transcription_segments│  │                              │
└──────────────────────────┘  └──────────────────────────────┘
```

---

## 🔄 Data Flow Patterns

### 1. **Create Operation (POST)**

```typescript
// EXAMPLE: Creating a new lead

// 1. User submits form in React component
const handleCreateLead = async (data: CreateLeadInput) => {
  await createLeadMutation.mutateAsync(data);
};

// 2. React Query optimistic update
const createLeadMutation = useMutation({
  mutationFn: (data: CreateLeadInput) => apiClient.post('/leads', data),
  
  // Optimistically add to UI immediately
  onMutate: async (newLead) => {
    await queryClient.cancelQueries({ queryKey: ['leads'] });
    const previous = queryClient.getQueryData(['leads']);
    
    queryClient.setQueryData(['leads'], (old: any) => ({
      ...old,
      data: [{ ...newLead, id: 'temp-' + Date.now() }, ...old.data]
    }));
    
    return { previous };
  },
  
  // On success, replace temp ID with real ID
  onSuccess: (newLead) => {
    queryClient.invalidateQueries({ queryKey: ['leads'] });
    
    // Broadcast to WebSocket for other users
    websocket.send({
      type: 'lead_created',
      data: newLead
    });
  },
  
  // On error, rollback optimistic update
  onError: (err, newLead, context) => {
    queryClient.setQueryData(['leads'], context.previous);
    toast.error('Failed to create lead');
  }
});

// 3. API receives request
// functions/api/leads.ts
leadRoutes.post('/', async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json();
  
  // Validate with Zod
  const validated = createLeadSchema.parse(body);
  
  // Insert into D1 database
  const result = await c.env.DB.prepare(`
    INSERT INTO leads (name, email, phone, company, industry, status, 
                       assigned_to, created_by, source, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING *
  `).bind(
    validated.name,
    validated.email,
    validated.phone,
    validated.company,
    validated.industry,
    'new',
    validated.assignedTo || auth.userId,
    auth.userId,
    validated.source,
    validated.notes
  ).first();
  
  // Log activity
  await createActivityLog(c.env.DB, {
    userId: auth.userId,
    entityType: 'lead',
    entityId: result.id,
    action: 'created',
    newValues: JSON.stringify(result)
  });
  
  // Broadcast to WebSocket subscribers
  await c.env.WEBSOCKET?.send({
    type: 'lead_created',
    data: result,
    userId: auth.userId
  });
  
  return c.json({ data: result }, 201);
});

// 4. Database persists data
// D1 executes INSERT and returns new record with generated ID

// 5. Real-time sync to other clients
// WebSocket message received by other users
useWebSocketMessages((message) => {
  if (message.type === 'lead_created') {
    queryClient.invalidateQueries({ queryKey: ['leads'] });
    toast.info(`New lead: ${message.data.name}`);
  }
});
```

### 2. **Read Operation (GET)**

```typescript
// Stale-while-revalidate pattern with React Query

// Hook usage
const { data: leads, isLoading } = useLeads({
  status: 'new',
  assignedTo: userId
});

// React Query config (already implemented)
export const useLeads = (filters?: LeadFilters) => {
  return useQuery({
    queryKey: queryKeys.leads.list(filters),
    queryFn: () => apiClient.get('/leads', { params: filters }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });
};

// API endpoint (already implemented in functions/api/leads.ts)
// Returns paginated data with relationships
```

### 3. **Update Operation (PUT/PATCH)**

```typescript
// Optimistic update with rollback on error

const updateLeadMutation = useMutation({
  mutationFn: ({ id, data }: { id: string; data: UpdateLeadInput }) => 
    apiClient.patch(`/leads/${id}`, data),
  
  onMutate: async ({ id, data }) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['leads'] });
    
    // Snapshot current value
    const previous = queryClient.getQueryData(['leads', id]);
    
    // Optimistically update
    queryClient.setQueryData(['leads', id], (old: any) => ({
      ...old,
      ...data,
      updatedAt: new Date().toISOString()
    }));
    
    return { previous };
  },
  
  onSuccess: (updated) => {
    queryClient.invalidateQueries({ queryKey: ['leads'] });
    
    // Broadcast update
    websocket.send({
      type: 'lead_updated',
      data: updated
    });
  },
  
  onError: (err, { id }, context) => {
    // Rollback on error
    queryClient.setQueryData(['leads', id], context.previous);
  }
});
```

### 4. **Delete Operation (DELETE)**

```typescript
// Soft delete with optimistic removal

const deleteLeadMutation = useMutation({
  mutationFn: (id: string) => apiClient.delete(`/leads/${id}`),
  
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: ['leads'] });
    const previous = queryClient.getQueryData(['leads']);
    
    // Remove from UI immediately
    queryClient.setQueryData(['leads'], (old: any) => ({
      ...old,
      data: old.data.filter((lead: Lead) => lead.id !== id)
    }));
    
    return { previous };
  },
  
  onSuccess: (_, id) => {
    toast.success('Lead deleted');
    
    websocket.send({
      type: 'lead_deleted',
      data: { id }
    });
  },
  
  onError: (err, id, context) => {
    queryClient.setQueryData(['leads'], context.previous);
    toast.error('Failed to delete lead');
  }
});
```

---

## 🛠️ Implementation Phases

### **Phase 1: Database Setup (Day 1-2)**

#### Step 1.1: Review and Prepare Migrations
```bash
# Check current database status
wrangler d1 info scholarix-crm-db

# Review migration files
cat migrations/0001_initial_schema.sql
cat migrations/0002_add_transcription.sql
```

#### Step 1.2: Execute Migrations
```bash
# Execute initial schema (creates all tables)
wrangler d1 execute scholarix-crm-db --remote --file=migrations/0001_initial_schema.sql

# Execute transcription enhancement
wrangler d1 execute scholarix-crm-db --remote --file=migrations/0002_add_transcription.sql

# Verify tables created
wrangler d1 execute scholarix-crm-db --remote --command="SELECT name FROM sqlite_master WHERE type='table';"
```

#### Step 1.3: Seed Initial Data (Optional)
```sql
-- Create test admin user (already in schema)
-- Create sample leads for testing
INSERT INTO leads (name, email, phone, company, industry, status, source)
VALUES 
  ('John Doe', 'john@example.com', '+1234567890', 'Tech Corp', 'real-estate', 'new', 'web'),
  ('Jane Smith', 'jane@example.com', '+0987654321', 'Retail Inc', 'retail', 'contacted', 'referral');
```

#### Step 1.4: Setup Environment Secrets
```bash
# Add Clerk authentication keys
wrangler secret put CLERK_SECRET_KEY
wrangler secret put CLERK_PUBLISHABLE_KEY

# Add OpenAI API key for transcription
wrangler secret put OPENAI_API_KEY

# Add encryption key for sensitive data
wrangler secret put ENCRYPTION_KEY

# Verify secrets
wrangler secret list
```

---

### **Phase 2: Backend API Implementation (Day 3-5)**

#### Step 2.1: Add Request Validation with Zod

Create `functions/lib/validation.ts`:
```typescript
import { z } from 'zod';

// Lead validation schemas
export const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional(),
  phone: z.string().min(10, 'Valid phone required'),
  company: z.string().optional(),
  industry: z.enum(['real-estate', 'retail', 'trading', 'logistics', 'consulting']).optional(),
  source: z.string().optional(),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
  estimatedValue: z.number().optional(),
  probability: z.number().min(0).max(100).optional()
});

export const updateLeadSchema = createLeadSchema.partial();

// Call validation schemas
export const createCallSchema = z.object({
  leadId: z.string().uuid('Invalid lead ID'),
  callType: z.enum(['outbound', 'inbound']),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  outcome: z.enum(['demo-booked', 'follow-up-scheduled', 'not-interested', 'no-answer', 'busy', 'callback-requested']).optional(),
  notes: z.string().optional(),
  nextAction: z.string().optional(),
  nextActionDate: z.string().datetime().optional()
});

export const updateCallSchema = createCallSchema.partial();

// User validation schemas
export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['admin', 'manager', 'agent']),
  phone: z.string().optional(),
  department: z.string().optional()
});

// Helper function to validate request body
export async function validateRequest<T>(
  c: any,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await c.req.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify({
        message: 'Validation failed',
        errors: error.errors
      }));
    }
    throw error;
  }
}
```

#### Step 2.2: Complete Lead Routes

Update `functions/api/leads.ts`:
```typescript
// Add at top of file
import { createLeadSchema, updateLeadSchema, validateRequest } from '../lib/validation';

// Update POST handler
leadRoutes.post('/', async (c) => {
  const auth = c.get('auth');
  
  try {
    // Validate request body
    const data = await validateRequest(c, createLeadSchema);
    
    // Insert with transaction for activity log
    const result = await c.env.DB.batch([
      c.env.DB.prepare(`
        INSERT INTO leads (name, email, phone, company, industry, status, 
                           assigned_to, created_by, source, notes, 
                           estimated_value, probability)
        VALUES (?, ?, ?, ?, ?, 'new', ?, ?, ?, ?, ?, ?)
        RETURNING *
      `).bind(
        data.name,
        data.email || null,
        data.phone,
        data.company || null,
        data.industry || null,
        data.assignedTo || auth.userId,
        auth.userId,
        data.source || 'manual',
        data.notes || null,
        data.estimatedValue || null,
        data.probability || 0
      ),
      c.env.DB.prepare(`
        INSERT INTO activity_log (user_id, entity_type, entity_id, action, new_values)
        VALUES (?, 'lead', last_insert_rowid(), 'created', ?)
      `).bind(auth.userId, JSON.stringify(data))
    ]);
    
    const lead = result[0].results[0];
    
    // TODO: Broadcast to WebSocket
    // await broadcastLeadCreated(lead);
    
    return c.json({ data: lead }, 201);
    
  } catch (error) {
    if (error.message.includes('Validation failed')) {
      return c.json({ error: JSON.parse(error.message) }, 400);
    }
    console.error('Error creating lead:', error);
    return c.json({ error: 'Failed to create lead' }, 500);
  }
});

// Update PATCH handler
leadRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth');
  const id = c.req.param('id');
  
  try {
    const data = await validateRequest(c, updateLeadSchema);
    
    // Check authorization
    const existing = await c.env.DB.prepare(
      'SELECT * FROM leads WHERE id = ?'
    ).bind(id).first();
    
    if (!existing) {
      return c.json({ error: 'Lead not found' }, 404);
    }
    
    // Agents can only update their assigned leads
    if (auth.role === 'agent' && existing.assigned_to !== auth.userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }
    
    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    
    Object.entries(data).forEach(([key, value]) => {
      updates.push(`${key} = ?`);
      values.push(value);
    });
    
    if (updates.length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    const result = await c.env.DB.prepare(`
      UPDATE leads 
      SET ${updates.join(', ')}
      WHERE id = ?
      RETURNING *
    `).bind(...values).first();
    
    // Log activity
    await c.env.DB.prepare(`
      INSERT INTO activity_log (user_id, entity_type, entity_id, action, 
                                old_values, new_values)
      VALUES (?, 'lead', ?, 'updated', ?, ?)
    `).bind(
      auth.userId,
      id,
      JSON.stringify(existing),
      JSON.stringify(data)
    ).run();
    
    // TODO: Broadcast to WebSocket
    // await broadcastLeadUpdated(result);
    
    return c.json({ data: result });
    
  } catch (error) {
    console.error('Error updating lead:', error);
    return c.json({ error: 'Failed to update lead' }, 500);
  }
});
```

#### Step 2.3: Complete Call Routes

Update `functions/api/calls.ts` similarly with:
- POST /calls - Create new call record
- GET /calls - List calls with filters
- GET /calls/:id - Get call details with transcription
- PATCH /calls/:id - Update call (outcome, notes, next action)
- POST /calls/:id/recording - Upload recording to R2
- GET /calls/:id/recording - Get signed URL for recording playback

#### Step 2.4: Implement Analytics Endpoint

Create `functions/api/analytics.ts`:
```typescript
import { Hono } from 'hono';
import type { Env, AuthContext } from '../../src/lib/types';

export const analyticsRoutes = new Hono<{ Bindings: Env; Variables: { auth: AuthContext } }>();

// GET /api/analytics/dashboard - Dashboard stats
analyticsRoutes.get('/dashboard', async (c) => {
  const auth = c.get('auth');
  
  try {
    // Get date range from query params
    const startDate = c.req.query('startDate') || 
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = c.req.query('endDate') || new Date().toISOString();
    
    // Build queries based on user role
    const userFilter = auth.role === 'agent' 
      ? `AND user_id = '${auth.userId}'` 
      : '';
    
    // Get key metrics
    const metrics = await c.env.DB.batch([
      // Total calls
      c.env.DB.prepare(`
        SELECT COUNT(*) as total_calls
        FROM calls
        WHERE start_time BETWEEN ? AND ? ${userFilter}
      `).bind(startDate, endDate),
      
      // Demos booked
      c.env.DB.prepare(`
        SELECT COUNT(*) as demos_booked
        FROM calls
        WHERE outcome = 'demo-booked'
        AND start_time BETWEEN ? AND ? ${userFilter}
      `).bind(startDate, endDate),
      
      // Active leads
      c.env.DB.prepare(`
        SELECT COUNT(*) as active_leads
        FROM leads
        WHERE status IN ('new', 'contacted', 'qualified', 'demo-scheduled')
        ${auth.role === 'agent' ? `AND assigned_to = '${auth.userId}'` : ''}
      `),
      
      // Conversion rate
      c.env.DB.prepare(`
        SELECT 
          COUNT(DISTINCT CASE WHEN status = 'closed-won' THEN id END) as won,
          COUNT(*) as total
        FROM leads
        WHERE created_at BETWEEN ? AND ?
        ${auth.role === 'agent' ? `AND assigned_to = '${auth.userId}'` : ''}
      `).bind(startDate, endDate)
    ]);
    
    const totalCalls = metrics[0].results[0].total_calls;
    const demosBooked = metrics[1].results[0].demos_booked;
    const activeLeads = metrics[2].results[0].active_leads;
    const conversionData = metrics[3].results[0];
    const conversionRate = conversionData.total > 0 
      ? (conversionData.won / conversionData.total) * 100 
      : 0;
    
    // Get performance trends (daily aggregates)
    const trends = await c.env.DB.prepare(`
      SELECT 
        DATE(start_time) as date,
        COUNT(*) as calls,
        COUNT(CASE WHEN outcome = 'demo-booked' THEN 1 END) as demos,
        AVG(duration) as avg_duration
      FROM calls
      WHERE start_time BETWEEN ? AND ? ${userFilter}
      GROUP BY DATE(start_time)
      ORDER BY date ASC
    `).bind(startDate, endDate).all();
    
    // Get top performers (if admin/manager)
    let topPerformers = [];
    if (auth.role !== 'agent') {
      topPerformers = await c.env.DB.prepare(`
        SELECT 
          u.id,
          u.name,
          COUNT(c.id) as total_calls,
          COUNT(CASE WHEN c.outcome = 'demo-booked' THEN 1 END) as demos_booked,
          AVG(c.duration) as avg_duration
        FROM users u
        LEFT JOIN calls c ON u.id = c.user_id 
          AND c.start_time BETWEEN ? AND ?
        WHERE u.role = 'agent' AND u.is_active = TRUE
        GROUP BY u.id, u.name
        ORDER BY demos_booked DESC
        LIMIT 10
      `).bind(startDate, endDate).all();
    }
    
    return c.json({
      data: {
        metrics: {
          totalCalls,
          demosBooked,
          activeLeads,
          conversionRate: conversionRate.toFixed(1)
        },
        trends: trends.results,
        topPerformers: topPerformers.results || []
      }
    });
    
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

// GET /api/analytics/activity - Recent activity feed
analyticsRoutes.get('/activity', async (c) => {
  const auth = c.get('auth');
  const limit = parseInt(c.req.query('limit') || '20');
  
  try {
    const activities = await c.env.DB.prepare(`
      SELECT 
        al.*,
        u.name as user_name
      FROM activity_log al
      JOIN users u ON al.user_id = u.id
      ${auth.role === 'agent' ? 'WHERE al.user_id = ?' : ''}
      ORDER BY al.created_at DESC
      LIMIT ?
    `).bind(...(auth.role === 'agent' ? [auth.userId, limit] : [limit])).all();
    
    return c.json({ data: activities.results });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return c.json({ error: 'Failed to fetch activity' }, 500);
  }
});
```

Update `functions/index.ts` to include analytics routes:
```typescript
import { analyticsRoutes } from './api/analytics';

// Add after existing routes
app.route('/api/analytics', analyticsRoutes);
```

---

### **Phase 3: Real-Time Synchronization (Day 6-7)**

#### Step 3.1: Implement WebSocket Server

Create `functions/websocket.ts`:
```typescript
import { DurableObject } from 'cloudflare:workers';

export class WebSocketDurableObject extends DurableObject {
  private sessions: Map<string, WebSocket> = new Map();
  
  async fetch(request: Request) {
    // Upgrade HTTP to WebSocket
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 });
    }
    
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);
    
    // Accept the connection
    server.accept();
    
    // Get session ID from URL
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('session') || crypto.randomUUID();
    
    // Store session
    this.sessions.set(sessionId, server);
    
    // Handle messages
    server.addEventListener('message', async (event) => {
      try {
        const message = JSON.parse(event.data as string);
        
        // Broadcast to all connected clients
        await this.broadcast(message, sessionId);
        
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    // Handle close
    server.addEventListener('close', () => {
      this.sessions.delete(sessionId);
    });
    
    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }
  
  async broadcast(message: any, excludeSession?: string) {
    const payload = JSON.stringify(message);
    
    for (const [sessionId, ws] of this.sessions.entries()) {
      if (sessionId === excludeSession) continue;
      
      try {
        ws.send(payload);
      } catch (error) {
        console.error('Error broadcasting to session:', sessionId, error);
        this.sessions.delete(sessionId);
      }
    }
  }
}
```

Update `wrangler.toml`:
```toml
[[durable_objects.bindings]]
name = "WEBSOCKET"
class_name = "WebSocketDurableObject"
script_name = "interactive-sales-ca"

[[migrations]]
tag = "v1"
new_classes = ["WebSocketDurableObject"]
```

#### Step 3.2: Add Broadcasting to API Routes

Update `functions/api/leads.ts`:
```typescript
// Add helper function
async function broadcastLeadUpdate(env: Env, type: string, lead: any) {
  try {
    const id = env.WEBSOCKET.idFromName('main');
    const stub = env.WEBSOCKET.get(id);
    
    await stub.fetch('https://internal/broadcast', {
      method: 'POST',
      body: JSON.stringify({
        type,
        data: lead,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Error broadcasting:', error);
  }
}

// Use in POST handler after creating lead
await broadcastLeadUpdate(c.env, 'lead_created', result);

// Use in PATCH handler after updating lead
await broadcastLeadUpdate(c.env, 'lead_updated', result);
```

#### Step 3.3: Update Frontend WebSocket Hook

Update `src/hooks/useWebSocket.ts`:
```typescript
// Add reconnection on message types
export function useRealtimeLeadUpdates() {
  const queryClient = useQueryClient();
  
  useWebSocketMessages((message) => {
    switch (message.type) {
      case 'lead_created':
        // Invalidate leads list to refetch
        queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
        toast.info(`New lead: ${message.data.name}`);
        break;
        
      case 'lead_updated':
        // Update specific lead in cache
        queryClient.setQueryData(
          queryKeys.leads.detail(message.data.id),
          message.data
        );
        // Invalidate list to ensure consistency
        queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
        break;
        
      case 'lead_deleted':
        // Remove from cache
        queryClient.removeQueries({ 
          queryKey: queryKeys.leads.detail(message.data.id) 
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
        break;
    }
  });
}

// Similar for calls
export function useRealtimeCallUpdates() {
  const queryClient = useQueryClient();
  
  useWebSocketMessages((message) => {
    switch (message.type) {
      case 'call_started':
      case 'call_ended':
      case 'call_updated':
        queryClient.invalidateQueries({ queryKey: queryKeys.calls.all });
        break;
    }
  });
}
```

#### Step 3.4: Connect WebSocket in App

Update `src/App.tsx`:
```typescript
function App() {
  // Initialize WebSocket connection
  const { status } = useWebSocket();
  
  // Subscribe to real-time updates
  useRealtimeLeadUpdates();
  useRealtimeCallUpdates();
  
  return (
    <QueryProvider>
      <ErrorBoundary>
        {/* Show connection status in header */}
        <ConnectionStatus status={status} />
        
        {/* Rest of app */}
        <Routes />
      </ErrorBoundary>
    </QueryProvider>
  );
}
```

---

### **Phase 4: Connect Frontend to Real API (Day 8)**

#### Step 4.1: Update Environment Variables

Update `.env.development`:
```env
VITE_API_URL=http://localhost:8787/api
VITE_WS_URL=ws://localhost:8787/ws
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

Update `.env.production`:
```env
VITE_API_URL=https://scholarix-crm.pages.dev/api
VITE_WS_URL=wss://scholarix-crm.pages.dev/ws
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_key_here
```

#### Step 4.2: Update Analytics Dashboard

Update `src/components/AdvancedAnalyticsDashboard.tsx`:
```typescript
// Remove demo data, use real API
export function AdvancedAnalyticsDashboard() {
  // NOW use the real hook
  const { data: analytics, isLoading } = useAnalytics({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  });
  
  if (isLoading) {
    return <AnalyticsSkeleton />;
  }
  
  if (!analytics) {
    return <EmptyState type="no-data" />;
  }
  
  // Use real data from API
  const { metrics, trends, topPerformers } = analytics;
  
  // Rest of component uses real data
}
```

#### Step 4.3: Test Data Flow

```bash
# Start dev server
npm run dev

# In another terminal, start Workers dev server
wrangler dev

# Test API endpoints
curl http://localhost:8787/api/leads
curl http://localhost:8787/api/calls
curl http://localhost:8787/api/analytics/dashboard
```

---

### **Phase 5: Offline Support & PWA (Day 9-10)**

#### Step 5.1: Create Service Worker

Create `public/sw.js`:
```javascript
const CACHE_NAME = 'scholarix-crm-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/index.css',
  '/assets/index.js',
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch with cache-first strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }
      
      return fetch(event.request).then((response) => {
        // Check if valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Clone response
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      });
    })
  );
});

// Activate service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

#### Step 5.2: Register Service Worker

Update `src/main.tsx`:
```typescript
// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}
```

#### Step 5.3: Add Offline Queue

Create `src/lib/offlineQueue.ts`:
```typescript
import { openDB, DBSchema } from 'idb';

interface QueueDB extends DBSchema {
  queue: {
    key: number;
    value: {
      id: number;
      method: string;
      url: string;
      body: any;
      timestamp: number;
    };
  };
}

const db = openDB<QueueDB>('offline-queue', 1, {
  upgrade(db) {
    db.createObjectStore('queue', { keyPath: 'id', autoIncrement: true });
  },
});

export async function addToQueue(method: string, url: string, body: any) {
  const database = await db;
  await database.add('queue', {
    method,
    url,
    body,
    timestamp: Date.now(),
  });
}

export async function processQueue() {
  const database = await db;
  const items = await database.getAll('queue');
  
  for (const item of items) {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.body),
      });
      
      if (response.ok) {
        await database.delete('queue', item.id);
      }
    } catch (error) {
      console.error('Failed to process queued request:', error);
    }
  }
}

// Process queue when online
window.addEventListener('online', () => {
  processQueue();
});
```

Update `src/lib/apiClient.ts`:
```typescript
import { addToQueue } from './offlineQueue';

// Modify request method
async request<T>(
  method: string,
  endpoint: string,
  data?: any
): Promise<T> {
  try {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method,
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return response.json();
    
  } catch (error) {
    // If offline, queue the request
    if (!navigator.onLine) {
      await addToQueue(method, `${this.baseURL}${endpoint}`, data);
      throw new Error('Offline - request queued');
    }
    throw error;
  }
}
```

---

### **Phase 6: Deployment & Testing (Day 11-12)**

#### Step 6.1: Build and Deploy

```bash
# Install dependencies
npm install idb zod

# Build frontend
npm run build

# Deploy Workers + Pages
wrangler deploy

# Or deploy via GitHub Actions (automatic on push to main)
git add .
git commit -m "feat: complete data integration and sync"
git push origin main
```

#### Step 6.2: Run Migration on Production

```bash
# Execute migrations on production database
wrangler d1 execute scholarix-crm-db --remote --file=migrations/0001_initial_schema.sql
wrangler d1 execute scholarix-crm-db --remote --file=migrations/0002_add_transcription.sql

# Verify
wrangler d1 execute scholarix-crm-db --remote --command="SELECT COUNT(*) FROM users;"
```

#### Step 6.3: Integration Testing

```bash
# Test API endpoints
curl https://scholarix-crm.pages.dev/api/leads
curl https://scholarix-crm.pages.dev/api/calls
curl https://scholarix-crm.pages.dev/api/analytics/dashboard

# Test WebSocket connection
wscat -c wss://scholarix-crm.pages.dev/ws

# Test authentication
curl -H "Authorization: Bearer <clerk-token>" \
  https://scholarix-crm.pages.dev/api/leads
```

#### Step 6.4: Performance Testing

- Load test with 100+ concurrent users
- Measure API response times (target: <200ms)
- Test WebSocket broadcast latency (target: <100ms)
- Verify React Query cache hit rate (target: >80%)

---

## 📊 Data Consistency & Conflict Resolution

### Conflict Scenarios

**Scenario 1: Concurrent Updates to Same Lead**
```typescript
// User A and User B both update same lead

// Solution: Last-write-wins with timestamp
leadRoutes.patch('/:id', async (c) => {
  const clientTimestamp = c.req.header('X-Client-Timestamp');
  
  const existing = await c.env.DB.prepare(
    'SELECT updated_at FROM leads WHERE id = ?'
  ).bind(id).first();
  
  if (new Date(clientTimestamp) < new Date(existing.updated_at)) {
    return c.json({ 
      error: 'Conflict: Record was updated by another user',
      currentData: existing
    }, 409);
  }
  
  // Proceed with update
});
```

**Scenario 2: Offline Edits Syncing**
```typescript
// User makes edits while offline, goes online

// Solution: Optimistic UI + queue processing
const updateLeadMutation = useMutation({
  mutationFn: async ({ id, data }) => {
    try {
      return await apiClient.patch(`/leads/${id}`, data);
    } catch (error) {
      if (!navigator.onLine) {
        // Queue for later
        await addToQueue('PATCH', `/leads/${id}`, data);
        return { ...data, id, _queued: true };
      }
      throw error;
    }
  }
});
```

**Scenario 3: WebSocket Disconnect During Update**
```typescript
// Ensure idempotency with request IDs

const updateLead = async (id: string, data: any) => {
  const requestId = crypto.randomUUID();
  
  const response = await apiClient.patch(`/leads/${id}`, data, {
    headers: { 'X-Request-ID': requestId }
  });
  
  // Backend tracks request IDs to prevent duplicate processing
};
```

---

## 🔐 Security & Access Control

### Row-Level Security

```typescript
// Implement in all route handlers

leadRoutes.get('/', async (c) => {
  const auth = c.get('auth');
  
  // Agents only see their assigned leads
  const whereClause = auth.role === 'agent' 
    ? 'WHERE assigned_to = ?' 
    : '';
  
  const query = `SELECT * FROM leads ${whereClause}`;
  const params = auth.role === 'agent' ? [auth.userId] : [];
  
  const results = await c.env.DB.prepare(query).bind(...params).all();
  
  return c.json({ data: results });
});
```

### Data Encryption

```typescript
// Encrypt sensitive fields before storing

import { encrypt, decrypt } from './lib/crypto';

leadRoutes.post('/', async (c) => {
  const data = await c.req.json();
  
  // Encrypt phone number
  data.phone = await encrypt(data.phone, c.env.ENCRYPTION_KEY);
  
  const result = await c.env.DB.prepare(
    'INSERT INTO leads (name, phone) VALUES (?, ?)'
  ).bind(data.name, data.phone).run();
  
  return c.json({ data: result });
});
```

---

## 📈 Monitoring & Observability

### Metrics to Track

1. **API Performance**
   - Response times (p50, p95, p99)
   - Error rates
   - Request volume

2. **Database Performance**
   - Query execution times
   - Connection pool usage
   - Failed transactions

3. **Real-Time Sync**
   - WebSocket connection count
   - Message latency
   - Reconnection rate

4. **User Experience**
   - Time to interactive
   - Cache hit rate
   - Offline queue length

### Logging Strategy

```typescript
// Structured logging in Workers

import { logger } from './lib/logger';

leadRoutes.post('/', async (c) => {
  const startTime = Date.now();
  
  try {
    const result = await createLead(data);
    
    logger.info('Lead created', {
      leadId: result.id,
      userId: auth.userId,
      duration: Date.now() - startTime
    });
    
    return c.json({ data: result });
    
  } catch (error) {
    logger.error('Lead creation failed', {
      error: error.message,
      userId: auth.userId,
      duration: Date.now() - startTime
    });
    
    throw error;
  }
});
```

---

## ✅ Verification Checklist

### Database Setup
- [ ] Migrations executed on production
- [ ] Tables created with correct schema
- [ ] Indexes created for performance
- [ ] Initial admin user exists
- [ ] Sample data loaded (optional)

### Backend API
- [ ] All CRUD endpoints implemented
- [ ] Request validation with Zod
- [ ] Authentication middleware working
- [ ] Activity logging on all operations
- [ ] Error handling consistent
- [ ] CORS configured correctly

### Real-Time Sync
- [ ] WebSocket server deployed
- [ ] Broadcasting on all mutations
- [ ] Client reconnection logic working
- [ ] Message handlers updating cache
- [ ] No memory leaks from subscriptions

### Frontend Integration
- [ ] All hooks connected to real API
- [ ] Demo data removed
- [ ] Loading states correct
- [ ] Error states handled
- [ ] Optimistic updates working
- [ ] Cache invalidation correct

### Offline Support
- [ ] Service worker registered
- [ ] Offline queue implemented
- [ ] Background sync working
- [ ] Cache-first strategy correct
- [ ] Queue processes on reconnect

### Performance
- [ ] API responses < 200ms
- [ ] WebSocket latency < 100ms
- [ ] React Query cache hit > 80%
- [ ] Bundle size optimized
- [ ] Lighthouse score > 90

### Security
- [ ] All routes require authentication
- [ ] Row-level security enforced
- [ ] Sensitive data encrypted
- [ ] CSRF protection enabled
- [ ] Rate limiting configured

### Testing
- [ ] Unit tests for API routes
- [ ] Integration tests for data flow
- [ ] E2E tests for critical paths
- [ ] Load tests passed
- [ ] WebSocket stress tested

---

## 🚀 Next Steps After Implementation

1. **Add Advanced Features**
   - Email notifications
   - SMS reminders
   - Calendar integration
   - Advanced reporting

2. **Optimize Performance**
   - Add Redis caching layer
   - Implement database connection pooling
   - Add CDN for static assets
   - Enable HTTP/3

3. **Enhance Analytics**
   - Predictive lead scoring
   - Call sentiment analysis
   - Revenue forecasting
   - Team performance dashboards

4. **Improve DevEx**
   - API documentation with OpenAPI
   - GraphQL layer option
   - Development seed scripts
   - E2E testing suite

---

## 📚 Resources

- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Hono Framework](https://hono.dev/)
- [React Query Docs](https://tanstack.com/query/latest)
- [Clerk Auth Docs](https://clerk.com/docs)
- [Zod Validation](https://zod.dev/)

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-26  
**Status:** Ready for Implementation  
**Estimated Timeline:** 10-12 days for complete implementation
