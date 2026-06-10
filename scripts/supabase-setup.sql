-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create websites table
CREATE TABLE IF NOT EXISTS websites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) NOT NULL,
  landing_page_url TEXT NOT NULL,
  safe_page_url TEXT NOT NULL,
  allowed_countries JSONB DEFAULT '[]'::jsonb,
  blocked_ad_platforms JSONB DEFAULT '[]'::jsonb,
  max_visit_limit INTEGER,
  visit_limit_time_hours INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create access_logs table
CREATE TABLE IF NOT EXISTS access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
  ip_address INET NOT NULL,
  country VARCHAR(10),
  user_agent TEXT,
  page_shown VARCHAR(50) DEFAULT 'landing',
  is_bot BOOLEAN DEFAULT false,
  bot_type VARCHAR(100),
  bot_confidence DECIMAL(3,2) DEFAULT 0.0,
  referrer TEXT,
  session_id VARCHAR(255),
  visit_duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bot_patterns table for dynamic bot detection
CREATE TABLE IF NOT EXISTS bot_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pattern VARCHAR(500) NOT NULL UNIQUE,
  pattern_type VARCHAR(20) DEFAULT 'regex' CHECK (pattern_type IN ('regex', 'contains', 'exact')),
  bot_category VARCHAR(100) NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 0.8,
  is_active BOOLEAN DEFAULT true,
  auto_detected BOOLEAN DEFAULT false,
  detection_count INTEGER DEFAULT 0,
  last_detected TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bot_learning_data table for ML learning
CREATE TABLE IF NOT EXISTS bot_learning_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_agent TEXT NOT NULL,
  ip_address INET NOT NULL,
  headers JSONB DEFAULT '{}'::jsonb,
  behavior_pattern JSONB DEFAULT '{}'::jsonb,
  classification JSONB DEFAULT '{}'::jsonb,
  learning_source VARCHAR(50) DEFAULT 'auto',
  verified BOOLEAN DEFAULT false,
  auto_added BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bot_update_logs table to track automatic updates
