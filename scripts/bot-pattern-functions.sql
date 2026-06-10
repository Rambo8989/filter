-- Advanced Bot Pattern Management Functions
-- This script creates comprehensive functions for managing bot patterns

-- Function to auto-learn new bot patterns from user agents
CREATE OR REPLACE FUNCTION auto_learn_bot_pattern(
    user_agent_input TEXT,
    initial_confidence DECIMAL(3,2) DEFAULT 0.50
)
RETURNS TABLE(
    pattern_id INTEGER,
    action VARCHAR(20),
    confidence DECIMAL(3,2)
) AS $$
DECLARE
    existing_pattern_id INTEGER;
    new_pattern_id INTEGER;
    detected_category VARCHAR(100);
    pattern_text VARCHAR(500);
BEGIN
    -- Clean and normalize the user agent
    pattern_text := LOWER(TRIM(user_agent_input));
    
    -- Skip if user agent is too short or generic
    IF LENGTH(pattern_text) < 5 OR pattern_text LIKE '%mozilla%' THEN
        RETURN;
    END IF;
    
    -- Determine category based on user agent content
    detected_category := CASE
        WHEN pattern_text LIKE '%bot%' OR pattern_text LIKE '%crawler%' OR pattern_text LIKE '%spider%' THEN 'generic'
        WHEN pattern_text LIKE '%google%' OR pattern_text LIKE '%bing%' OR pattern_text LIKE '%yahoo%' THEN 'search_engine'
        WHEN pattern_text LIKE '%facebook%' OR pattern_text LIKE '%twitter%' OR pattern_text LIKE '%linkedin%' THEN 'social_media'
        WHEN pattern_text LIKE '%python%' OR pattern_text LIKE '%curl%' OR pattern_text LIKE '%wget%' THEN 'programming'
        WHEN pattern_text LIKE '%selenium%' OR pattern_text LIKE '%puppeteer%' OR pattern_text LIKE '%headless%' THEN 'automation'
        WHEN pattern_text LIKE '%monitor%' OR pattern_text LIKE '%uptime%' OR pattern_text LIKE '%ping%' THEN 'monitoring'
        ELSE 'unknown'
    END;
    
    -- Extract key identifying part of user agent
    pattern_text := CASE
        WHEN pattern_text LIKE '%googlebot%' THEN 'googlebot'
        WHEN pattern_text LIKE '%bingbot%' THEN 'bingbot'
        WHEN pattern_text LIKE '%facebookexternalhit%' THEN 'facebookexternalhit'
        WHEN pattern_text LIKE '%twitterbot%' THEN 'twitterbot'
        WHEN pattern_text LIKE '%python-requests%' THEN 'python-requests'
        WHEN pattern_text LIKE '%curl%' THEN 'curl'
        WHEN pattern_text LIKE '%wget%' THEN 'wget'
        WHEN pattern_text LIKE '%selenium%' THEN 'selenium'
        WHEN pattern_text LIKE '%puppeteer%' THEN 'puppeteer'
        WHEN pattern_text LIKE '%headless%' THEN 'headless'
        ELSE SUBSTRING(pattern_text FROM 1 FOR 50)
    END;
    
    -- Check if pattern already exists
    SELECT id INTO existing_pattern_id
    FROM bot_patterns
    WHERE LOWER(pattern) = pattern_text
    LIMIT 1;
    
    IF existing_pattern_id IS NOT NULL THEN
        -- Update existing pattern confidence and detection count
        UPDATE bot_patterns
        SET 
            confidence = LEAST(0.95, confidence + 0.05),
            detection_count = detection_count + 1,
            last_detected = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = existing_pattern_id;
        
        RETURN QUERY
        SELECT existing_pattern_id, 'updated'::VARCHAR(20), (SELECT confidence FROM bot_patterns WHERE id = existing_pattern_id);
    ELSE
        -- Insert new pattern
        INSERT INTO bot_patterns (
            pattern, 
            category, 
            subcategory, 
            source, 
            confidence, 
            description, 
            detection_count,
            last_detected,
            is_active
        ) VALUES (
            pattern_text,
            detected_category,
            'auto_discovered',
            'auto_learning',
            initial_confidence,
            'Auto-discovered from user agent: ' || LEFT(user_agent_input, 100),
            1,
            CURRENT_TIMESTAMP,
            true
        ) RETURNING id INTO new_pattern_id;
        
        RETURN QUERY
        SELECT new_pattern_id, 'created'::VARCHAR(20), initial_confidence;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old auto-discovered patterns (100-day retention as requested)
CREATE OR REPLACE FUNCTION cleanup_old_bot_patterns()
RETURNS TABLE(
    deleted_count INTEGER,
    cleanup_date TIMESTAMP
) AS $$
DECLARE
    deleted_rows INTEGER;
BEGIN
    -- Delete patterns that haven't been detected in 100 days and have low confidence
    DELETE FROM bot_patterns
    WHERE source = 'auto_learning'
    AND (last_detected IS NULL OR last_detected < CURRENT_TIMESTAMP - INTERVAL '100 days')
    AND confidence < 0.70
    AND detection_count < 5;
    
    GET DIAGNOSTICS deleted_rows = ROW_COUNT;
    
    RETURN QUERY
    SELECT deleted_rows, CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function to get comprehensive bot learning statistics
