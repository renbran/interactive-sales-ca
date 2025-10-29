-- Migration: Add AI Transcription Capabilities to Calls
-- Version: 0002_add_transcription

-- Add transcription fields to calls table
ALTER TABLE calls ADD transcription TEXT;
ALTER TABLE calls ADD transcription_status TEXT DEFAULT 'pending';
ALTER TABLE calls ADD transcription_language TEXT DEFAULT 'en';
ALTER TABLE calls ADD transcription_confidence REAL;
ALTER TABLE calls ADD transcription_summary TEXT;
ALTER TABLE calls ADD transcription_key_points TEXT;
ALTER TABLE calls ADD transcription_sentiment_analysis TEXT;
ALTER TABLE calls ADD transcription_processed_at TIMESTAMP;
ALTER TABLE calls ADD recording_duration INTEGER DEFAULT 0;

-- Create transcription segments table for detailed timing
CREATE TABLE transcription_segments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    call_id INTEGER NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    segment_index INTEGER NOT NULL,
    start_time REAL NOT NULL, -- in seconds
    end_time REAL NOT NULL, -- in seconds
    text TEXT NOT NULL,
    confidence REAL,
    speaker TEXT, -- 'agent' or 'customer' or 'unknown'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transcription_segments_call_id ON transcription_segments(call_id);
CREATE INDEX idx_transcription_segments_start_time ON transcription_segments(start_time);

-- Create call analytics table for AI insights
CREATE TABLE call_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    call_id INTEGER NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    talk_time_agent INTEGER DEFAULT 0, -- agent talk time in seconds
    talk_time_customer INTEGER DEFAULT 0, -- customer talk time in seconds
    interruptions_count INTEGER DEFAULT 0,
    silence_duration INTEGER DEFAULT 0, -- total silence time in seconds
    sentiment_score REAL, -- -1 to 1 scale
    engagement_score REAL, -- 0 to 1 scale
    key_topics TEXT, -- JSON array of topics discussed
    action_items TEXT, -- JSON array of action items
    objections_raised TEXT, -- JSON array of objections
    buying_signals TEXT, -- JSON array of buying signals
    next_steps TEXT, -- recommended next steps
    call_quality_score REAL, -- 0 to 1 scale
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_call_analytics_call_id ON call_analytics(call_id);
CREATE INDEX idx_call_analytics_sentiment_score ON call_analytics(sentiment_score);
CREATE INDEX idx_call_analytics_quality_score ON call_analytics(call_quality_score);