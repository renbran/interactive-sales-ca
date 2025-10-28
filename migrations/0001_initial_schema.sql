-- Scholarix CRM Database Schema
-- Cloudflare D1 (SQLite) Migration
-- Version: 0001_initial_schema

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'agent')) DEFAULT 'agent',
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =====================================================
-- LEADS TABLE
-- =====================================================
CREATE TABLE leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    company TEXT,
    position TEXT,
    status TEXT CHECK(status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost')) DEFAULT 'new',
    source TEXT CHECK(source IN ('website', 'referral', 'cold-call', 'email', 'social-media', 'event', 'other')) DEFAULT 'other',
    priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    estimated_value REAL DEFAULT 0,
    assigned_to INTEGER REFERENCES users(id),
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    next_follow_up TIMESTAMP,
    last_contact TIMESTAMP,
    notes TEXT,
    tags TEXT  -- JSON array of tags
);

CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_created_by ON leads(created_by);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_next_follow_up ON leads(next_follow_up);
CREATE INDEX idx_leads_priority ON leads(priority);

-- =====================================================
-- CALLS TABLE
-- =====================================================
CREATE TABLE calls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    call_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration INTEGER DEFAULT 0,  -- in seconds
    outcome TEXT CHECK(outcome IN ('answered', 'no-answer', 'voicemail', 'busy', 'callback', 'meeting-scheduled', 'not-interested')) DEFAULT 'answered',
    notes TEXT,
    recording_url TEXT,
    script_used TEXT,
    sentiment TEXT CHECK(sentiment IN ('positive', 'neutral', 'negative')),
    next_action TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_calls_lead_id ON calls(lead_id);
CREATE INDEX idx_calls_user_id ON calls(user_id);
CREATE INDEX idx_calls_call_date ON calls(call_date);

-- =====================================================
-- CONVERSATIONS TABLE
-- =====================================================
CREATE TABLE conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    message_type TEXT CHECK(message_type IN ('note', 'email', 'sms', 'call-summary', 'meeting-notes')) DEFAULT 'note',
    is_internal BOOLEAN DEFAULT FALSE,  -- Internal notes vs. customer-facing
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conversations_lead_id ON conversations(lead_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);

-- =====================================================
-- ACTIVITY LOGS TABLE (Audit Trail)
-- =====================================================
CREATE TABLE activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    details TEXT,  -- JSON string
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- =====================================================
-- CALL SCRIPTS TABLE
-- =====================================================
CREATE TABLE call_scripts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_call_scripts_is_active ON call_scripts(is_active);
CREATE INDEX idx_call_scripts_category ON call_scripts(category);

-- =====================================================
-- TASKS TABLE (Follow-ups and Reminders)
-- =====================================================
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP,
    priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    status TEXT CHECK(status IN ('pending', 'in-progress', 'completed', 'cancelled')) DEFAULT 'pending',
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_lead_id ON tasks(lead_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- =====================================================
-- TAGS TABLE
-- =====================================================
CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tags_name ON tags(name);

-- =====================================================
-- LEAD_TAGS TABLE (Many-to-Many)
-- =====================================================
CREATE TABLE lead_tags (
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (lead_id, tag_id)
);

CREATE INDEX idx_lead_tags_lead_id ON lead_tags(lead_id);
CREATE INDEX idx_lead_tags_tag_id ON lead_tags(tag_id);

-- =====================================================
-- SEED DATA (Optional - for testing)
-- =====================================================

-- Insert default call scripts
INSERT INTO call_scripts (title, content, category, description, is_active, created_at) VALUES
('Initial Cold Call', 'Hi [Name], this is [Your Name] from Scholarix. I noticed [Company] could benefit from our education solutions. Do you have a moment to discuss how we help institutions improve student outcomes?', 'cold-call', 'Standard opening for cold calls', TRUE, CURRENT_TIMESTAMP),
('Follow-up Call', 'Hi [Name], following up on our conversation from [Date]. I wanted to discuss [Topic] and see if you had any questions about our proposal.', 'follow-up', 'Standard follow-up script', TRUE, CURRENT_TIMESTAMP),
('Demo Scheduling', 'Hi [Name], thank you for your interest in Scholarix. I''d love to schedule a personalized demo. Are you available [Day] at [Time]?', 'demo', 'Demo scheduling script', TRUE, CURRENT_TIMESTAMP);

-- Insert default tags
INSERT INTO tags (name, color) VALUES
('Hot Lead', '#EF4444'),
('Qualified', '#10B981'),
('Decision Maker', '#8B5CF6'),
('Budget Approved', '#F59E0B'),
('Needs Nurturing', '#6B7280');

-- =====================================================
-- VIEWS (For easier querying)
-- =====================================================

-- View: Lead with assignment details
CREATE VIEW v_leads_detailed AS
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
LEFT JOIN users c ON l.created_by = c.id;

-- View: Call statistics per user
CREATE VIEW v_user_call_stats AS
SELECT 
    u.id,
    u.full_name,
    COUNT(c.id) as total_calls,
    SUM(c.duration) as total_duration,
    AVG(c.duration) as avg_duration,
    COUNT(CASE WHEN c.outcome = 'answered' THEN 1 END) as answered_calls,
    COUNT(CASE WHEN c.outcome IN ('no-answer', 'voicemail', 'busy') THEN 1 END) as missed_calls
FROM users u
LEFT JOIN calls c ON u.id = c.user_id
GROUP BY u.id, u.full_name;

-- View: Lead pipeline summary
CREATE VIEW v_pipeline_summary AS
SELECT 
    status,
    COUNT(*) as count,
    SUM(estimated_value) as total_value,
    AVG(estimated_value) as avg_value
FROM leads
GROUP BY status;

-- =====================================================
-- TRIGGERS (Automatic timestamp updates)
-- =====================================================

-- Update 'updated_at' on users table
CREATE TRIGGER update_users_timestamp 
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Update 'updated_at' on leads table
CREATE TRIGGER update_leads_timestamp 
AFTER UPDATE ON leads
BEGIN
    UPDATE leads SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Update 'updated_at' on call_scripts table
CREATE TRIGGER update_call_scripts_timestamp 
AFTER UPDATE ON call_scripts
BEGIN
    UPDATE call_scripts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Update 'updated_at' on tasks table
CREATE TRIGGER update_tasks_timestamp 
AFTER UPDATE ON tasks
BEGIN
    UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Increment script usage count
CREATE TRIGGER increment_script_usage 
AFTER INSERT ON calls
WHEN NEW.script_used IS NOT NULL
BEGIN
    UPDATE call_scripts 
    SET usage_count = usage_count + 1 
    WHERE title = NEW.script_used;
END;

-- Update last_contact on lead when call is made
CREATE TRIGGER update_lead_last_contact 
AFTER INSERT ON calls
BEGIN
    UPDATE leads 
    SET last_contact = NEW.call_date 
    WHERE id = NEW.lead_id;
END;

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================
-- Run this script using:
-- wrangler d1 execute scholarix-crm-db --file=./migrations/0001_initial_schema.sql
