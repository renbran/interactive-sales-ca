# 🏗️ Scholarix CRM - System Architecture

## 📊 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USERS                                     │
│  👤 Admin  │  👤 Agent  │  👤 Sales Manager                      │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FRONTEND (React 19)                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │  Dashboard │  │   Leads    │  │   Calls    │                │
│  └────────────┘  └────────────┘  └────────────┘                │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │   Admin    │  │  Scripts   │  │ Analytics  │                │
│  └────────────┘  └────────────┘  └────────────┘                │
│                                                                   │
│  Hosted on: Cloudflare Pages                                    │
│  URL: https://interactive-sales-ca.pages.dev                    │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ HTTPS/JWT
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│               AUTHENTICATION (Clerk.dev)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  • User Login/Signup                                      │  │
│  │  • JWT Token Generation                                   │  │
│  │  • Role Management (Admin/Agent)                          │  │
│  │  • Session Management                                     │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ Bearer Token
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│            API LAYER (Cloudflare Workers)                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Hono Framework Router                                    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ /api/leads  │  │ /api/calls  │  │ /api/users  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │/api/scripts │  │ /api/tasks  │  │/api/analytics│            │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                   │
│  • JWT Verification                                              │
│  • RBAC Middleware                                               │
│  • Activity Logging                                              │
│  • Error Handling                                                │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              DATABASE (Cloudflare D1 - SQLite)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  users   │  │  leads   │  │  calls   │  │  tasks   │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │conversations│ │ scripts │  │   tags   │  │activity_logs│    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                   │
│  • Triggers for auto-updates                                     │
│  • Views for complex queries                                     │
│  • Indexes for performance                                       │
└─────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              STORAGE (Cloudflare R2)                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  📁 recordings/                                           │  │
│  │     └── {lead_id}/                                        │  │
│  │         └── {call_id}-{timestamp}.mp3                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  • Call recordings                                               │
│  • Document attachments                                          │
│  • Export files                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow Diagram

### Example: Agent Creates a Lead

```
1. USER ACTION
   Agent clicks "Create Lead" button
   └─> Fills in form: Name, Phone, Email, etc.

2. FRONTEND
   React Form Component
   └─> Validates input
   └─> Calls apiClient.createLead(data)

3. API CLIENT
   src/lib/api.ts
   └─> Gets JWT token from Clerk
   └─> Makes POST request to /api/leads
   └─> Headers: { Authorization: "Bearer {token}" }

4. CLOUDFLARE WORKER
   functions/api/leads.ts
   └─> Receives request
   └─> Auth Middleware verifies JWT
   └─> Extracts user info from token
   └─> Checks user role (agent/admin)

5. VALIDATION
   └─> Validates required fields
   └─> Checks user permissions
   └─> Assigns lead to agent

6. DATABASE
   Cloudflare D1
   └─> INSERT INTO leads (...)
   └─> Trigger: Update timestamp
   └─> Returns lead_id

7. ACTIVITY LOG
   └─> INSERT INTO activity_logs
   └─> Records: "lead_created" by user_id

8. RESPONSE
   └─> Returns created lead object
   └─> Status: 201 Created

9. FRONTEND UPDATE
   └─> Updates local state
   └─> Shows success message
   └─> Redirects to lead detail page
```

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                           │
└─────────────────────────────────────────────────────────────────┘

1. USER VISITS SITE
   └─> https://interactive-sales-ca.pages.dev

2. PROTECTED ROUTE CHECK
   <ProtectedRoute> component
   └─> useAuth() from Clerk
   └─> Is user signed in?
       ├─> NO: Redirect to /login
       └─> YES: Continue

3. LOGIN PAGE
   User enters email/password
   └─> Clerk handles authentication
   └─> On success: Creates session + JWT

4. TOKEN STORAGE
   JWT stored in:
   └─> HTTP-only cookie (secure)
   └─> Clerk session

5. API REQUESTS
   Every API call includes:
   └─> Authorization: Bearer {jwt_token}

