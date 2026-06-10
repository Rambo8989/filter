-- Create comprehensive access logs table for tracking all visitor activity
CREATE TABLE IF NOT EXISTS access_logs (
    id SERIAL PRIMARY KEY,
    website_id INTEGER,
    ip_address INET NOT NULL,
    country VARCHAR(10),
    user_agent TEXT,
    page_shown VARCHAR(50) DEFAULT 'safe',
    is_bot BOOLEAN DEFAULT FALSE,
    bot_type VARCHAR(100),
    bot_confidence DECIMAL(3,2),
    referrer TEXT,
    pathname VARCHAR(500),
    session_id VARCHAR(255),
    visit_duration INTEGER, -- in seconds
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON access_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_access_logs_website_id ON access_logs(website_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_is_bot ON access_logs(is_bot);
CREATE INDEX IF NOT EXISTS idx_access_logs_ip_address ON access_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_access_logs_country ON access_logs(country);
CREATE INDEX IF NOT EXISTS idx_access_logs_page_shown ON access_logs(page_shown);

-- Insert sample data for testing
INSERT INTO access_logs (website_id, ip_address, country, user_agent, page_shown, is_bot, bot_type, referrer, created_at)
VALUES 
(1, '192.168.1.100', 'US', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'safe', false, null, 'https://google.com', NOW() - INTERVAL '5 minutes'),
(1, '66.249.66.1', 'US', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 'decoy', true, 'Google Bot', 'Direct', NOW() - INTERVAL '3 minutes'),
(1, '192.168.1.101', 'CA', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'safe', false, null, 'https://facebook.com', NOW() - INTERVAL '2 minutes'),
(1, '173.252.66.1', 'US', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', 'decoy', true, 'Facebook Bot', 'Direct', NOW() - INTERVAL '1 minute'),
(1, '192.168.1.102', 'GB', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15', 'safe', false, null, 'Direct', NOW());

-- Create bot detection patterns table
CREATE TABLE IF NOT EXISTS bot_patterns (
    id SERIAL PRIMARY KEY,
    pattern_type VARCHAR(50) NOT NULL, -- 'user_agent', 'ip_range', 'behavior'
    pattern_value TEXT NOT NULL,
    bot_name VARCHAR(100),
    category VARCHAR(50), -- 'search_engine', 'social_media', 'ad_verification', etc.
    is_blocked BOOLEAN DEFAULT TRUE,
    confidence_score DECIMAL(3,2) DEFAULT 0.95,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert common bot patterns
INSERT INTO bot_patterns (pattern_type, pattern_value, bot_name, category, is_blocked) VALUES
-- Search Engine Bots
('user_agent', '%Googlebot%', 'Google Bot', 'search_engine', FALSE),
('user_agent', '%Bingbot%', 'Bing Bot', 'search_engine', FALSE),
('user_agent', '%Slurp%', 'Yahoo Bot', 'search_engine', FALSE),
('user_agent', '%DuckDuckBot%', 'DuckDuckGo Bot', 'search_engine', FALSE),

-- Social Media Bots
('user_agent', '%facebookexternalhit%', 'Facebook Bot', 'social_media', TRUE),
('user_agent', '%Twitterbot%', 'Twitter Bot', 'social_media', TRUE),
('user_agent', '%LinkedInBot%', 'LinkedIn Bot', 'social_media', TRUE),

-- Ad Verification Bots (CRITICAL TO BLOCK)
('user_agent', '%IAS%', 'Integral Ad Science', 'ad_verification', TRUE),
('user_agent', '%DoubleVerify%', 'DoubleVerify', 'ad_verification', TRUE),
('user_agent', '%Moat%', 'Moat Oracle', 'ad_verification', TRUE),
('user_agent', '%Grapeshot%', 'Grapeshot', 'ad_verification', TRUE),
('user_agent', '%Peer39%', 'Peer39', 'ad_verification', TRUE),
('user_agent', '%Pixalate%', 'Pixalate', 'ad_verification', TRUE),

-- SEO Tools
('user_agent', '%AhrefsBot%', 'Ahrefs Bot', 'seo_tools', TRUE),
('user_agent', '%SemrushBot%', 'SEMrush Bot', 'seo_tools', TRUE),
('user_agent', '%MJ12bot%', 'Majestic Bot', 'seo_tools', TRUE),
('user_agent', '%DotBot%', 'Moz Bot', 'seo_tools', TRUE),

-- AI/LLM Bots
('user_agent', '%GPTBot%', 'OpenAI GPT Bot', 'ai_llm', TRUE),
('user_agent', '%ChatGPT%', 'ChatGPT Bot', 'ai_llm', TRUE),
('user_agent', '%Claude%', 'Anthropic Claude', 'ai_llm', TRUE),
('user_agent', '%Bard%', 'Google Bard', 'ai_llm', TRUE),

-- Generic Bot Patterns
('user_agent', '%bot%', 'Generic Bot', 'generic', TRUE),
('user_agent', '%crawler%', 'Generic Crawler', 'generic', TRUE),
('user_agent', '%spider%', 'Generic Spider', 'generic', TRUE),
('user_agent', '%scraper%', 'Generic Scraper', 'generic', TRUE);

-- Create website configurations table
CREATE TABLE IF NOT EXISTS website_configs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL UNIQUE,
    landing_page_url TEXT NOT NULL,
    safe_page_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    allowed_countries TEXT[], -- Array of country codes
    blocked_ad_platforms TEXT[], -- Array of platform IDs
    max_visit_limit INTEGER,
    visit_limit_time_hours INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user visit tracking table
CREATE TABLE IF NOT EXISTS user_visits (
    id SERIAL PRIMARY KEY,
    website_id INTEGER REFERENCES website_configs(id),
    fingerprint_hash VARCHAR(64) NOT NULL,
    ip_address INET NOT NULL,
    visit_count INTEGER DEFAULT 1,
    first_visit TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_visit TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_blocked BOOLEAN DEFAULT FALSE,
    blocked_reason TEXT
);

-- Create indexes for user visits
CREATE INDEX IF NOT EXISTS idx_user_visits_fingerprint ON user_visits(fingerprint_hash);
CREATE INDEX IF NOT EXISTS idx_user_visits_website ON user_visits(website_id);
CREATE INDEX IF NOT EXISTS idx_user_visits_ip ON user_visits(ip_address);

-- Create function to clean old visit data
CREATE OR REPLACE FUNCTION clean_old_visits() RETURNS void AS $$
BEGIN
    -- Delete visit records older than 30 days
    DELETE FROM user_visits WHERE last_visit < NOW() - INTERVAL '30 days';
    
    -- Delete access logs older than 90 days
    DELETE FROM access_logs WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean old data (requires pg_cron extension)
-- SELECT cron.schedule('clean-old-visits', '0 2 * * *', 'SELECT clean_old_visits();');
