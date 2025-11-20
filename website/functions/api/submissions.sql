-- D1 Database Schema for Submissions
-- This is OPTIONAL - only needed if you want to use D1 database for storage
-- If not using D1, submissions can be stored in KV or handled via webhooks

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('event', 'campaign')),
  data TEXT NOT NULL, -- JSON string of event/campaign data
  submitted_by_uid TEXT NOT NULL,
  submitted_by_email TEXT,
  submitted_by_name TEXT,
  submitted_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by TEXT,
  reviewed_at INTEGER,
  review_notes TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_submissions_type ON submissions(type);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_by ON submissions(submitted_by_uid);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_type_status ON submissions(type, status);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_submissions_timestamp 
AFTER UPDATE ON submissions
BEGIN
  UPDATE submissions SET updated_at = unixepoch() WHERE id = NEW.id;
END;

-- Sample query to get pending submissions
-- SELECT * FROM submissions WHERE status = 'pending' ORDER BY submitted_at DESC LIMIT 50;

-- Sample query to get submissions by user
-- SELECT * FROM submissions WHERE submitted_by_uid = ? ORDER BY submitted_at DESC;

-- Sample query to approve a submission
-- UPDATE submissions SET status = 'approved', reviewed_by = ?, reviewed_at = unixepoch(), review_notes = ? WHERE id = ?;

-- Sample query to reject a submission
-- UPDATE submissions SET status = 'rejected', reviewed_by = ?, reviewed_at = unixepoch(), review_notes = ? WHERE id = ?;