6. TOKEN VERIFICATION
   Cloudflare Worker middleware
   └─> Extracts token from header
   └─> Verifies with Clerk API
   └─> Decodes user info
   └─> Checks database for user
   └─> Sets auth context

7. ROLE CHECK
   RoleGuard component / middleware
   └─> Reads user.role from metadata
   └─> Allows/denies based on role
       ├─> Admin: Full access
       └─> Agent: Limited access

8. SESSION REFRESH
   Clerk auto-refreshes tokens
   └─> Happens in background
   └─> User stays logged in
```

---

## 📊 Database Entity Relationship Diagram

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    users    │         │    leads    │         │    calls    │
├─────────────┤         ├─────────────┤         ├─────────────┤
│ id (PK)     │◄───┐    │ id (PK)     │◄───┐    │ id (PK)     │
│ clerk_id    │    │    │ name        │    │    │ lead_id (FK)│
│ email       │    └────┤ assigned_to │    └────┤ user_id (FK)│
│ full_name   │         │ created_by  │         │ call_date   │
│ role        │         │ status      │         │ duration    │
│ is_active   │         │ priority    │         │ outcome     │
└─────────────┘         │ phone       │         │ notes       │
                        │ email       │         │ recording_url│
                        └─────────────┘         └─────────────┘
                               │                       
                               │                       
                               ▼                       
                        ┌─────────────┐         ┌─────────────┐
                        │conversations│         │    tasks    │
                        ├─────────────┤         ├─────────────┤
                        │ id (PK)     │         │ id (PK)     │
                        │ lead_id (FK)│         │ lead_id (FK)│
                        │ user_id (FK)│         │ user_id (FK)│
                        │ message     │         │ title       │
                        │message_type │         │ due_date    │
                        └─────────────┘         │ status      │
                                                └─────────────┘

┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   scripts   │         │    tags     │         │ lead_tags   │
├─────────────┤         ├─────────────┤         ├─────────────┤
│ id (PK)     │         │ id (PK)     │         │ lead_id (FK)│
│ title       │         │ name        │◄────────┤ tag_id (FK) │
│ content     │         │ color       │         └─────────────┘
│ category    │         └─────────────┘         (Many-to-Many)
│ is_active   │
└─────────────┘
```

---

## 🎭 User Roles & Permissions Matrix

```
┌─────────────────────┬──────────────┬──────────────┐
│      Feature        │    Admin     │    Agent     │
├─────────────────────┼──────────────┼──────────────┤
│ View All Leads      │      ✅      │      ❌      │
│ View Assigned Leads │      ✅      │      ✅      │
│ Create Lead         │      ✅      │      ✅      │
│ Edit Any Lead       │      ✅      │      ❌      │
│ Edit Assigned Lead  │      ✅      │      ✅      │
│ Delete Lead         │      ✅      │      ❌      │
│ Assign Leads        │      ✅      │      ❌      │
│ Log Call            │      ✅      │      ✅      │
│ View All Calls      │      ✅      │      ❌      │
│ View Own Calls      │      ✅      │      ✅      │
│ Manage Users        │      ✅      │      ❌      │
│ View Analytics      │      ✅      │      ✅*     │
│ Manage Scripts      │      ✅      │      ❌      │
│ Export Data         │      ✅      │      ❌      │
│ System Settings     │      ✅      │      ❌      │
└─────────────────────┴──────────────┴──────────────┘

* Agent sees only their own performance
```

---

## 🚀 Deployment Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE NETWORK                          │
│                    (Global Edge Network)                       │
└────────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
            ▼                 ▼                 ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │   Americas   │  │    Europe    │  │     Asia     │
    │  Edge Nodes  │  │  Edge Nodes  │  │  Edge Nodes  │
    └──────────────┘  └──────────────┘  └──────────────┘
            │                 │                 │
            └─────────────────┼─────────────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │  Cloudflare Pages   │
                   │  (Frontend)         │
                   │  Static Assets      │
                   └─────────────────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │ Cloudflare Workers  │
                   │ (API Backend)       │
                   │ Serverless Functions│
                   └─────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
     ┌──────────────────┐        ┌──────────────────┐
     │   Cloudflare D1  │        │  Cloudflare R2   │
     │   (Database)     │        │   (Storage)      │
     │   SQLite         │        │   Recordings     │
     └──────────────────┘        └──────────────────┘
