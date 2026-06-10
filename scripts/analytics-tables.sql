-- Additional analytics and reporting tables

-- Create session tracking table
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    website_id INTEGER,
    ip_address INET,
    country VARCHAR(10),
    user_agent TEXT,
    first_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    page_views INTEGER DEFAULT 1,
    is_bot BOOLEAN DEFAULT false,
    bot_confidence DECIMAL(3,2),
    referrer TEXT,
    session_duration INTEGER -- in seconds
);

-- Create page performance table
CREATE TABLE IF NOT EXISTS page_performance (
    id SERIAL PRIMARY KEY,
    website_id INTEGER,
    page_url TEXT NOT NULL,
    analysis_date DATE DEFAULT CURRENT_DATE,
    total_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    avg_load_time_ms INTEGER,
    bounce_rate DECIMAL(5,2),
    conversion_rate DECIMAL(5,2),
    exit_rate DECIMAL(5,2)
);

-- Create funnel analysis table
CREATE TABLE IF NOT EXISTS conversion_funnels (
    id SERIAL PRIMARY KEY,
    website_id INTEGER,
    funnel_name VARCHAR(255) NOT NULL,
    step_number INTEGER,
    step_name VARCHAR(255),
    step_url TEXT,
    visitors INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2),
    analysis_date DATE DEFAULT CURRENT_DATE
);

-- Create revenue tracking table
CREATE TABLE IF NOT EXISTS revenue_tracking (
    id SERIAL PRIMARY KEY,
    website_id INTEGER,
    campaign_id INTEGER,
    revenue_date DATE DEFAULT CURRENT_DATE,
    gross_revenue DECIMAL(12,2) DEFAULT 0,
    net_revenue DECIMAL(12,2) DEFAULT 0,
    ad_spend DECIMAL(12,2) DEFAULT 0,
    profit DECIMAL(12,2) DEFAULT 0,
    roi_percentage DECIMAL(8,2),
    transactions INTEGER DEFAULT 0,
    avg_order_value DECIMAL(10,2)
);

-- Create competitor analysis table
CREATE TABLE IF NOT EXISTS competitor_analysis (
    id SERIAL PRIMARY KEY,
    website_id INTEGER,
    competitor_domain VARCHAR(255),
    analysis_date DATE DEFAULT CURRENT_DATE,
    estimated_traffic INTEGER,
    estimated_revenue DECIMAL(12,2),
    market_share DECIMAL(5,2),
    top_keywords TEXT[],
    ad_spend_estimate DECIMAL(12,2)
);

-- Create keyword tracking table
CREATE TABLE IF NOT EXISTS keyword_tracking (
    id SERIAL PRIMARY KEY,
    website_id INTEGER,
    keyword VARCHAR(255) NOT NULL,
    search_engine VARCHAR(50) DEFAULT 'google',
    position INTEGER,
    search_volume INTEGER,
    cpc DECIMAL(8,2),
    competition_level VARCHAR(20), -- low, medium, high
    tracking_date DATE DEFAULT CURRENT_DATE,
    clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    ctr DECIMAL(5,2)
);

-- Create fraud detection table
CREATE TABLE IF NOT EXISTS fraud_detection (
    id SERIAL PRIMARY KEY,
    website_id INTEGER,
    ip_address INET NOT NULL,
    fraud_type VARCHAR(50), -- click_fraud, impression_fraud, conversion_fraud
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    detection_method VARCHAR(100),
    evidence JSONB,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_confirmed BOOLEAN DEFAULT FALSE,
    action_taken VARCHAR(100) -- blocked, flagged, ignored
);

-- Create quality score tracking
CREATE TABLE IF NOT EXISTS quality_scores (
    id SERIAL PRIMARY KEY,
    website_id INTEGER,
    campaign_id INTEGER,
    score_date DATE DEFAULT CURRENT_DATE,
    overall_score DECIMAL(3,1), -- 1.0 to 10.0
    landing_page_score DECIMAL(3,1),
    ad_relevance_score DECIMAL(3,1),
    expected_ctr DECIMAL(5,2),
    historical_performance DECIMAL(3,1)
);

-- Create user behavior analysis
CREATE TABLE IF NOT EXISTS user_behavior (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255),
    website_id INTEGER,
    event_type VARCHAR(50), -- click, scroll, hover, form_fill, etc.
    element_id VARCHAR(255),
    element_type VARCHAR(50),
    page_url TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    x_coordinate INTEGER,
    y_coordinate INTEGER,
    additional_data JSONB
);

-- Create heatmap data table
CREATE TABLE IF NOT EXISTS heatmap_data (
    id SERIAL PRIMARY KEY,
    website_id INTEGER,
    page_url TEXT NOT NULL,
    analysis_date DATE DEFAULT CURRENT_DATE,
    x_coordinate INTEGER,
    y_coordinate INTEGER,
    click_count INTEGER DEFAULT 0,
    hover_count INTEGER DEFAULT 0,
    scroll_depth INTEGER, -- percentage
    time_spent_ms INTEGER
);

