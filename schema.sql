-- Mobile Phone Requests Database Schema
-- This file contains the SQL schema for storing mobile phone requests in D1

-- Create mobile_phone_requests table
CREATE TABLE IF NOT EXISTS mobile_phone_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone_number TEXT NOT NULL,
  country_code TEXT NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('offer_config', 'notification', 'support', 'other')),
  user_agent TEXT,
  ip_address TEXT,
  timestamp TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  metadata TEXT, -- JSON string
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_phone_number ON mobile_phone_requests(phone_number);
CREATE INDEX IF NOT EXISTS idx_request_type ON mobile_phone_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_status ON mobile_phone_requests(status);
CREATE INDEX IF NOT EXISTS idx_timestamp ON mobile_phone_requests(timestamp);
CREATE INDEX IF NOT EXISTS idx_created_at ON mobile_phone_requests(created_at);

-- Create a composite index for common queries
CREATE INDEX IF NOT EXISTS idx_phone_status ON mobile_phone_requests(phone_number, status);
CREATE INDEX IF NOT EXISTS idx_type_status ON mobile_phone_requests(request_type, status);

-- Example data (optional - for testing)
INSERT OR IGNORE INTO mobile_phone_requests (
  phone_number,
  country_code,
  request_type,
  user_agent,
  ip_address,
  timestamp,
  status,
  metadata
) VALUES 
(
  '+1234567890',
  'US',
  'offer_config',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
  '192.168.1.1',
  datetime('now'),
  'pending',
  '{"app_version": "1.0.0", "device_type": "mobile", "offer_id": "offer_123"}'
),
(
  '+9876543210',
  'CA',
  'notification',
  'Mozilla/5.0 (Android 12; Mobile; rv:91.0)',
  '192.168.1.2',
  datetime('now'),
  'processed',
  '{"notification_type": "promotional", "campaign_id": "campaign_456"}'
),
(
  '+5555555555',
  'UK',
  'support',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
  '192.168.1.3',
  datetime('now'),
  'pending',
  '{"issue_type": "technical", "priority": "high"}'
);