```

---

## 📈 Scalability Metrics

```
FREE TIER LIMITS:
├── Cloudflare Pages
│   └── Unlimited requests ✅
│   └── Unlimited bandwidth ✅
│
├── Cloudflare Workers
│   └── 100,000 requests/day
│   └── ~3,000,000 requests/month
│   └── 50ms CPU time per request
│
├── Cloudflare D1
│   └── 5 GB storage
│   └── 5 Million row reads/day
│   └── 100,000 row writes/day
│
└── Cloudflare R2
    └── 10 GB storage/month
    └── 1 Million Class A operations
    └── 10 Million Class B operations

ESTIMATED CAPACITY:
├── Concurrent Users: 10,000+
├── Daily Active Users: 1,000+
├── Leads: 100,000+
├── Calls: 50,000/month
├── Recordings: 1,000 hours
└── Response Time: <100ms globally
```

---

## 🔄 Data Flow Examples

### Creating a Lead with Call Logging

```
1. Agent submits lead form
   └─> POST /api/leads
       {
         "name": "John Doe",
         "phone": "+1234567890",
         "email": "john@example.com",
         "company": "Acme Corp"
       }

2. Worker creates lead record
   └─> DB INSERT → lead_id: 123
   └─> Activity log created
   └─> Returns lead object

3. Agent logs call
   └─> POST /api/calls
       {
         "lead_id": 123,
         "duration": 180,
         "outcome": "answered",
         "notes": "Interested in product demo"
       }

4. Worker creates call record
   └─> DB INSERT → call_id: 456
   └─> Trigger updates lead.last_contact
   └─> Activity log created

5. Agent uploads recording
   └─> POST /api/calls/456/recording
       FormData: recording.mp3

6. Worker stores in R2
   └─> R2 PUT → recordings/123/456-{timestamp}.mp3
   └─> DB UPDATE calls.recording_url
   └─> Returns public URL

7. Frontend refreshes
   └─> Shows updated lead with call history
   └─> Displays recording player
```

---

## 🛡️ Security Architecture

```
LAYER 1: Network Security
└─> Cloudflare DDoS Protection
└─> Rate Limiting
└─> WAF (Web Application Firewall)

LAYER 2: Authentication
└─> Clerk JWT Tokens
└─> HTTP-only Cookies
└─> Token Expiration (7 days)
└─> Refresh Token Rotation

LAYER 3: Authorization
└─> Role-Based Access Control
└─> Resource-Level Permissions
└─> Middleware Checks on Every Request

LAYER 4: Data Protection
└─> SQL Injection Prevention (Prepared Statements)
└─> XSS Protection (React auto-escaping)
└─> CORS Configuration
└─> Content Security Policy

LAYER 5: Encryption
└─> HTTPS/TLS for all traffic
└─> Encrypted R2 storage
└─> Encrypted database backups

LAYER 6: Audit Trail
└─> Activity logs for all actions
└─> IP address tracking
└─> User agent logging
└─> Timestamp for all events
```

---

## 📊 Performance Optimization

```
FRONTEND:
├── Code Splitting (Vite)
├── Lazy Loading Components
├── React Query Caching
├── Optimistic Updates
└── Service Worker (offline support)

BACKEND:
├── D1 Prepared Statements
├── Database Indexes
├── Efficient Queries (avoid N+1)
├── Response Compression
└── Edge Caching

NETWORK:
├── CDN Distribution (Cloudflare)
├── HTTP/2 & HTTP/3
├── Brotli Compression
├── Smart Routing
└── Global Edge Network

DATABASE:
├── Proper Indexing
├── Database Views
├── Query Optimization
├── Connection Pooling
└── Trigger-based Updates
```

---

This architecture provides a solid foundation for a scalable, secure, and performant CRM system!