CREATE OR REPLACE FUNCTION get_bot_learning_stats()
RETURNS TABLE(
    total_patterns INTEGER,
    active_patterns INTEGER,
    auto_discovered INTEGER,
    manual_patterns INTEGER,
    avg_confidence DECIMAL(5,2),
    total_detections BIGINT,
    patterns_by_category JSONB,
    recent_discoveries INTEGER,
    cleanup_candidates INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_patterns,
        COUNT(CASE WHEN is_active THEN 1 END)::INTEGER as active_patterns,
        COUNT(CASE WHEN source = 'auto_learning' THEN 1 END)::INTEGER as auto_discovered,
        COUNT(CASE WHEN source != 'auto_learning' THEN 1 END)::INTEGER as manual_patterns,
        ROUND(AVG(confidence), 2) as avg_confidence,
        COALESCE(SUM(detection_count), 0) as total_detections,
        (
            SELECT jsonb_object_agg(category, pattern_count)
            FROM (
                SELECT category, COUNT(*) as pattern_count
                FROM bot_patterns
                WHERE is_active = true
                GROUP BY category
            ) cat_stats
        ) as patterns_by_category,
        COUNT(CASE WHEN created_at > CURRENT_TIMESTAMP - INTERVAL '7 days' THEN 1 END)::INTEGER as recent_discoveries,
        COUNT(CASE 
            WHEN source = 'auto_learning' 
            AND (last_detected IS NULL OR last_detected < CURRENT_TIMESTAMP - INTERVAL '100 days')
            AND confidence < 0.70 
            AND detection_count < 5 
            THEN 1 
        END)::INTEGER as cleanup_candidates
    FROM bot_patterns;
END;
$$ LANGUAGE plpgsql;

-- Function to bulk update pattern status
CREATE OR REPLACE FUNCTION bulk_update_patterns(
    pattern_ids INTEGER[],
    new_status BOOLEAN DEFAULT NULL,
    new_confidence DECIMAL(3,2) DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE bot_patterns
    SET 
        is_active = COALESCE(new_status, is_active),
        confidence = COALESCE(new_confidence, confidence),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ANY(pattern_ids);
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to search patterns with advanced filtering
CREATE OR REPLACE FUNCTION search_bot_patterns(
    search_query TEXT DEFAULT NULL,
    category_filter VARCHAR(100) DEFAULT NULL,
    confidence_min DECIMAL(3,2) DEFAULT NULL,
    confidence_max DECIMAL(3,2) DEFAULT NULL,
    active_only BOOLEAN DEFAULT true,
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
    id INTEGER,
    pattern VARCHAR(500),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    confidence DECIMAL(3,2),
    detection_count INTEGER,
    last_detected TIMESTAMP,
    is_active BOOLEAN,
    source VARCHAR(100),
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bp.id,
        bp.pattern,
        bp.category,
        bp.subcategory,
        bp.confidence,
        bp.detection_count,
        bp.last_detected,
        bp.is_active,
        bp.source,
        bp.created_at
    FROM bot_patterns bp
    WHERE 
        (search_query IS NULL OR 
         bp.pattern ILIKE '%' || search_query || '%' OR 
         bp.description ILIKE '%' || search_query || '%')
    AND (category_filter IS NULL OR bp.category = category_filter)
    AND (confidence_min IS NULL OR bp.confidence >= confidence_min)
    AND (confidence_max IS NULL OR bp.confidence <= confidence_max)
    AND (NOT active_only OR bp.is_active = true)
    ORDER BY bp.detection_count DESC, bp.confidence DESC, bp.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get pattern performance metrics
CREATE OR REPLACE FUNCTION get_pattern_performance(
    days_back INTEGER DEFAULT 7
)
RETURNS TABLE(
    pattern_id INTEGER,
    pattern VARCHAR(500),
    category VARCHAR(100),
    detections_period INTEGER,
    avg_daily_detections DECIMAL(10,2),
    performance_score DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bp.id,
        bp.pattern,
        bp.category,
        COUNT(al.id)::INTEGER as detections_period,
        (COUNT(al.id)::DECIMAL / days_back) as avg_daily_detections,
        (bp.confidence * 100 + COUNT(al.id)::DECIMAL / GREATEST(days_back, 1)) as performance_score
    FROM bot_patterns bp
    LEFT JOIN access_logs al ON (
        al.is_bot = true 
        AND al.created_at > CURRENT_TIMESTAMP - (days_back || ' days')::INTERVAL
        AND LOWER(al.user_agent) LIKE '%' || LOWER(bp.pattern) || '%'
    )
    WHERE bp.is_active = true
    GROUP BY bp.id, bp.pattern, bp.category, bp.confidence
    ORDER BY performance_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job function for automatic cleanup (to be called every 4 hours)
CREATE OR REPLACE FUNCTION scheduled_bot_maintenance()
RETURNS TABLE(
    maintenance_type VARCHAR(50),
    affected_rows INTEGER,
    execution_time TIMESTAMP
) AS $$
DECLARE
    cleanup_result INTEGER;
    learning_result INTEGER;
BEGIN
    -- Cleanup old patterns
    SELECT deleted_count INTO cleanup_result
    FROM cleanup_old_bot_patterns()
    LIMIT 1;
    
    RETURN QUERY
    SELECT 'cleanup'::VARCHAR(50), cleanup_result, CURRENT_TIMESTAMP;
    
    -- Update pattern confidence based on recent activity
    UPDATE bot_patterns
    SET confidence = LEAST(0.95, confidence + 0.01)
    WHERE last_detected > CURRENT_TIMESTAMP - INTERVAL '24 hours'
    AND source = 'auto_learning'
    AND confidence < 0.95;
    
    GET DIAGNOSTICS learning_result = ROW_COUNT;
    
    RETURN QUERY
    SELECT 'confidence_update'::VARCHAR(50), learning_result, CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Display initialization message
SELECT 
    'Bot pattern functions created successfully!' as message,
    'Functions: auto_learn_bot_pattern, cleanup_old_bot_patterns, get_bot_learning_stats, bulk_update_patterns, search_bot_patterns, get_pattern_performance, scheduled_bot_maintenance' as available_functions;
