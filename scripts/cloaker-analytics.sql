-- Advanced analytics and reporting tables for the cloaker system

-- Create conversion tracking table
CREATE TABLE IF NOT EXISTS conversions (
    id SERIAL PRIMARY KEY,
    website_id INTEGER,
    campaign_id INTEGER,
    session_id VARCHAR(255),
    ip_address INET,
    conversion_type VARCHAR(50), -- lead, sale, signup, etc.
    conversion_value DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    referrer TEXT,
    country_code VARCHAR(2)
);

-- Create geographic analytics table
CREATE TABLE IF NOT EXISTS geographic_analytics (
    id SERIAL PRIMARY KEY,
    website_id INTEGER,
    country_code VARCHAR(10),
    date DATE,
    visitor_count INTEGER DEFAULT 0,
    bot_count INTEGER DEFAULT 0,
    human_count INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create device/browser analytics table
CREATE TABLE IF NOT EXISTS device_analytics (
    id SERIAL PRIMARY KEY,
    website_id INTEGER,
    analysis_date DATE DEFAULT CURRENT_DATE,
    device_type VARCHAR(20), -- desktop, mobile, tablet
    browser VARCHAR(50),
    os VARCHAR(50),
    total_visits INTEGER DEFAULT 0,
    human_visits INTEGER DEFAULT 0,
    bot_visits INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    avg_session_duration INTEGER
);

-- Create hourly traffic patterns table
CREATE TABLE IF NOT EXISTS traffic_patterns (
    id SERIAL PRIMARY KEY,
    website_id INTEGER,
    analysis_date DATE DEFAULT CURRENT_DATE,
    hour_of_day INTEGER CHECK (hour_of_day >= 0 AND hour_of_day <= 23),
    total_visits INTEGER DEFAULT 0,
    human_visits INTEGER DEFAULT 0,
    bot_visits INTEGER DEFAULT 0,
    blocked_visits INTEGER DEFAULT 0,
    avg_response_time_ms INTEGER,
    unique_ips INTEGER DEFAULT 0
);

-- Create referrer analytics table
CREATE TABLE IF NOT EXISTS referrer_analytics (
    id SERIAL PRIMARY KEY,
    website_id INTEGER,
    analysis_date DATE DEFAULT CURRENT_DATE,
    referrer_domain VARCHAR(255),
    referrer_type VARCHAR(50), -- search, social, direct, ad_network, etc.
    total_visits INTEGER DEFAULT 0,
    human_visits INTEGER DEFAULT 0,
    bot_visits INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0
);

-- Create A/B testing table for landing pages
CREATE TABLE IF NOT EXISTS ab_tests (
    id SERIAL PRIMARY KEY,
    website_id INTEGER,
    test_name VARCHAR(255) NOT NULL,
    variant_a_url TEXT NOT NULL,
    variant_b_url TEXT NOT NULL,
    traffic_split INTEGER DEFAULT 50, -- percentage for variant A
    start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create A/B test results table
CREATE TABLE IF NOT EXISTS ab_test_results (
    id SERIAL PRIMARY KEY,
    test_id INTEGER REFERENCES ab_tests(id),
    variant VARCHAR(1) CHECK (variant IN ('A', 'B')),
    visits INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    analysis_date DATE DEFAULT CURRENT_DATE
);

-- Create performance monitoring table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id SERIAL PRIMARY KEY,
    website_id INTEGER,
    metric_name VARCHAR(100), -- page_load_time, server_response, db_query_time, etc.
    metric_value DECIMAL(10,3),
    metric_unit VARCHAR(20), -- ms, seconds, percentage, etc.
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    additional_data JSONB
);

-- Create alert rules table
CREATE TABLE IF NOT EXISTS alert_rules (
    id SERIAL PRIMARY KEY,
    website_id INTEGER,
    rule_name VARCHAR(255) NOT NULL,
    metric_name VARCHAR(100), -- bot_percentage, response_time, error_rate, etc.
    condition_operator VARCHAR(10), -- >, <, =, >=, <=
    threshold_value DECIMAL(10,3),
    time_window_minutes INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT TRUE,
    notification_email VARCHAR(255),
    notification_webhook TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create alert history table
CREATE TABLE IF NOT EXISTS alert_history (
    id SERIAL PRIMARY KEY,
    rule_id INTEGER REFERENCES alert_rules(id),
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metric_value DECIMAL(10,3),
    message TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create Bot category analytics table
CREATE TABLE IF NOT EXISTS bot_category_analytics (
    id SERIAL PRIMARY KEY,
    website_id INTEGER,
    bot_category VARCHAR(100),
    bot_type VARCHAR(100),
    date DATE,
    detection_count INTEGER DEFAULT 0,
    confidence_avg DECIMAL(3,2),
    last_seen TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Campaign performance tracking table
CREATE TABLE IF NOT EXISTS campaign_performance (
    id SERIAL PRIMARY KEY,
    website_id INTEGER,
    campaign_date DATE,
    is_active BOOLEAN,
    total_visits INTEGER DEFAULT 0,
    filtered_visits INTEGER DEFAULT 0,
    passed_visits INTEGER DEFAULT 0,
    filter_effectiveness DECIMAL(5,2),
    revenue_protected DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Daily traffic summary table
CREATE TABLE IF NOT EXISTS daily_traffic_summary (
    id SERIAL PRIMARY KEY,
    website_id INTEGER,
    date DATE NOT NULL,
    total_visits INTEGER DEFAULT 0,
    human_visits INTEGER DEFAULT 0,
    bot_visits INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    top_countries JSONB,
    top_bot_types JSONB,
    conversion_rate DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Hourly traffic breakdown table
CREATE TABLE IF NOT EXISTS hourly_traffic_stats (
    id SERIAL PRIMARY KEY,
    website_id INTEGER,
    hour_timestamp TIMESTAMP NOT NULL,
    total_requests INTEGER DEFAULT 0,
    human_requests INTEGER DEFAULT 0,
    bot_requests INTEGER DEFAULT 0,
    safe_page_views INTEGER DEFAULT 0,
    landing_page_views INTEGER DEFAULT 0,
    unique_ips INTEGER DEFAULT 0,
    top_countries JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversions_website_date ON conversions(website_id, DATE(timestamp));
CREATE INDEX IF NOT EXISTS idx_geo_analytics_website_date ON geographic_analytics(website_id, date);
CREATE INDEX IF NOT EXISTS idx_device_analytics_website_date ON device_analytics(website_id, analysis_date);
CREATE INDEX IF NOT EXISTS idx_traffic_patterns_website_date ON traffic_patterns(website_id, analysis_date);
CREATE INDEX IF NOT EXISTS idx_referrer_analytics_website_date ON referrer_analytics(website_id, analysis_date);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_alert_history_triggered ON alert_history(triggered_at);
CREATE INDEX IF NOT EXISTS idx_daily_traffic_date ON daily_traffic_summary(date);
CREATE INDEX IF NOT EXISTS idx_daily_traffic_website ON daily_traffic_summary(website_id);
CREATE INDEX IF NOT EXISTS idx_hourly_traffic_timestamp ON hourly_traffic_stats(hour_timestamp);
CREATE INDEX IF NOT EXISTS idx_geographic_country_date ON geographic_analytics(country_code, date);
CREATE INDEX IF NOT EXISTS idx_bot_category_date ON bot_category_analytics(date);
CREATE INDEX IF NOT EXISTS idx_campaign_performance_date ON campaign_performance(campaign_date);

-- Create function to generate comprehensive analytics
CREATE OR REPLACE FUNCTION generate_comprehensive_analytics(
    p_website_id INTEGER,
    p_date DATE DEFAULT CURRENT_DATE
) RETURNS void AS $$
DECLARE
    country_record RECORD;
    device_record RECORD;
    hour_record RECORD;
    referrer_record RECORD;
BEGIN
    -- Generate geographic analytics
    FOR country_record IN 
        SELECT 
            country_code,
            COUNT(*) as visitor_count,
            SUM(CASE WHEN NOT is_bot THEN 1 ELSE 0 END) as human_count,
            SUM(CASE WHEN is_bot THEN 1 ELSE 0 END) as bot_count
        FROM access_logs
        WHERE website_id = p_website_id
        AND DATE(timestamp) = p_date
        AND country_code IS NOT NULL
        GROUP BY country_code
    LOOP
        INSERT INTO geographic_analytics (
            website_id, country_code, date,
            visitor_count, human_count, bot_count
        ) VALUES (
            p_website_id, country_record.country_code, p_date,
            country_record.visitor_count, country_record.human_count,
            country_record.bot_count
        )
        ON CONFLICT (website_id, country_code, date) DO UPDATE SET
            visitor_count = EXCLUDED.visitor_count,
            human_count = EXCLUDED.human_count,
            bot_count = EXCLUDED.bot_count;
    END LOOP;
    
    -- Generate hourly traffic patterns
    FOR hour_record IN
        SELECT 
            EXTRACT(HOUR FROM timestamp) as hour_of_day,
            COUNT(*) as total_visits,
            SUM(CASE WHEN NOT is_bot THEN 1 ELSE 0 END) as human_visits,
            SUM(CASE WHEN is_bot THEN 1 ELSE 0 END) as bot_visits,
            SUM(CASE WHEN page_served = 'blocked' THEN 1 ELSE 0 END) as blocked_visits,
            AVG(response_time_ms) as avg_response_time_ms,
            COUNT(DISTINCT ip_address) as unique_ips
        FROM access_logs
        WHERE website_id = p_website_id
        AND DATE(timestamp) = p_date
        GROUP BY EXTRACT(HOUR FROM timestamp)
    LOOP
        INSERT INTO traffic_patterns (
            website_id, analysis_date, hour_of_day,
            total_visits, human_visits, bot_visits, blocked_visits,
            avg_response_time_ms, unique_ips
        ) VALUES (
            p_website_id, p_date, hour_record.hour_of_day,
            hour_record.total_visits, hour_record.human_visits,
            hour_record.bot_visits, hour_record.blocked_visits,
            hour_record.avg_response_time_ms, hour_record.unique_ips
        )
        ON CONFLICT (website_id, analysis_date, hour_of_day) DO UPDATE SET
            total_visits = EXCLUDED.total_visits,
            human_visits = EXCLUDED.human_visits,
            bot_visits = EXCLUDED.bot_visits,
            blocked_visits = EXCLUDED.blocked_visits,
            avg_response_time_ms = EXCLUDED.avg_response_time_ms,
            unique_ips = EXCLUDED.unique_ips;
    END LOOP;
    
END;
$$ LANGUAGE plpgsql;

-- Create function to check alert rules
CREATE OR REPLACE FUNCTION check_alert_rules() RETURNS void AS $$
DECLARE
    rule_record RECORD;
    current_value DECIMAL(10,3);
    should_trigger BOOLEAN;
BEGIN
    FOR rule_record IN SELECT * FROM alert_rules WHERE is_active = TRUE LOOP
        
        -- Calculate current metric value based on rule
        CASE rule_record.metric_name
            WHEN 'bot_percentage' THEN
                SELECT 
                    CASE 
                        WHEN COUNT(*) = 0 THEN 0
                        ELSE (SUM(CASE WHEN is_bot THEN 1 ELSE 0 END)::DECIMAL / COUNT(*)) * 100
                    END
                INTO current_value
                FROM access_logs
                WHERE website_id = rule_record.website_id
                AND timestamp >= NOW() - INTERVAL '1 minute' * rule_record.time_window_minutes;
                
            WHEN 'avg_response_time' THEN
                SELECT AVG(response_time_ms)
                INTO current_value
                FROM access_logs
                WHERE website_id = rule_record.website_id
                AND timestamp >= NOW() - INTERVAL '1 minute' * rule_record.time_window_minutes
                AND response_time_ms IS NOT NULL;
                
            ELSE
                CONTINUE; -- Skip unknown metrics
        END CASE;
        
        -- Check if alert should trigger
        should_trigger := CASE rule_record.condition_operator
            WHEN '>' THEN current_value > rule_record.threshold_value
            WHEN '<' THEN current_value < rule_record.threshold_value
            WHEN '>=' THEN current_value >= rule_record.threshold_value
            WHEN '<=' THEN current_value <= rule_record.threshold_value
            WHEN '=' THEN current_value = rule_record.threshold_value
            ELSE FALSE
        END;
        
        -- Insert alert if triggered
        IF should_trigger THEN
            INSERT INTO alert_history (rule_id, metric_value, message)
            VALUES (
                rule_record.id,
                current_value,
                format('Alert: %s %s %s (current: %s)', 
                    rule_record.metric_name,
                    rule_record.condition_operator,
                    rule_record.threshold_value,
                    current_value
                )
            );
        END IF;
        
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create materialized views for faster analytics queries
CREATE MATERIALIZED VIEW IF NOT EXISTS traffic_overview AS
SELECT 
    website_id,
    DATE(created_at) as date,
    COUNT(*) as total_visits,
    COUNT(CASE WHEN is_bot = false THEN 1 END) as human_visits,
    COUNT(CASE WHEN is_bot = true THEN 1 END) as bot_visits,
    COUNT(DISTINCT ip_address) as unique_visitors
FROM access_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY website_id, DATE(created_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_traffic_overview_unique ON traffic_overview(website_id, date);

-- Add unique constraints
ALTER TABLE geographic_analytics ADD CONSTRAINT unique_geo_analytics UNIQUE (website_id, country_code, date);
ALTER TABLE device_analytics ADD CONSTRAINT unique_device_analytics UNIQUE (website_id, analysis_date, device_type, browser, os);
ALTER TABLE traffic_patterns ADD CONSTRAINT unique_traffic_patterns UNIQUE (website_id, analysis_date, hour_of_day);
ALTER TABLE referrer_analytics ADD CONSTRAINT unique_referrer_analytics UNIQUE (website_id, analysis_date, referrer_domain);
ALTER TABLE ab_test_results ADD CONSTRAINT unique_ab_test_results UNIQUE (test_id, variant, analysis_date);
ALTER TABLE bot_category_analytics ADD CONSTRAINT unique_bot_category_analytics UNIQUE (website_id, bot_category, bot_type, date);
ALTER TABLE campaign_performance ADD CONSTRAINT unique_campaign_performance UNIQUE (website_id, campaign_date);
