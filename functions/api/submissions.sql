-- D1 Database Schema for 3mpwr App Submissions
-- This schema stores event and campaign submissions for admin review

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('event', 'campaign')),
  data TEXT NOT NULL,
  submitted_by_uid TEXT NOT NULL,
  submitted_by_email TEXT,
  submitted_by_name TEXT,
  submitted_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at INTEGER,
  reviewed_by TEXT,
  reviewer_notes TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_submissions_type ON submissions(type);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_by ON submissions(submitted_by_uid);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_type_status ON submissions(type, status);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_submissions_timestamp 
AFTER UPDATE ON submissions
BEGIN
  UPDATE submissions SET updated_at = unixepoch() WHERE id = NEW.id;
END;
