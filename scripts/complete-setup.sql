-- ============================================================
-- COMPLETE DATABASE SETUP — Run this in Supabase SQL Editor
-- ============================================================

-- 1. ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  username VARCHAR(50) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- 2. WEBSITES TABLE
CREATE TABLE IF NOT EXISTS websites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES admin_users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) NOT NULL,
  landing_page_url TEXT NOT NULL,
  safe_page_url TEXT NOT NULL,
  allowed_countries JSONB DEFAULT '[]',
  blocked_ad_platforms JSONB DEFAULT '[]',
  max_visit_limit INTEGER DEFAULT 10,
  visit_limit_time_hours INTEGER DEFAULT 24,
  is_active BOOLEAN DEFAULT true,
  cloaking_enabled BOOLEAN DEFAULT true,
  campaign_code VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ACCESS LOGS TABLE (main logging table)
CREATE TABLE IF NOT EXISTS access_logs (
  id BIGSERIAL PRIMARY KEY,
  website_id INTEGER REFERENCES websites(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  country VARCHAR(10) DEFAULT 'UNKNOWN',
  user_agent TEXT,
  page_shown VARCHAR(50) DEFAULT 'landing',
  is_bot BOOLEAN DEFAULT false,
  bot_type VARCHAR(100),
  bot_confidence DECIMAL(4,3),
  action_taken VARCHAR(50) DEFAULT 'stay_on_landing',
  reason VARCHAR(100),
  referrer TEXT,
  pathname TEXT DEFAULT '/',
  ad_platform VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CONTACT SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS contact_submissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_access_logs_website_id ON access_logs(website_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON access_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_is_bot ON access_logs(is_bot);
CREATE INDEX IF NOT EXISTS idx_access_logs_country ON access_logs(country);
CREATE INDEX IF NOT EXISTS idx_access_logs_ip ON access_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_websites_domain ON websites(domain);

-- 6. ROW LEVEL SECURITY
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (used by backend API)
CREATE POLICY "Service role full access on admin_users"
  ON admin_users FOR ALL USING (true);

CREATE POLICY "Service role full access on websites"
  ON websites FOR ALL USING (true);

CREATE POLICY "Service role full access on access_logs"
  ON access_logs FOR ALL USING (true);

-- 7. DEMO ADMIN USER
-- Password: Admin@123 (bcrypt hash)
INSERT INTO admin_users (name, username, email, password_hash, role)
VALUES (
  'Admin',
  'admin',
  'admin@example.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- 8. DEMO WEBSITE
INSERT INTO websites (name, domain, landing_page_url, safe_page_url, allowed_countries, blocked_ad_platforms, is_active, cloaking_enabled)
VALUES (
  'My First Website',
  'example.com',
  'https://example.com',
  'https://example.com/safe',
  '["US", "CA", "GB", "AU", "IN"]',
  '["google", "facebook"]',
  true,
  true
) ON CONFLICT DO NOTHING;

