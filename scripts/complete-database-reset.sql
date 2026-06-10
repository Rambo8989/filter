-- Complete Database Reset and Setup Script
-- This script will drop and recreate all tables with the correct schema

-- Drop existing tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS access_logs CASCADE;
DROP TABLE IF EXISTS traffic_logs CASCADE;
DROP TABLE IF EXISTS contact_submissions CASCADE;
DROP TABLE IF EXISTS bot_training_data CASCADE;
DROP TABLE IF EXISTS ml_learning_data CASCADE;
DROP TABLE IF EXISTS bot_patterns CASCADE;
DROP TABLE IF EXISTS websites CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- Create admin_users table
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Create websites table with cloaking_enabled column
CREATE TABLE websites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES admin_users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    landing_page_url TEXT NOT NULL DEFAULT '/pricing',
    safe_page_url TEXT NOT NULL DEFAULT '/safe',
    allowed_countries JSONB DEFAULT '["US", "CA", "GB", "AU", "DE", "FR"]',
    blocked_ad_platforms JSONB DEFAULT '["googlebot", "bingbot", "integral_ad_science", "doubleverify"]',
    max_visit_limit INTEGER DEFAULT 10,
    visit_limit_time_hours INTEGER DEFAULT 24,
    frequency VARCHAR(20) DEFAULT 'daily',
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
    country VARCHAR(10) DEFAULT 'US',
    user_agent TEXT,
    page_shown VARCHAR(20) DEFAULT 'safe',
    page_url TEXT,
    is_bot BOOLEAN DEFAULT FALSE,
    bot_type VARCHAR(100),
    bot_pattern VARCHAR(100),
    bot_confidence DECIMAL(3,2) DEFAULT 0.0,
    confidence_score DECIMAL(3,2) DEFAULT 0.0,
    referrer TEXT,
    pathname TEXT,
    session_id VARCHAR(255),
    fingerprint TEXT,
    features JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create traffic_logs table (additional logging)
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

