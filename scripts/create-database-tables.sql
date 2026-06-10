-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Create websites table
CREATE TABLE IF NOT EXISTS websites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES admin_users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    landing_page_url TEXT NOT NULL,
    safe_page_url TEXT NOT NULL,
    allowed_countries JSONB DEFAULT '[]',
    blocked_ad_platforms JSONB DEFAULT '[]',
    max_visit_limit INTEGER,
    visit_limit_time_hours INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create traffic logs table
CREATE TABLE IF NOT EXISTS traffic_logs (
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

-- Create access logs table
CREATE TABLE IF NOT EXISTS access_logs (
    id SERIAL PRIMARY KEY,
    page VARCHAR(255),
    user_agent TEXT,
    ip_address INET,
    country VARCHAR(10),
    referrer TEXT,
    timestamp TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bot training data table
CREATE TABLE IF NOT EXISTS bot_training_data (
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

-- Create ML learning data table
CREATE TABLE IF NOT EXISTS ml_learning_data (
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_traffic_logs_website_id ON traffic_logs(website_id);
CREATE INDEX IF NOT EXISTS idx_traffic_logs_created_at ON traffic_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_traffic_logs_is_bot ON traffic_logs(is_bot);
CREATE INDEX IF NOT EXISTS idx_traffic_logs_ip_address ON traffic_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_websites_user_id ON websites(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON access_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_access_logs_ip_address ON access_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_bot_training_data_user_agent ON bot_training_data(user_agent);
CREATE INDEX IF NOT EXISTS idx_ml_learning_data_ip_address ON ml_learning_data(ip_address);

-- Insert demo admin user (password: admin123)
INSERT INTO admin_users (username, email, password_hash) 
VALUES ('admin', 'admin@example.com', 'admin123')
ON CONFLICT (username) DO NOTHING;
