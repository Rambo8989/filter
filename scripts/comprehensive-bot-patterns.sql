-- Comprehensive Bot Detection Patterns Database
-- This script creates and populates the bot detection system with real, verified patterns

-- Create bot_patterns table if it doesn't exist
CREATE TABLE IF NOT EXISTS bot_patterns (
    id SERIAL PRIMARY KEY,
    pattern VARCHAR(500) NOT NULL,
    pattern_type VARCHAR(50) NOT NULL DEFAULT 'user_agent',
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    source VARCHAR(100) NOT NULL DEFAULT 'manual',
    confidence DECIMAL(3,2) NOT NULL DEFAULT 0.95,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_regex BOOLEAN NOT NULL DEFAULT false,
    description TEXT,
    detection_count INTEGER DEFAULT 0,
    last_detected TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bot_patterns_category ON bot_patterns(category);
CREATE INDEX IF NOT EXISTS idx_bot_patterns_active ON bot_patterns(is_active);
CREATE INDEX IF NOT EXISTS idx_bot_patterns_confidence ON bot_patterns(confidence);
CREATE INDEX IF NOT EXISTS idx_bot_patterns_pattern ON bot_patterns(pattern);

-- Clear existing patterns to avoid duplicates
TRUNCATE TABLE bot_patterns RESTART IDENTITY;

-- Insert real bot patterns (no dummy data)
INSERT INTO bot_patterns (pattern, category, subcategory, source, confidence, description, is_regex) VALUES

-- CRITICAL: Ad Verification Platforms (These are the most important to detect)
('integral-ad-science', 'ad_verification', 'brand_safety', 'verified', 0.99, 'Integral Ad Science verification bot', false),
('ias-va', 'ad_verification', 'brand_safety', 'verified', 0.99, 'IAS verification agent', false),
('doubleverify', 'ad_verification', 'brand_safety', 'verified', 0.99, 'DoubleVerify verification bot', false),
('dv-va', 'ad_verification', 'brand_safety', 'verified', 0.99, 'DoubleVerify verification agent', false),
('moat', 'ad_verification', 'viewability', 'verified', 0.99, 'Moat (Oracle) verification bot', false),
('grapeshot', 'ad_verification', 'brand_safety', 'verified', 0.99, 'Grapeshot brand safety bot', false),
('peer39', 'ad_verification', 'brand_safety', 'verified', 0.99, 'Peer39 verification bot', false),
('pixalate', 'ad_verification', 'fraud_detection', 'verified', 0.99, 'Pixalate fraud detection bot', false),
('whiteops', 'ad_verification', 'fraud_detection', 'verified', 0.99, 'White Ops fraud detection', false),
('forensiq', 'ad_verification', 'fraud_detection', 'verified', 0.99, 'Forensiq fraud detection', false),

-- Search Engine Crawlers
('googlebot', 'search_engine', 'crawler', 'verified', 0.98, 'Google search crawler', false),
('bingbot', 'search_engine', 'crawler', 'verified', 0.98, 'Microsoft Bing crawler', false),
('slurp', 'search_engine', 'crawler', 'verified', 0.98, 'Yahoo search crawler', false),
('duckduckbot', 'search_engine', 'crawler', 'verified', 0.98, 'DuckDuckGo search crawler', false),
('baiduspider', 'search_engine', 'crawler', 'verified', 0.98, 'Baidu search crawler', false),
('yandexbot', 'search_engine', 'crawler', 'verified', 0.98, 'Yandex search crawler', false),
('sogou', 'search_engine', 'crawler', 'verified', 0.95, 'Sogou search crawler', false),
('exabot', 'search_engine', 'crawler', 'verified', 0.95, 'Exalead search crawler', false),

-- Social Media Crawlers
('facebookexternalhit', 'social_media', 'link_preview', 'verified', 0.98, 'Facebook link preview crawler', false),
('twitterbot', 'social_media', 'link_preview', 'verified', 0.98, 'Twitter link preview crawler', false),
('linkedinbot', 'social_media', 'link_preview', 'verified', 0.98, 'LinkedIn link preview crawler', false),
('pinterestbot', 'social_media', 'link_preview', 'verified', 0.98, 'Pinterest link preview crawler', false),
('whatsapp', 'social_media', 'link_preview', 'verified', 0.95, 'WhatsApp link preview', false),
('telegrambot', 'social_media', 'link_preview', 'verified', 0.95, 'Telegram link preview crawler', false),
('skypeuripreview', 'social_media', 'link_preview', 'verified', 0.95, 'Skype link preview', false),
('slackbot', 'social_media', 'link_preview', 'verified', 0.95, 'Slack link preview crawler', false),
('discordbot', 'social_media', 'link_preview', 'verified', 0.95, 'Discord link preview crawler', false),

-- AI/LLM Bots
('gptbot', 'ai_llm', 'training', 'verified', 0.99, 'OpenAI GPT training bot', false),
('chatgpt-user', 'ai_llm', 'browsing', 'verified', 0.99, 'ChatGPT browsing mode', false),
('claude-web', 'ai_llm', 'browsing', 'verified', 0.99, 'Anthropic Claude web browsing', false),
('bard', 'ai_llm', 'browsing', 'verified', 0.99, 'Google Bard AI', false),
('perplexitybot', 'ai_llm', 'search', 'verified', 0.99, 'Perplexity AI search bot', false),
('anthropic-ai', 'ai_llm', 'training', 'verified', 0.99, 'Anthropic AI training bot', false),

-- Automation Tools
('selenium', 'automation', 'testing', 'verified', 0.97, 'Selenium WebDriver automation', false),
('puppeteer', 'automation', 'testing', 'verified', 0.97, 'Puppeteer automation tool', false),
('playwright', 'automation', 'testing', 'verified', 0.97, 'Playwright automation framework', false),
('headlesschrome', 'automation', 'testing', 'verified', 0.97, 'Headless Chrome browser', false),
('phantomjs', 'automation', 'testing', 'verified', 0.95, 'PhantomJS headless browser', false),
('webdriver', 'automation', 'testing', 'verified', 0.95, 'Generic WebDriver automation', false),
('chromedriver', 'automation', 'testing', 'verified', 0.95, 'Chrome WebDriver', false),
('geckodriver', 'automation', 'testing', 'verified', 0.95, 'Firefox WebDriver', false),

-- Programming Languages & HTTP Clients
('python-requests', 'programming', 'http_client', 'verified', 0.90, 'Python requests library', false),
('python-urllib', 'programming', 'http_client', 'verified', 0.90, 'Python urllib library', false),
('curl', 'programming', 'http_client', 'verified', 0.85, 'cURL command line tool', false),
('wget', 'programming', 'http_client', 'verified', 0.85, 'wget command line tool', false),
('node.js', 'programming', 'http_client', 'verified', 0.85, 'Node.js HTTP client', false),
('axios', 'programming', 'http_client', 'verified', 0.85, 'Axios HTTP client', false),
('java', 'programming', 'http_client', 'verified', 0.80, 'Java HTTP client', false),
('php', 'programming', 'http_client', 'verified', 0.80, 'PHP HTTP client', false),
('ruby', 'programming', 'http_client', 'verified', 0.80, 'Ruby HTTP client', false),
('go-http-client', 'programming', 'http_client', 'verified', 0.80, 'Go HTTP client', false),

-- Security & Penetration Testing Tools
('nmap', 'security', 'scanner', 'verified', 0.99, 'Nmap network scanner', false),
('nikto', 'security', 'scanner', 'verified', 0.99, 'Nikto web scanner', false),
('burpsuite', 'security', 'scanner', 'verified', 0.99, 'Burp Suite security scanner', false),
('sqlmap', 'security', 'scanner', 'verified', 0.99, 'SQLMap SQL injection tool', false),
('masscan', 'security', 'scanner', 'verified', 0.95, 'Masscan port scanner', false),
('zap', 'security', 'scanner', 'verified', 0.95, 'OWASP ZAP security scanner', false),
('nessus', 'security', 'scanner', 'verified', 0.95, 'Nessus vulnerability scanner', false),
('openvas', 'security', 'scanner', 'verified', 0.95, 'OpenVAS vulnerability scanner', false),

-- SEO & Marketing Tools
('semrushbot', 'seo_tools', 'analysis', 'verified', 0.95, 'SEMrush SEO analysis bot', false),
('ahrefsbot', 'seo_tools', 'analysis', 'verified', 0.95, 'Ahrefs SEO analysis bot', false),
('mj12bot', 'seo_tools', 'analysis', 'verified', 0.95, 'Majestic SEO crawler', false),
('dotbot', 'seo_tools', 'analysis', 'verified', 0.90, 'Moz SEO crawler', false),
('screaming frog', 'seo_tools', 'analysis', 'verified', 0.90, 'Screaming Frog SEO spider', false),
('spyfu', 'seo_tools', 'analysis', 'verified', 0.90, 'SpyFu SEO analysis tool', false),
('serpstatbot', 'seo_tools', 'analysis', 'verified', 0.90, 'Serpstat SEO analysis bot', false),

-- Monitoring & Uptime Services
('pingdom', 'monitoring', 'uptime', 'verified', 0.90, 'Pingdom uptime monitoring', false),
('uptimerobot', 'monitoring', 'uptime', 'verified', 0.90, 'UptimeRobot monitoring service', false),
('statuscake', 'monitoring', 'uptime', 'verified', 0.90, 'StatusCake monitoring service', false),
('newrelic', 'monitoring', 'performance', 'verified', 0.90, 'New Relic monitoring', false),
('datadog', 'monitoring', 'performance', 'verified', 0.90, 'Datadog monitoring service', false),
('site24x7', 'monitoring', 'uptime', 'verified', 0.85, 'Site24x7 monitoring service', false),

-- Content Discovery & Aggregation
('flipboard', 'content_discovery', 'aggregation', 'verified', 0.85, 'Flipboard content aggregator', false),
('pocket', 'content_discovery', 'aggregation', 'verified', 0.85, 'Pocket content saver', false),
('feedly', 'content_discovery', 'rss', 'verified', 0.85, 'Feedly RSS reader', false),
('inoreader', 'content_discovery', 'rss', 'verified', 0.80, 'Inoreader RSS reader', false),

-- Archive & Backup Services
('wayback', 'archival', 'backup', 'verified', 0.90, 'Internet Archive Wayback Machine', false),
('archive.org', 'archival', 'backup', 'verified', 0.90, 'Internet Archive crawler', false),
('ia_archiver', 'archival', 'backup', 'verified', 0.90, 'Internet Archive bot', false),

-- Generic Bot Patterns (Regex)
('.*bot.*', 'generic', 'bot', 'pattern', 0.70, 'Generic bot pattern', true),
('.*crawler.*', 'generic', 'crawler', 'pattern', 0.70, 'Generic crawler pattern', true),
('.*spider.*', 'generic', 'spider', 'pattern', 0.70, 'Generic spider pattern', true),
('.*scraper.*', 'generic', 'scraper', 'pattern', 0.75, 'Generic scraper pattern', true),
('.*headless.*', 'generic', 'headless', 'pattern', 0.80, 'Generic headless browser pattern', true);

-- Update the updated_at timestamp
UPDATE bot_patterns SET updated_at = CURRENT_TIMESTAMP;

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_bot_patterns_updated_at ON bot_patterns;
CREATE TRIGGER update_bot_patterns_updated_at
    BEFORE UPDATE ON bot_patterns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to check if user agent matches any bot pattern
CREATE OR REPLACE FUNCTION is_bot_user_agent(user_agent_input TEXT)
RETURNS TABLE(
    is_bot BOOLEAN,
    matched_pattern VARCHAR(500),
    category VARCHAR(100),
    confidence DECIMAL(3,2)
) AS $$
BEGIN
    -- First check exact matches (non-regex patterns)
    RETURN QUERY
    SELECT 
        true as is_bot,
        bp.pattern,
        bp.category,
        bp.confidence
    FROM bot_patterns bp
    WHERE bp.is_active = true 
    AND bp.is_regex = false
    AND LOWER(user_agent_input) LIKE '%' || LOWER(bp.pattern) || '%'
    ORDER BY bp.confidence DESC
    LIMIT 1;
    
    -- If no exact match found, check regex patterns
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            true as is_bot,
            bp.pattern,
            bp.category,
            bp.confidence
        FROM bot_patterns bp
        WHERE bp.is_active = true 
        AND bp.is_regex = true
        AND user_agent_input ~* bp.pattern
        ORDER BY bp.confidence DESC
        LIMIT 1;
    END IF;
    
    -- If still no match, return false
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            false as is_bot,
            NULL::VARCHAR(500) as matched_pattern,
            NULL::VARCHAR(100) as category,
            0.0::DECIMAL(3,2) as confidence;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to increment pattern usage
CREATE OR REPLACE FUNCTION increment_pattern_usage(pattern_id_input INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE bot_patterns 
    SET 
        detection_count = detection_count + 1,
        last_detected = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = pattern_id_input;
END;
$$ LANGUAGE plpgsql;

-- Create function to get bot detection statistics
CREATE OR REPLACE FUNCTION get_bot_detection_stats()
RETURNS TABLE(
    total_patterns INTEGER,
    active_patterns INTEGER,
    total_detections BIGINT,
    avg_confidence DECIMAL(5,2),
    top_category VARCHAR(100),
    last_detection TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_patterns,
        COUNT(CASE WHEN is_active THEN 1 END)::INTEGER as active_patterns,
        COALESCE(SUM(detection_count), 0) as total_detections,
        ROUND(AVG(confidence), 2) as avg_confidence,
        (SELECT category FROM bot_patterns WHERE detection_count > 0 GROUP BY category ORDER BY SUM(detection_count) DESC LIMIT 1) as top_category,
        MAX(last_detected) as last_detection
    FROM bot_patterns;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for the new functions
CREATE INDEX IF NOT EXISTS idx_bot_patterns_detection_count ON bot_patterns(detection_count DESC);
CREATE INDEX IF NOT EXISTS idx_bot_patterns_last_detected ON bot_patterns(last_detected DESC);

-- Display summary
SELECT 
    'Bot patterns database initialized successfully!' as message,
    COUNT(*) as total_patterns,
    COUNT(CASE WHEN is_active THEN 1 END) as active_patterns,
    COUNT(DISTINCT category) as categories
FROM bot_patterns;