-- Create contact_submissions table
CREATE TABLE contact_submissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bot_training_data table
CREATE TABLE bot_training_data (
    id SERIAL PRIMARY KEY,
    user_agent TEXT NOT NULL,
    is_bot BOOLEAN NOT NULL,
    category VARCHAR(100),
    confidence DECIMAL(3,2),
    source VARCHAR(50) DEFAULT 'manual',
    verified BOOLEAN DEFAULT false,
    ip_address INET,
    country VARCHAR(10),
    additional_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ml_learning_data table
CREATE TABLE ml_learning_data (
    id SERIAL PRIMARY KEY,
    user_agent TEXT NOT NULL,
    ip_address INET NOT NULL,
    headers JSONB,
    behavior_pattern JSONB,
    classification JSONB,
    learning_source VARCHAR(50),
    verified BOOLEAN DEFAULT false,
    auto_added BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bot_patterns table
CREATE TABLE bot_patterns (
    id SERIAL PRIMARY KEY,
    pattern VARCHAR(255) NOT NULL,
    pattern_type VARCHAR(50) DEFAULT 'user_agent',
    bot_category VARCHAR(100),
    confidence_score DECIMAL(3,2) DEFAULT 0.8,
    is_active BOOLEAN DEFAULT true,
    auto_detected BOOLEAN DEFAULT false,
    detection_count INTEGER DEFAULT 0,
    last_detected TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON access_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_access_logs_website_id ON access_logs(website_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_is_bot ON access_logs(is_bot);
CREATE INDEX IF NOT EXISTS idx_access_logs_ip_address ON access_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_traffic_logs_website_id ON traffic_logs(website_id);
CREATE INDEX IF NOT EXISTS idx_traffic_logs_created_at ON traffic_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_traffic_logs_is_bot ON traffic_logs(is_bot);
CREATE INDEX IF NOT EXISTS idx_websites_user_id ON websites(user_id);
CREATE INDEX IF NOT EXISTS idx_websites_domain ON websites(domain);
CREATE INDEX IF NOT EXISTS idx_websites_is_active ON websites(is_active);
CREATE INDEX IF NOT EXISTS idx_websites_cloaking_enabled ON websites(cloaking_enabled);
CREATE INDEX IF NOT EXISTS idx_websites_domain_cloaking ON websites(domain, is_active, cloaking_enabled);
CREATE INDEX IF NOT EXISTS idx_bot_patterns_active ON bot_patterns(is_active);
CREATE INDEX IF NOT EXISTS idx_bot_patterns_category ON bot_patterns(bot_category);

-- Insert default admin user
INSERT INTO admin_users (username, email, password_hash, role) 
VALUES ('admin', 'admin@example.com', '$2b$10$dummy.hash.for.development', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample websites for testing
INSERT INTO websites (
    user_id, name, domain, landing_page_url, safe_page_url, 
    is_active, cloaking_enabled, allowed_countries, blocked_ad_platforms
) VALUES 
(
    1, 
    'Test Campaign - Cloaking ON', 
    'example-cloaking-on.com', 
    '/pricing', 
    '/safe', 
    true, 
    true,
    '["US", "CA", "GB", "AU", "DE", "FR"]',
    '["googlebot", "bingbot", "integral_ad_science", "doubleverify", "moat"]'
),
(
    1, 
    'Test Campaign - Cloaking OFF', 
    'example-cloaking-off.com', 
    '/pricing', 
    '/safe', 
    true, 
    false,
    '["US", "CA", "GB"]',
    '["googlebot", "bingbot"]'
),
(
    1, 
    'Inactive Campaign', 
    'example-inactive.com', 
    '/pricing', 
    '/safe', 
    false, 
    true,
    '["US"]',
    '["googlebot"]'
)
ON CONFLICT DO NOTHING;

-- Insert sample bot patterns
INSERT INTO bot_patterns (pattern, pattern_type, bot_category, confidence_score, is_active) VALUES
('googlebot', 'user_agent', 'Search Engine', 0.95, true),
('bingbot', 'user_agent', 'Search Engine', 0.95, true),
('facebookexternalhit', 'user_agent', 'Social Media', 0.90, true),
('twitterbot', 'user_agent', 'Social Media', 0.90, true),
('integral', 'user_agent', 'Ad Verification', 0.98, true),
('doubleverify', 'user_agent', 'Ad Verification', 0.98, true),
('moat', 'user_agent', 'Ad Verification', 0.98, true),
('selenium', 'user_agent', 'Automation', 0.95, true),
('puppeteer', 'user_agent', 'Automation', 0.95, true),
('headless', 'user_agent', 'Automation', 0.95, true)
ON CONFLICT DO NOTHING;

-- Insert sample access logs for testing
INSERT INTO access_logs (
    website_id, ip_address, country, user_agent, page_shown, is_bot, bot_type, bot_confidence, created_at
) VALUES 
(1, '192.168.1.100', 'US', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'safe', false, null, 0.1, NOW() - INTERVAL '5 minutes'),
(1, '66.249.66.1', 'US', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 'landing', true, 'googlebot', 0.95, NOW() - INTERVAL '3 minutes'),
(1, '192.168.1.101', 'CA', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'safe', false, null, 0.1, NOW() - INTERVAL '2 minutes'),
(1, '173.252.66.1', 'US', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', 'landing', true, 'facebook', 0.90, NOW() - INTERVAL '1 minute'),
(1, '192.168.1.102', 'GB', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15', 'safe', false, null, 0.1, NOW());

-- Show final status
SELECT 'Database reset completed successfully!' as status;

SELECT 
    'Websites created:' as info,
    COUNT(*) as count
FROM websites;

SELECT 
    'Access logs created:' as info,
    COUNT(*) as count
FROM access_logs;

SELECT 
    'Bot patterns created:' as info,
    COUNT(*) as count
FROM bot_patterns;

-- Show website configuration
SELECT 
  id,
  name,
  domain,
  is_active,
  cloaking_enabled,
  CASE 
    WHEN NOT is_active THEN 'Campaign Inactive - No Processing'
    WHEN is_active AND cloaking_enabled THEN 'Cloaking ON - Traffic Filtered'
    WHEN is_active AND NOT cloaking_enabled THEN 'Cloaking OFF - All Traffic to Landing Page'
  END as traffic_flow_status,
  created_at
FROM websites 
ORDER BY created_at DESC;
