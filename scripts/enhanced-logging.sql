-- Enhanced logging and analytics tables

-- Create detailed bot analysis table
CREATE TABLE IF NOT EXISTS bot_analysis (
    id SERIAL PRIMARY KEY,
    website_id INTEGER,
    analysis_date DATE DEFAULT CURRENT_DATE,
    total_requests INTEGER DEFAULT 0,
    bot_requests INTEGER DEFAULT 0,
    human_requests INTEGER DEFAULT 0,
    blocked_requests INTEGER DEFAULT 0,
    false_positives INTEGER DEFAULT 0,
    false_negatives INTEGER DEFAULT 0,
    accuracy_score DECIMAL(5,2),
    top_bot_types JSONB,
    top_blocked_ips JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create real-time metrics table
CREATE TABLE IF NOT EXISTS realtime_metrics (
    id SERIAL PRIMARY KEY,
    website_id INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    minute_mark TIMESTAMP WITH TIME ZONE, -- Rounded to minute
    total_visits INTEGER DEFAULT 0,
    human_visits INTEGER DEFAULT 0,
    bot_visits INTEGER DEFAULT 0,
    blocked_visits INTEGER DEFAULT 0,
    unique_ips INTEGER DEFAULT 0,
    threat_level VARCHAR(20) DEFAULT 'low', -- low, medium, high
    avg_response_time_ms INTEGER
);

-- Create index for real-time queries
CREATE INDEX IF NOT EXISTS idx_realtime_metrics_minute ON realtime_metrics(minute_mark);
CREATE INDEX IF NOT EXISTS idx_realtime_metrics_website ON realtime_metrics(website_id);

-- Create campaign tracking table
CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    website_id INTEGER,
    status VARCHAR(20) DEFAULT 'active', -- active, paused, completed
    budget DECIMAL(10,2),
    spent DECIMAL(10,2) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    target_countries TEXT[],
    total_visits INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create threat intelligence table
CREATE TABLE IF NOT EXISTS threat_intelligence (
    id SERIAL PRIMARY KEY,
    ip_address INET NOT NULL,
    threat_type VARCHAR(50), -- malicious, suspicious, ad_verification, etc.
    threat_level INTEGER DEFAULT 1, -- 1-10 scale
    source VARCHAR(100), -- internal, external_feed, manual
    description TEXT,
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    hit_count INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create index for threat lookups
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_ip ON threat_intelligence(ip_address);
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_active ON threat_intelligence(is_active);

-- Bot training data table
CREATE TABLE IF NOT EXISTS bot_training_data (
    id SERIAL PRIMARY KEY,
    user_agent TEXT NOT NULL,
    ip_address INET,
    is_bot BOOLEAN NOT NULL,
    category VARCHAR(100),
    confidence DECIMAL(3,2),
    source VARCHAR(50) DEFAULT 'manual',
    verified BOOLEAN DEFAULT false,
    country VARCHAR(10),
    additional_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ML learning patterns table
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

-- Bot detection patterns table
CREATE TABLE IF NOT EXISTS bot_detection_patterns (
    id SERIAL PRIMARY KEY,
    pattern_regex VARCHAR(500) NOT NULL,
    pattern_name VARCHAR(100),
    category VARCHAR(50),
    confidence_score DECIMAL(3,2),
    is_active BOOLEAN DEFAULT true,
    auto_generated BOOLEAN DEFAULT false,
    detection_count INTEGER DEFAULT 0,
    last_detected TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System performance metrics
CREATE TABLE IF NOT EXISTS performance_metrics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100),
    metric_value DECIMAL(10,4),
    metric_unit VARCHAR(20),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- IP intelligence data
CREATE TABLE IF NOT EXISTS ip_intelligence (
    id SERIAL PRIMARY KEY,
    ip_address INET UNIQUE,
    country VARCHAR(10),
    region VARCHAR(50),
    city VARCHAR(100),
    organization VARCHAR(200),
    is_datacenter BOOLEAN DEFAULT false,
    is_tor BOOLEAN DEFAULT false,
    is_vpn BOOLEAN DEFAULT false,
    risk_score INTEGER,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for IP intelligence lookups
CREATE INDEX IF NOT EXISTS idx_ip_intelligence_ip ON ip_intelligence(ip_address);

-- Create function to update real-time metrics
CREATE OR REPLACE FUNCTION update_realtime_metrics(
    p_website_id INTEGER,
    p_is_bot BOOLEAN,
    p_is_blocked BOOLEAN,
    p_response_time INTEGER
) RETURNS void AS $$
DECLARE
    current_minute TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Round timestamp to the nearest minute
    current_minute := date_trunc('minute', NOW());
    
    -- Insert or update metrics for this minute
    INSERT INTO realtime_metrics (
        website_id, 
        minute_mark, 
        total_visits, 
        human_visits, 
        bot_visits, 
        blocked_visits,
        avg_response_time_ms
    ) VALUES (
        p_website_id,
        current_minute,
        1,
        CASE WHEN NOT p_is_bot THEN 1 ELSE 0 END,
        CASE WHEN p_is_bot THEN 1 ELSE 0 END,
        CASE WHEN p_is_blocked THEN 1 ELSE 0 END,
        p_response_time
    )
    ON CONFLICT (website_id, minute_mark) DO UPDATE SET
        total_visits = realtime_metrics.total_visits + 1,
        human_visits = realtime_metrics.human_visits + CASE WHEN NOT p_is_bot THEN 1 ELSE 0 END,
        bot_visits = realtime_metrics.bot_visits + CASE WHEN p_is_bot THEN 1 ELSE 0 END,
        blocked_visits = realtime_metrics.blocked_visits + CASE WHEN p_is_blocked THEN 1 ELSE 0 END,
        avg_response_time_ms = (realtime_metrics.avg_response_time_ms + p_response_time) / 2;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate threat level
CREATE OR REPLACE FUNCTION calculate_threat_level(p_website_id INTEGER) RETURNS VARCHAR(20) AS $$
DECLARE
    bot_percentage DECIMAL;
    recent_threats INTEGER;
    threat_level VARCHAR(20);
BEGIN
    -- Calculate bot percentage in last hour
    SELECT 
        CASE 
            WHEN SUM(total_visits) = 0 THEN 0
            ELSE (SUM(bot_visits)::DECIMAL / SUM(total_visits)) * 100
        END
    INTO bot_percentage
    FROM realtime_metrics 
    WHERE website_id = p_website_id 
    AND minute_mark >= NOW() - INTERVAL '1 hour';
    
    -- Count recent threat IPs
    SELECT COUNT(DISTINCT ip_address)
    INTO recent_threats
    FROM access_logs al
    JOIN threat_intelligence ti ON al.ip_address = ti.ip_address
    WHERE al.website_id = p_website_id
    AND al.timestamp >= NOW() - INTERVAL '1 hour'
    AND ti.is_active = TRUE;
    
    -- Determine threat level
    IF bot_percentage > 50 OR recent_threats > 10 THEN
        threat_level := 'high';
    ELSIF bot_percentage > 25 OR recent_threats > 5 THEN
        threat_level := 'medium';
    ELSE
        threat_level := 'low';
    END IF;
    
    RETURN threat_level;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate daily bot analysis
CREATE OR REPLACE FUNCTION generate_daily_bot_analysis(p_date DATE DEFAULT CURRENT_DATE) RETURNS void AS $$
DECLARE
    website_record RECORD;
    total_reqs INTEGER;
    bot_reqs INTEGER;
    human_reqs INTEGER;
    blocked_reqs INTEGER;
    accuracy DECIMAL(5,2);
    bot_types JSONB;
BEGIN
    -- Loop through each website
    FOR website_record IN SELECT id FROM website_configs WHERE is_active = TRUE LOOP
        
        -- Calculate daily statistics
        SELECT 
            COUNT(*),
            SUM(CASE WHEN is_bot THEN 1 ELSE 0 END),
            SUM(CASE WHEN NOT is_bot THEN 1 ELSE 0 END),
            SUM(CASE WHEN page_served = 'blocked' THEN 1 ELSE 0 END)
        INTO total_reqs, bot_reqs, human_reqs, blocked_reqs
        FROM access_logs
        WHERE website_id = website_record.id
        AND DATE(timestamp) = p_date;
        
        -- Calculate accuracy (simplified)
        accuracy := CASE 
            WHEN total_reqs > 0 THEN ((total_reqs - blocked_reqs)::DECIMAL / total_reqs) * 100
            ELSE 0
        END;
        
        -- Get top bot types
        SELECT json_agg(bot_type_data)
        INTO bot_types
        FROM (
            SELECT 
                bot_type,
                COUNT(*) as count,
                ROUND((COUNT(*)::DECIMAL / bot_reqs) * 100, 1) as percentage
            FROM access_logs
            WHERE website_id = website_record.id
            AND DATE(timestamp) = p_date
            AND is_bot = TRUE
            AND bot_type IS NOT NULL
            GROUP BY bot_type
            ORDER BY count DESC
            LIMIT 10
        ) bot_type_data;
        
        -- Insert analysis record
        INSERT INTO bot_analysis (
            website_id,
            analysis_date,
            total_requests,
            bot_requests,
            human_requests,
            blocked_requests,
            accuracy_score,
            top_bot_types
        ) VALUES (
            website_record.id,
            p_date,
            total_reqs,
            bot_reqs,
            human_reqs,
            blocked_reqs,
            accuracy,
            bot_types
        )
        ON CONFLICT (website_id, analysis_date) DO UPDATE SET
            total_requests = EXCLUDED.total_requests,
            bot_requests = EXCLUDED.bot_requests,
            human_requests = EXCLUDED.human_requests,
            blocked_requests = EXCLUDED.blocked_requests,
            accuracy_score = EXCLUDED.accuracy_score,
            top_bot_types = EXCLUDED.top_bot_types;
            
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create unique constraint for bot analysis
ALTER TABLE bot_analysis ADD CONSTRAINT unique_website_date UNIQUE (website_id, analysis_date);

-- Create unique constraint for realtime metrics
ALTER TABLE realtime_metrics ADD CONSTRAINT unique_website_minute UNIQUE (website_id, minute_mark);

-- Create index for bot training data
CREATE INDEX IF NOT EXISTS idx_bot_training_created_at ON bot_training_data(created_at);
CREATE INDEX IF NOT EXISTS idx_bot_training_is_bot ON bot_training_data(is_bot);

-- Create index for ML learning data
CREATE INDEX IF NOT EXISTS idx_ml_learning_created_at ON ml_learning_data(created_at);

-- Create index for bot detection patterns
CREATE INDEX IF NOT EXISTS idx_bot_patterns_active ON bot_detection_patterns(is_active);