-- Alert configurations
CREATE TABLE IF NOT EXISTS alert_configurations (
    id SERIAL PRIMARY KEY,
    website_id INTEGER,
    alert_type VARCHAR(50), -- 'bot_spike', 'traffic_drop', 'geo_anomaly'
    threshold_value INTEGER,
    is_active BOOLEAN DEFAULT true,
    notification_email VARCHAR(255),
    last_triggered TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alert history
CREATE TABLE IF NOT EXISTS alert_history (
    id SERIAL PRIMARY KEY,
    alert_config_id INTEGER REFERENCES alert_configurations(id),
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    alert_message TEXT,
    severity VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
    resolved_at TIMESTAMP,
    is_resolved BOOLEAN DEFAULT false
);

-- Traffic anomalies detection
CREATE TABLE IF NOT EXISTS traffic_anomalies (
    id SERIAL PRIMARY KEY,
    website_id INTEGER,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    anomaly_type VARCHAR(50), -- 'traffic_spike', 'bot_surge', 'geo_shift'
    baseline_value DECIMAL(10,2),
    current_value DECIMAL(10,2),
    deviation_percentage DECIMAL(5,2),
    severity VARCHAR(20),
    description TEXT,
    auto_detected BOOLEAN DEFAULT true
);

-- A/B testing for cloaking strategies
CREATE TABLE IF NOT EXISTS cloaking_experiments (
    id SERIAL PRIMARY KEY,
    website_id INTEGER,
    experiment_name VARCHAR(100),
    strategy_a JSONB, -- configuration for strategy A
    strategy_b JSONB, -- configuration for strategy B
    traffic_split DECIMAL(3,2) DEFAULT 0.5, -- 50/50 split
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT false,
    results JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Whitelist/Blacklist management
CREATE TABLE IF NOT EXISTS ip_lists (
    id SERIAL PRIMARY KEY,
    list_type VARCHAR(20), -- 'whitelist', 'blacklist'
    ip_address INET,
    ip_range CIDR,
    reason VARCHAR(255),
    added_by VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API usage tracking
CREATE TABLE IF NOT EXISTS api_usage_logs (
    id SERIAL PRIMARY KEY,
    endpoint VARCHAR(255),
    method VARCHAR(10),
    ip_address INET,
    user_agent TEXT,
    response_status INTEGER,
    response_time_ms INTEGER,
    request_size INTEGER,
    response_size INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create advanced indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_website_id ON user_sessions(website_id);
CREATE INDEX IF NOT EXISTS idx_page_performance_website_date ON page_performance(website_id, analysis_date);
CREATE INDEX IF NOT EXISTS idx_conversion_funnels_website_date ON conversion_funnels(website_id, analysis_date);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_website_date ON revenue_tracking(website_id, revenue_date);
CREATE INDEX IF NOT EXISTS idx_keyword_tracking_website_date ON keyword_tracking(website_id, tracking_date);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_ip ON fraud_detection(ip_address);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_website_date ON fraud_detection(website_id, DATE(detected_at));
CREATE INDEX IF NOT EXISTS idx_user_behavior_session ON user_behavior(session_id);
CREATE INDEX IF NOT EXISTS idx_heatmap_data_page_date ON heatmap_data(website_id, page_url, analysis_date);
CREATE INDEX IF NOT EXISTS idx_alert_history_triggered_at ON alert_history(triggered_at);
CREATE INDEX IF NOT EXISTS idx_traffic_anomalies_detected_at ON traffic_anomalies(detected_at);
CREATE INDEX IF NOT EXISTS idx_cloaking_experiments_active ON cloaking_experiments(is_active);
CREATE INDEX IF NOT EXISTS idx_ip_lists_ip_address ON ip_lists(ip_address);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage_logs(created_at);

-- Create materialized view for dashboard summary
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_summary AS
SELECT 
    w.id as website_id,
    w.name as website_name,
    w.domain,
    COUNT(al.id) as total_visits,
    SUM(CASE WHEN NOT al.is_bot THEN 1 ELSE 0 END) as human_visits,
    SUM(CASE WHEN al.is_bot THEN 1 ELSE 0 END) as bot_visits,
    SUM(CASE WHEN al.page_served = 'blocked' THEN 1 ELSE 0 END) as blocked_visits,
    COUNT(DISTINCT al.ip_address) as unique_visitors,
    AVG(al.response_time_ms) as avg_response_time,
    COALESCE(SUM(c.conversion_value), 0) as total_revenue,
    COUNT(c.id) as total_conversions,
    CASE 
        WHEN COUNT(al.id) > 0 THEN (COUNT(c.id)::DECIMAL / COUNT(al.id)) * 100
        ELSE 0
    END as conversion_rate,
    DATE(al.timestamp) as analysis_date
FROM website_configs w
LEFT JOIN access_logs al ON w.id = al.website_id
LEFT JOIN conversions c ON w.id = c.website_id AND DATE(al.timestamp) = DATE(c.timestamp)
WHERE al.timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY w.id, w.name, w.domain, DATE(al.timestamp);

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_dashboard_summary_website_date ON dashboard_summary(website_id, analysis_date);

-- Create function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views() RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW dashboard_summary;
END;
$$ LANGUAGE plpgsql;

-- Create function for advanced fraud detection
CREATE OR REPLACE FUNCTION detect_fraud_patterns() RETURNS void AS $$
DECLARE
    suspicious_ip RECORD;
    fraud_score DECIMAL(3,2);
BEGIN
    -- Detect click fraud patterns
    FOR suspicious_ip IN
        SELECT 
            ip_address,
            website_id,
            COUNT(*) as click_count,
            COUNT(DISTINCT session_id) as session_count,
            AVG(response_time_ms) as avg_response_time
        FROM access_logs
        WHERE timestamp >= NOW() - INTERVAL '1 hour'
        AND NOT is_bot
        GROUP BY ip_address, website_id
        HAVING COUNT(*) > 50 -- More than 50 clicks per hour
        OR (COUNT(*) > 10 AND COUNT(DISTINCT session_id) = 1) -- Many clicks, one session
    LOOP
        -- Calculate fraud confidence score
        fraud_score := LEAST(1.0, 
            (suspicious_ip.click_count::DECIMAL / 100) + 
            CASE WHEN suspicious_ip.session_count = 1 THEN 0.3 ELSE 0 END +
            CASE WHEN suspicious_ip.avg_response_time < 100 THEN 0.2 ELSE 0 END
        );
        
        -- Insert fraud detection record
        INSERT INTO fraud_detection (
            website_id,
            ip_address,
            fraud_type,
            confidence_score,
            detection_method,
            evidence
        ) VALUES (
            suspicious_ip.website_id,
            suspicious_ip.ip_address,
            'click_fraud',
            fraud_score,
            'automated_pattern_detection',
            json_build_object(
                'click_count', suspicious_ip.click_count,
                'session_count', suspicious_ip.session_count,
                'avg_response_time', suspicious_ip.avg_response_time,
                'detection_window', '1_hour'
            )
        );
        
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate quality scores
CREATE OR REPLACE FUNCTION calculate_quality_scores(p_website_id INTEGER) RETURNS void AS $$
DECLARE
    landing_score DECIMAL(3,1);
    relevance_score DECIMAL(3,1);
    ctr_score DECIMAL(5,2);
    overall_score DECIMAL(3,1);
BEGIN
    -- Calculate landing page score based on bounce rate and load time
    SELECT 
        CASE 
            WHEN AVG(bounce_rate) < 20 THEN 10.0
            WHEN AVG(bounce_rate) < 40 THEN 8.0
            WHEN AVG(bounce_rate) < 60 THEN 6.0
            WHEN AVG(bounce_rate) < 80 THEN 4.0
            ELSE 2.0
        END
    INTO landing_score
    FROM page_performance
    WHERE website_id = p_website_id
    AND analysis_date >= CURRENT_DATE - INTERVAL '7 days';
    
    -- Calculate expected CTR from recent performance
    SELECT 
        CASE 
            WHEN AVG(ctr) > 5.0 THEN 10.0
            WHEN AVG(ctr) > 3.0 THEN 8.0
            WHEN AVG(ctr) > 2.0 THEN 6.0
            WHEN AVG(ctr) > 1.0 THEN 4.0
            ELSE 2.0
        END
    INTO ctr_score
    FROM keyword_tracking
    WHERE website_id = p_website_id
    AND tracking_date >= CURRENT_DATE - INTERVAL '7 days';
    
    -- Set relevance score (would be calculated based on keyword matching in real implementation)
    relevance_score := 7.5;
    
    -- Calculate overall score
    overall_score := (COALESCE(landing_score, 5.0) + COALESCE(ctr_score, 5.0) + relevance_score) / 3;
    
    -- Insert quality score record
    INSERT INTO quality_scores (
        website_id,
        score_date,
        overall_score,
        landing_page_score,
        ad_relevance_score,
        expected_ctr
    ) VALUES (
        p_website_id,
        CURRENT_DATE,
        overall_score,
        landing_score,
        relevance_score,
        ctr_score
    )
    ON CONFLICT (website_id, score_date) DO UPDATE SET
        overall_score = EXCLUDED.overall_score,
        landing_page_score = EXCLUDED.landing_page_score,
        ad_relevance_score = EXCLUDED.ad_relevance_score,
        expected_ctr = EXCLUDED.expected_ctr;
        
END;
$$ LANGUAGE plpgsql;

-- Add unique constraints for quality scores
ALTER TABLE quality_scores ADD CONSTRAINT unique_quality_scores UNIQUE (website_id, score_date);
