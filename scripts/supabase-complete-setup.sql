-- Traffic Filter Pro - Complete Supabase Database Setup
-- Run this script in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS access_logs CASCADE;
DROP TABLE IF EXISTS traffic_logs CASCADE;
DROP TABLE IF EXISTS bot_patterns CASCADE;
DROP TABLE IF EXISTS bot_learning_data CASCADE;
DROP TABLE IF EXISTS websites CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS contact_submissions CASCADE;

-- Create admin_users table
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Create websites table with all required columns
CREATE TABLE websites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES admin_users(id) ON DELETE CASCADE DEFAULT 1,
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) NOT NULL,
  landing_page_url TEXT NOT NULL DEFAULT '/pricing',
  safe_page_url TEXT NOT NULL DEFAULT '/safe',
  allowed_countries JSONB DEFAULT '[]'::jsonb,
  blocked_ad_platforms JSONB DEFAULT '[]'::jsonb,
  max_visit_limit INTEGER DEFAULT 10,
  visit_limit_time_hours INTEGER DEFAULT 24,
  frequency VARCHAR(50) DEFAULT 'daily',
  is_active BOOLEAN DEFAULT true,
  cloaking_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create access_logs table (main logging table)
CREATE TABLE access_logs (
  id SERIAL PRIMARY KEY,
  website_id INTEGER REFERENCES websites(id) ON DELETE CASCADE,
  ip_address VARCHAR(45) NOT NULL,
  country VARCHAR(10),
  user_agent TEXT,
  page_shown VARCHAR(50) DEFAULT 'landing',
  is_bot BOOLEAN DEFAULT false,
  bot_type VARCHAR(100),
  bot_confidence DECIMAL(3,2) DEFAULT 0.0,
  referrer TEXT,
  pathname VARCHAR(500),
  session_id VARCHAR(255),
  fingerprint TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create traffic_logs table (detailed analytics)
CREATE TABLE traffic_logs (
  id SERIAL PRIMARY KEY,
  website_id INTEGER REFERENCES websites(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES admin_users(id) ON DELETE CASCADE,
  ip_address INET NOT NULL,
  country VARCHAR(10),
  user_agent TEXT,
  page_shown VARCHAR(50),
  is_bot BOOLEAN DEFAULT false,
  bot_type VARCHAR(100),
  bot_confidence DECIMAL(3,2),
  is_allowed BOOLEAN DEFAULT true,
  block_reason VARCHAR(255),
  referrer TEXT,
  session_id VARCHAR(255),
  visit_count INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bot_patterns table
CREATE TABLE bot_patterns (
  id SERIAL PRIMARY KEY,
  pattern VARCHAR(500) NOT NULL UNIQUE,
  pattern_type VARCHAR(20) DEFAULT 'contains' CHECK (pattern_type IN ('regex', 'contains', 'exact')),
  bot_category VARCHAR(100) NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 0.95,
  is_active BOOLEAN DEFAULT true,
  auto_detected BOOLEAN DEFAULT false,
  detection_count INTEGER DEFAULT 0,
  last_detected TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bot_learning_data table
CREATE TABLE bot_learning_data (
  id SERIAL PRIMARY KEY,
  user_agent TEXT NOT NULL,
  ip_address VARCHAR(45),
  headers JSONB DEFAULT '{}'::jsonb,
  behavior_pattern JSONB DEFAULT '{}'::jsonb,
  classification JSONB DEFAULT '{}'::jsonb,
  learning_source VARCHAR(100) DEFAULT 'auto',
  verified BOOLEAN DEFAULT false,
  auto_added BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create contact_submissions table
CREATE TABLE contact_submissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_access_logs_created_at ON access_logs(created_at);
CREATE INDEX idx_access_logs_website_id ON access_logs(website_id);
CREATE INDEX idx_access_logs_is_bot ON access_logs(is_bot);
CREATE INDEX idx_access_logs_ip_address ON access_logs(ip_address);
CREATE INDEX idx_access_logs_country ON access_logs(country);
CREATE INDEX idx_traffic_logs_website_id ON traffic_logs(website_id);
CREATE INDEX idx_traffic_logs_created_at ON traffic_logs(created_at);
CREATE INDEX idx_traffic_logs_is_bot ON traffic_logs(is_bot);
CREATE INDEX idx_websites_user_id ON websites(user_id);
CREATE INDEX idx_websites_domain ON websites(domain);
CREATE INDEX idx_bot_patterns_active ON bot_patterns(is_active);
CREATE INDEX idx_bot_patterns_category ON bot_patterns(bot_category);

-- Insert default admin user (password: admin123 - hashed with bcrypt)
INSERT INTO admin_users (username, email, password_hash, role) 
VALUES ('admin', 'admin@example.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqO', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample website for testing
INSERT INTO websites (
  user_id, 
  name, 
  domain, 
  landing_page_url, 
  safe_page_url, 
  allowed_countries, 
  blocked_ad_platforms,
  max_visit_limit,
  visit_limit_time_hours,
  frequency,
  is_active,
  cloaking_enabled
) VALUES (
  1,
  'Sample Website',
  'localhost:3000',
  '/pricing',
  '/safe',
  '["US", "CA", "GB", "AU", "DE", "FR"]'::jsonb,
  '["googlebot", "bingbot", "facebook", "integral_ad_science", "double_verify"]'::jsonb,
  10,
  24,
  'daily',
  true,
  true
) ON CONFLICT DO NOTHING;

-- Insert comprehensive bot patterns
INSERT INTO bot_patterns (pattern, pattern_type, bot_category, confidence_score) VALUES
-- Search Engine Bots
('googlebot', 'contains', 'Search Engine', 0.99),
('bingbot', 'contains', 'Search Engine', 0.99),
('slurp', 'contains', 'Search Engine', 0.99),
('duckduckbot', 'contains', 'Search Engine', 0.99),
('baiduspider', 'contains', 'Search Engine', 0.99),
('yandexbot', 'contains', 'Search Engine', 0.99),

-- Social Media Bots
('facebookexternalhit', 'contains', 'Social Media', 0.98),
('twitterbot', 'contains', 'Social Media', 0.98),
('linkedinbot', 'contains', 'Social Media', 0.98),
('pinterest', 'contains', 'Social Media', 0.98),
('instagram', 'contains', 'Social Media', 0.98),

-- Ad Verification (CRITICAL)
('integral.*ad.*science', 'regex', 'Ad Verification', 0.99),
('doubleverify', 'contains', 'Ad Verification', 0.99),
('moat', 'contains', 'Ad Verification', 0.99),
('grapeshot', 'contains', 'Ad Verification', 0.99),
('peer39', 'contains', 'Ad Verification', 0.99),
('pixalate', 'contains', 'Ad Verification', 0.99),
('forensiq', 'contains', 'Ad Verification', 0.99),
('white.*ops', 'regex', 'Ad Verification', 0.99),

-- Content Discovery
('taboola', 'contains', 'Content Discovery', 0.97),
('outbrain', 'contains', 'Content Discovery', 0.97),
('revcontent', 'contains', 'Content Discovery', 0.97),
('mgid', 'contains', 'Content Discovery', 0.97),

-- SEO Tools
('ahrefs', 'contains', 'SEO Tools', 0.96),
('semrush', 'contains', 'SEO Tools', 0.96),
('moz', 'contains', 'SEO Tools', 0.96),
('majestic', 'contains', 'SEO Tools', 0.96),
('screaming frog', 'contains', 'SEO Tools', 0.96),

-- AI/LLM Bots
('gptbot', 'contains', 'AI/LLM', 0.98),
('chatgpt', 'contains', 'AI/LLM', 0.98),
('claude', 'contains', 'AI/LLM', 0.98),
('anthropic', 'contains', 'AI/LLM', 0.98),
('openai', 'contains', 'AI/LLM', 0.98),
('bard', 'contains', 'AI/LLM', 0.98),

-- Generic Bot Patterns
('bot', 'contains', 'Generic Bot', 0.85),
('crawler', 'contains', 'Generic Bot', 0.85),
('spider', 'contains', 'Generic Bot', 0.85),
('scraper', 'contains', 'Generic Bot', 0.85),
('headless', 'contains', 'Automation', 0.90),
('selenium', 'contains', 'Automation', 0.95),
('puppeteer', 'contains', 'Automation', 0.95),
('playwright', 'contains', 'Automation', 0.95)

ON CONFLICT (pattern) DO NOTHING;

-- Insert sample access logs for testing
INSERT INTO access_logs (
  website_id, 
  ip_address, 
  country, 
  user_agent, 
  page_shown, 
  is_bot, 
  bot_type, 
  bot_confidence,
  referrer,
  pathname,
  created_at
) VALUES 
(1, '192.168.1.100', 'US', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'safe', false, null, 0.0, 'https://google.com', '/', NOW() - INTERVAL '1 hour'),
(1, '66.249.66.1', 'US', 'Mozilla/5.0 (compatible; Googlebot/2.1)', 'landing', true, 'Googlebot', 0.95, 'Direct', '/pricing', NOW() - INTERVAL '2 hours'),
(1, '192.168.1.101', 'CA', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'safe', false, null, 0.0, 'https://facebook.com', '/', NOW() - INTERVAL '3 hours'),
(1, '157.55.39.1', 'US', 'Mozilla/5.0 (compatible; bingbot/2.0)', 'landing', true, 'Bingbot', 0.95, 'Direct', '/pricing', NOW() - INTERVAL '4 hours'),
(1, '192.168.1.102', 'GB', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15', 'safe', false, null, 0.0, 'https://twitter.com', '/', NOW() - INTERVAL '5 hours'),
(1, '173.252.66.1', 'US', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', 'landing', true, 'Facebook Bot', 0.90, 'Direct', '/pricing', NOW() - INTERVAL '6 hours'),
(1, '192.168.1.103', 'DE', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'safe', false, null, 0.0, 'https://google.de', '/', NOW() - INTERVAL '7 hours'),
(1, '40.77.167.1', 'US', 'Mozilla/5.0 (compatible; bingbot/2.0)', 'landing', true, 'Bingbot', 0.95, 'Direct', '/pricing', NOW() - INTERVAL '8 hours')

ON CONFLICT DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_websites_updated_at 
    BEFORE UPDATE ON websites 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bot_patterns_updated_at 
    BEFORE UPDATE ON bot_patterns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for better security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_learning_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access (allows full access for API)
CREATE POLICY "Service role can do everything on admin_users" ON admin_users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on websites" ON websites
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on access_logs" ON access_logs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on traffic_logs" ON traffic_logs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on bot_patterns" ON bot_patterns
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on bot_learning_data" ON bot_learning_data
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on contact_submissions" ON contact_submissions
  FOR ALL USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Traffic Filter Pro database setup completed successfully!';
    RAISE NOTICE 'Default admin login: admin@example.com / admin123';
    RAISE NOTICE 'Sample website created for localhost:3000';
    RAISE NOTICE 'Bot detection patterns loaded: %', (SELECT COUNT(*) FROM bot_patterns);
    RAISE NOTICE 'Sample access logs created: %', (SELECT COUNT(*) FROM access_logs);
END $$;
