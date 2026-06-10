-- Create access_logs table for real-time monitoring
CREATE TABLE IF NOT EXISTS access_logs (
  id SERIAL PRIMARY KEY,
  website_id INTEGER,
  ip_address VARCHAR(45),
  country VARCHAR(2),
  user_agent TEXT,
  page_shown VARCHAR(20) DEFAULT 'safe',
  is_bot BOOLEAN DEFAULT FALSE,
  bot_type VARCHAR(100),
  referrer TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON access_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_access_logs_website_id ON access_logs(website_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_is_bot ON access_logs(is_bot);
CREATE INDEX IF NOT EXISTS idx_access_logs_page_shown ON access_logs(page_shown);

-- Insert some sample data for testing (optional)
INSERT INTO access_logs (website_id, ip_address, country, user_agent, page_shown, is_bot, bot_type, referrer, created_at) VALUES
(1, '192.168.1.100', 'US', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'safe', false, null, 'https://google.com', NOW() - INTERVAL '5 minutes'),
(1, '192.168.1.101', 'CA', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'safe', false, null, 'Direct', NOW() - INTERVAL '3 minutes'),
(1, '66.249.66.1', 'US', 'Googlebot/2.1 (+http://www.google.com/bot.html)', 'decoy', true, 'Google Bot', 'Direct', NOW() - INTERVAL '2 minutes'),
(2, '192.168.1.102', 'GB', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15', 'safe', false, null, 'https://facebook.com', NOW() - INTERVAL '1 minute'),
(2, '69.63.176.1', 'US', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', 'decoy', true, 'Facebook Bot', 'Direct', NOW() - INTERVAL '30 seconds'),
(1, '192.168.1.103', 'DE', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'safe', false, null, 'https://twitter.com', NOW() - INTERVAL '10 seconds');

-- Create a function to clean old logs (older than 24 hours)
CREATE OR REPLACE FUNCTION clean_old_access_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM access_logs WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- You can set up a cron job or call this function periodically to clean old data
-- SELECT clean_old_access_logs();