CREATE TABLE IF NOT EXISTS bot_update_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  update_type VARCHAR(50) NOT NULL,
  patterns_added INTEGER DEFAULT 0,
  patterns_updated INTEGER DEFAULT 0,
  patterns_removed INTEGER DEFAULT 0,
  update_source VARCHAR(100),
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON access_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_access_logs_website_id ON access_logs(website_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_is_bot ON access_logs(is_bot);
CREATE INDEX IF NOT EXISTS idx_access_logs_ip_address ON access_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_websites_user_id ON websites(user_id);
CREATE INDEX IF NOT EXISTS idx_websites_domain ON websites(domain);
CREATE INDEX IF NOT EXISTS idx_bot_patterns_active ON bot_patterns(is_active);
CREATE INDEX IF NOT EXISTS idx_bot_patterns_category ON bot_patterns(bot_category);
CREATE INDEX IF NOT EXISTS idx_bot_learning_data_created_at ON bot_learning_data(created_at);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_learning_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_users
CREATE POLICY "Users can view own profile" ON admin_users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON admin_users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- RLS Policies for websites
CREATE POLICY "Users can view own websites" ON websites
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own websites" ON websites
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own websites" ON websites
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own websites" ON websites
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- RLS Policies for access_logs (users can view logs for their websites)
CREATE POLICY "Users can view logs for own websites" ON access_logs
  FOR SELECT USING (
    website_id IN (
      SELECT id FROM websites WHERE user_id::text = auth.uid()::text
    )
  );

-- RLS Policies for bot_patterns (read-only for users, admin can modify)
CREATE POLICY "Anyone can view active bot patterns" ON bot_patterns
  FOR SELECT USING (is_active = true);

-- Insert initial bot patterns
INSERT INTO bot_patterns (pattern, pattern_type, bot_category, confidence_score, auto_detected) VALUES
-- Search Engine Bots
('googlebot', 'contains', 'search_engine', 0.95, false),
('bingbot', 'contains', 'search_engine', 0.95, false),
('slurp', 'contains', 'search_engine', 0.95, false),
('duckduckbot', 'contains', 'search_engine', 0.95, false),
('baiduspider', 'contains', 'search_engine', 0.95, false),
('yandexbot', 'contains', 'search_engine', 0.95, false),

-- Social Media Bots
('facebookexternalhit', 'contains', 'social_media', 0.90, false),
('twitterbot', 'contains', 'social_media', 0.90, false),
('linkedinbot', 'contains', 'social_media', 0.90, false),
('whatsapp', 'contains', 'social_media', 0.85, false),
('telegram', 'contains', 'social_media', 0.85, false),

-- Ad Verification Bots (CRITICAL)
('adsbot', 'contains', 'ad_verification', 0.98, false),
('mediapartners', 'contains', 'ad_verification', 0.98, false),
('adnxs', 'contains', 'ad_verification', 0.98, false),
('doubleclick', 'contains', 'ad_verification', 0.98, false),
('googlesyndication', 'contains', 'ad_verification', 0.98, false),
('googleadservices', 'contains', 'ad_verification', 0.98, false),
('integral.*ad.*science', 'regex', 'ad_verification', 0.99, false),
('doubleverify', 'contains', 'ad_verification', 0.99, false),
('moat', 'contains', 'ad_verification', 0.99, false),
('grapeshot', 'contains', 'ad_verification', 0.99, false),
('peer39', 'contains', 'ad_verification', 0.99, false),
('forensiq', 'contains', 'ad_verification', 0.99, false),
('pixalate', 'contains', 'ad_verification', 0.99, false),
('white.*ops', 'regex', 'ad_verification', 0.99, false),

-- SEO Tools
('semrush', 'contains', 'seo_tool', 0.90, false),
('ahrefs', 'contains', 'seo_tool', 0.90, false),
('moz', 'contains', 'seo_tool', 0.90, false),
('majestic', 'contains', 'seo_tool', 0.90, false),
('screaming', 'contains', 'seo_tool', 0.90, false),

-- Automation Tools
('selenium', 'contains', 'automation', 0.95, false),
('puppeteer', 'contains', 'automation', 0.95, false),
('playwright', 'contains', 'automation', 0.95, false),
('headless', 'contains', 'automation', 0.95, false),
('phantom', 'contains', 'automation', 0.95, false),

-- Programming Languages/Tools
('curl', 'contains', 'programming', 0.90, false),
('wget', 'contains', 'programming', 0.90, false),
('python', 'contains', 'programming', 0.85, false),
('java', 'contains', 'programming', 0.85, false),
('go-http', 'contains', 'programming', 0.85, false),
('postman', 'contains', 'programming', 0.85, false),

-- Generic Bot Patterns
('bot', 'contains', 'generic', 0.80, false),
('crawler', 'contains', 'generic', 0.80, false),
('spider', 'contains', 'generic', 0.80, false),
('scraper', 'contains', 'generic', 0.80, false),
('fetcher', 'contains', 'generic', 0.80, false),
('monitor', 'contains', 'generic', 0.75, false),
('checker', 'contains', 'generic', 0.75, false),
('validator', 'contains', 'generic', 0.75, false),
('analyzer', 'contains', 'generic', 0.75, false),
('scanner', 'contains', 'generic', 0.75, false)

ON CONFLICT (pattern) DO NOTHING;

-- Insert sample admin user (password: admin123)
INSERT INTO admin_users (email, name, password_hash, role) VALUES
('admin@example.com', 'Admin User', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample website
INSERT INTO websites (user_id, name, domain, landing_page_url, safe_page_url, allowed_countries, is_active) VALUES
((SELECT id FROM admin_users WHERE email = 'admin@example.com' LIMIT 1), 
 'Sample Campaign', 
 'localhost:3000', 
 'http://localhost:3000/', 
 'http://localhost:3000/safe', 
 '["US", "CA", "GB", "AU"]'::jsonb, 
 true)
ON CONFLICT DO NOTHING;

-- Insert sample access logs for testing
INSERT INTO access_logs (website_id, ip_address, country, user_agent, page_shown, is_bot, bot_type, bot_confidence, created_at) VALUES
((SELECT id FROM websites LIMIT 1), '192.168.1.100', 'US', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'safe', false, null, 0.0, NOW() - INTERVAL '5 minutes'),
((SELECT id FROM websites LIMIT 1), '66.249.66.1', 'US', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 'landing', true, 'Googlebot', 0.95, NOW() - INTERVAL '3 minutes'),
((SELECT id FROM websites LIMIT 1), '192.168.1.101', 'CA', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'safe', false, null, 0.0, NOW() - INTERVAL '2 minutes'),
((SELECT id FROM websites LIMIT 1), '173.252.66.1', 'US', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', 'landing', true, 'Facebook Bot', 0.90, NOW() - INTERVAL '1 minute'),
((SELECT id FROM websites LIMIT 1), '192.168.1.102', 'GB', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15', 'safe', false, null, 0.0, NOW());

-- Create function to update bot pattern detection count
CREATE OR REPLACE FUNCTION update_bot_pattern_detection(pattern_text TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE bot_patterns 
  SET detection_count = detection_count + 1,
      last_detected = NOW(),
      updated_at = NOW()
  WHERE pattern = pattern_text AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-learn new bot patterns
CREATE OR REPLACE FUNCTION auto_learn_bot_pattern(
  user_agent_text TEXT,
  confidence DECIMAL(3,2) DEFAULT 0.8
)
RETURNS VOID AS $$
DECLARE
  potential_pattern TEXT;
  word_count INTEGER;
BEGIN
  -- Extract potential bot patterns from user agent
  SELECT INTO potential_pattern 
    CASE 
      WHEN user_agent_text ~* 'bot|crawler|spider|scraper' THEN 
        (regexp_matches(user_agent_text, '([a-zA-Z]+(?:bot|crawler|spider|scraper))', 'i'))[1]
      WHEN user_agent_text ~* '[a-zA-Z]+/[0-9]+\.[0-9]+' THEN
        (regexp_matches(user_agent_text, '([a-zA-Z]+)/[0-9]+\.[0-9]+', 'i'))[1]
      ELSE NULL
    END;
  
  -- Only add if pattern is meaningful and doesn't exist
  IF potential_pattern IS NOT NULL AND LENGTH(potential_pattern) > 3 THEN
    INSERT INTO bot_patterns (pattern, pattern_type, bot_category, confidence_score, auto_detected, detection_count)
    VALUES (LOWER(potential_pattern), 'contains', 'auto_detected', confidence, true, 1)
    ON CONFLICT (pattern) DO UPDATE SET
      detection_count = bot_patterns.detection_count + 1,
      last_detected = NOW(),
      updated_at = NOW();
  END IF;
END;
$$ LANGUAGE plpgsql;
