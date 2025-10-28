-- Scholarix CRM Database Schema
-- Cloudflare D1 (SQLite) Database Structure

-- Users table - Authentication and roles
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'manager', 'agent')) DEFAULT 'agent',
    phone TEXT,
    department TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Leads table - Prospect information
CREATE TABLE leads (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    company TEXT,
    industry TEXT CHECK(industry IN ('real-estate', 'retail', 'trading', 'logistics', 'consulting')),
    status TEXT CHECK(status IN ('new', 'contacted', 'qualified', 'demo-scheduled', 'proposal-sent', 'closed-won', 'closed-lost')) DEFAULT 'new',
    source TEXT, -- web, referral, cold-call, etc.
    assigned_to TEXT REFERENCES users(id),
    created_by TEXT REFERENCES users(id),
    notes TEXT,
    next_follow_up DATETIME,
    estimated_value DECIMAL(10,2),
    probability INTEGER CHECK(probability BETWEEN 0 AND 100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Calls table - Call records and scripts
CREATE TABLE calls (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id),
    call_type TEXT CHECK(call_type IN ('outbound', 'inbound')) DEFAULT 'outbound',
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    duration INTEGER, -- seconds
    outcome TEXT CHECK(outcome IN ('demo-booked', 'follow-up-scheduled', 'not-interested', 'no-answer', 'busy', 'callback-requested')),
    script_used TEXT, -- which script version
    recording_url TEXT, -- R2 storage URL
    recording_duration INTEGER, -- seconds
    call_notes TEXT,
    next_action TEXT,
    next_action_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Call qualification tracking
CREATE TABLE call_qualifications (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    call_id TEXT NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    uses_manual_process BOOLEAN,
    pain_point_identified BOOLEAN DEFAULT FALSE,
    pain_quantified BOOLEAN DEFAULT FALSE,
    value_acknowledged BOOLEAN DEFAULT FALSE,
    demo_booked BOOLEAN DEFAULT FALSE,
    time_committed BOOLEAN DEFAULT FALSE,
    budget_discussed BOOLEAN DEFAULT FALSE,
    decision_maker_confirmed BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Conversations table - Messages and interactions  
CREATE TABLE conversations (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id),
    call_id TEXT REFERENCES calls(id), -- optional link to call
    message_type TEXT CHECK(message_type IN ('note', 'email', 'sms', 'whatsapp', 'system')) DEFAULT 'note',
    message TEXT NOT NULL,
    direction TEXT CHECK(direction IN ('inbound', 'outbound', 'internal')) DEFAULT 'internal',
    read_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Activity log for audit trail
CREATE TABLE activity_log (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL REFERENCES users(id),
    entity_type TEXT NOT NULL, -- 'lead', 'call', 'user', etc.
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'viewed', 'called'
    old_values TEXT, -- JSON of old values
    new_values TEXT, -- JSON of new values
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Team assignments
CREATE TABLE team_assignments (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    team_name TEXT NOT NULL,
    manager_id TEXT NOT NULL REFERENCES users(id),
    member_id TEXT NOT NULL REFERENCES users(id),
    role_in_team TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_name, member_id)
);

-- Script versions and performance
CREATE TABLE script_versions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    version_name TEXT NOT NULL,
    script_content TEXT NOT NULL, -- JSON of script nodes
    is_active BOOLEAN DEFAULT FALSE,
    created_by TEXT REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Performance metrics
CREATE TABLE performance_metrics (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL REFERENCES users(id),
    metric_date DATE NOT NULL,
    calls_made INTEGER DEFAULT 0,
    calls_connected INTEGER DEFAULT 0,
    demos_booked INTEGER DEFAULT 0,
    deals_closed INTEGER DEFAULT 0,
    revenue_generated DECIMAL(10,2) DEFAULT 0,
    avg_call_duration INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, metric_date)
);

-- Indexes for performance
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_calls_lead_id ON calls(lead_id);
CREATE INDEX idx_calls_user_id ON calls(user_id);
CREATE INDEX idx_calls_start_time ON calls(start_time);
CREATE INDEX idx_conversations_lead_id ON conversations(lead_id);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);

-- Initial admin user (password: admin123 - CHANGE IMMEDIATELY)
INSERT INTO users (id, email, name, password_hash, role) VALUES 
('admin-user-001', 'admin@scholarixglobal.com', 'Admin User', '$2b$10$rF8J9Z2X3QxNtPzG7wH1HepQx4vR5qW8iE9tYdE2kL6xM9nO3pA7e', 'admin');