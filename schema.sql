-- Database schema for Amy for Texas volunteer system
-- Run this with: wrangler d1 execute amyfortexas-volunteers --file=./schema.sql

CREATE TABLE IF NOT EXISTS volunteers (
    id TEXT PRIMARY KEY,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    zipCode TEXT NOT NULL,
    interests TEXT NOT NULL, -- JSON array of volunteer interests
    availability TEXT, -- When they're available to volunteer
    experience TEXT, -- Previous volunteer experience
    message TEXT, -- Additional message/comments
    subscribeNewsletter INTEGER DEFAULT 0, -- 1 for true, 0 for false
    submittedAt TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for efficient email lookups (prevent duplicates)
CREATE INDEX IF NOT EXISTS idx_volunteers_email ON volunteers(email);

-- Create index for zip code queries (geographic analysis)
CREATE INDEX IF NOT EXISTS idx_volunteers_zipcode ON volunteers(zipCode);

-- Create index for submission date queries
CREATE INDEX IF NOT EXISTS idx_volunteers_submitted ON volunteers(submittedAt);
