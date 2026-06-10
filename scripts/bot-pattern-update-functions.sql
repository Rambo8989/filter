-- Enhanced Bot Pattern Functions for Better Detection

-- Function to get comprehensive bot detection with multiple pattern matching
CREATE OR REPLACE FUNCTION detect_bot_comprehensive(user_agent_input TEXT, ip_address_input INET DEFAULT NULL)
RETURNS TABLE(
    is_bot BOOLEAN,
    matched_patterns TEXT[],
    primary_category VARCHAR(100),
    confidence_score DECIMAL(5,2),
    bot_types TEXT[],
    risk_level VARCHAR(20)
) AS $$
DECLARE
    matched_count INTEGER := 0;
    total_confidence DECIMAL(5,2) := 0;
    max_confidence DECIMAL(5,2) := 0;
    primary_cat VARCHAR(100);
    risk VARCHAR(20) := 'LOW';
BEGIN
    -- Initialize return values
    matched_patterns := ARRAY[]::TEXT[];
    bot_types := ARRAY[]::TEXT[];
    
    -- Check for exact pattern matches (non-regex)
    FOR matched_patterns, primary_cat, max_confidence IN
        SELECT 
            ARRAY_AGG(bp.pattern),
            bp.category,
            MAX(bp.confidence)
        FROM bot_patterns bp
        WHERE bp.is_active = true 
        AND bp.is_regex = false
        AND LOWER(user_agent_input) LIKE '%' || LOWER(bp.pattern) || '%'
        GROUP BY bp.category
        ORDER BY MAX(bp.confidence) DESC
    LOOP
        matched_count := matched_count + 1;
        total_confidence := total_confidence + max_confidence;
        bot_types := array_append(bot_types, primary_cat);
        
        -- Set primary category to highest confidence match
        IF primary_category IS NULL THEN
            primary_category := primary_cat;
        END IF;
    END LOOP;
    
    -- If no exact matches, check regex patterns
    IF matched_count = 0 THEN
        FOR matched_patterns, primary_cat, max_confidence IN
            SELECT 
                ARRAY_AGG(bp.pattern),
                bp.category,
                MAX(bp.confidence)
            FROM bot_patterns bp
            WHERE bp.is_active = true 
            AND bp.is_regex = true
            AND user_agent_input ~* bp.pattern
            GROUP BY bp.category
            ORDER BY MAX(bp.confidence) DESC
        LOOP
            matched_count := matched_count + 1;
            total_confidence := total_confidence + max_confidence;
            bot_types := array_append(bot_types, primary_cat);
            
            IF primary_category IS NULL THEN
                primary_category := primary_cat;
            END IF;
        END LOOP;
    END IF;
    
    -- Calculate final confidence and risk level
    IF matched_count > 0 THEN
        confidence_score := LEAST(total_confidence / matched_count, 1.0);
        is_bot := true;
        
        -- Determine risk level based on category and confidence
        IF primary_category IN ('ad_verification', 'security', 'government') OR confidence_score >= 0.95 THEN
            risk_level := 'CRITICAL';
        ELSIF primary_category IN ('ai_llm', 'automation', 'programming') OR confidence_score >= 0.85 THEN
            risk_level := 'HIGH';
        ELSIF confidence_score >= 0.70 THEN
            risk_level := 'MEDIUM';
        ELSE
            risk_level := 'LOW';
        END IF;
    ELSE
        is_bot := false;
        confidence_score := 0.0;
        primary_category := NULL;
        risk_level := 'NONE';
    END IF;
    
    -- Update detection counts for matched patterns
    IF matched_count > 0 THEN
        UPDATE bot_patterns 
        SET 
            detection_count = detection_count + 1,
            last_detected = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE pattern = ANY(matched_patterns);
    END IF;
    
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to add new bot patterns with automatic categorization
CREATE OR REPLACE FUNCTION add_bot_pattern_smart(
    pattern_input VARCHAR(500),
    confidence_input DECIMAL(3,2) DEFAULT 0.80,
    source_input VARCHAR(100) DEFAULT 'manual'
)
RETURNS TABLE(
    success BOOLEAN,
    pattern_id INTEGER,
    suggested_category VARCHAR(100),
    message TEXT
) AS $$
DECLARE
    new_id INTEGER;
    category VARCHAR(100);
    subcategory VARCHAR(100);
    is_regex_pattern BOOLEAN := false;
BEGIN
    -- Auto-detect if pattern is regex
    IF pattern_input ~ '[\.\*\+\?\[\]$$$$\{\}\|\^\\]' THEN
        is_regex_pattern := true;
    END IF;
    
    -- Auto-categorize based on pattern content
    CASE 
        WHEN LOWER(pattern_input) ~ '.*(verification|brand.safety|fraud|viewability|moat|ias|doubleverify).*' THEN
            category := 'ad_verification';
            subcategory := 'brand_safety';
        WHEN LOWER(pattern_input) ~ '.*(bot|crawler|spider|scraper).*' THEN
            category := 'generic';
            subcategory := 'bot';
        WHEN LOWER(pattern_input) ~ '.*(google|bing|yahoo|baidu|yandex).*' THEN
            category := 'search_engine';
            subcategory := 'crawler';
        WHEN LOWER(pattern_input) ~ '.*(facebook|twitter|linkedin|instagram|social).*' THEN
            category := 'social_media';
            subcategory := 'link_preview';
        WHEN LOWER(pattern_input) ~ '.*(selenium|puppeteer|playwright|automation|headless).*' THEN
            category := 'automation';
            subcategory := 'testing';
        WHEN LOWER(pattern_input) ~ '.*(python|java|curl|wget|http|requests).*' THEN
            category := 'programming';
            subcategory := 'http_client';
        WHEN LOWER(pattern_input) ~ '.*(security|scan|penetration|vulnerability|nmap|burp).*' THEN
            category := 'security';
            subcategory := 'scanner';
        WHEN LOWER(pattern_input) ~ '.*(seo|semrush|ahrefs|moz|majestic).*' THEN
            category := 'seo_tools';
            subcategory := 'analysis';
        WHEN LOWER(pattern_input) ~ '.*(monitor|uptime|ping|check).*' THEN
            category := 'monitoring';
            subcategory := 'uptime';
        WHEN LOWER(pattern_input) ~ '.*(ai|gpt|claude|bard|llm|artificial).*' THEN
            category := 'ai_llm';
            subcategory := 'training';
        ELSE
            category := 'generic';
            subcategory := 'unknown';
    END CASE;
    
    -- Insert the new pattern
    INSERT INTO bot_patterns (
        pattern, 
        category, 
        subcategory, 
        source, 
        confidence, 
        is_regex,
        description
    ) VALUES (
        pattern_input,
        category,
        subcategory,
        source_input,
        confidence_input,
        is_regex_pattern,
        'Auto-added pattern: ' || pattern_input
    ) RETURNING id INTO new_id;
    
    success := true;
    pattern_id := new_id;
    suggested_category := category;
    message := 'Pattern added successfully with auto-categorization: ' || category;
    
    RETURN NEXT;
    
EXCEPTION WHEN OTHERS THEN
    success := false;
    pattern_id := NULL;
    suggested_category := NULL;
    message := 'Error adding pattern: ' || SQLERRM;
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to bulk update pattern confidence based on detection performance
CREATE OR REPLACE FUNCTION optimize_pattern_confidence()
RETURNS TABLE(
    patterns_updated INTEGER,
    avg_confidence_before DECIMAL(5,2),
    avg_confidence_after DECIMAL(5,2)
) AS $$
DECLARE
    updated_count INTEGER := 0;
    conf_before DECIMAL(5,2);
    conf_after DECIMAL(5,2);
BEGIN
    -- Get current average confidence
    SELECT ROUND(AVG(confidence), 2) INTO conf_before FROM bot_patterns WHERE is_active = true;
    
    -- Update confidence based on detection performance
    UPDATE bot_patterns 
    SET confidence = CASE
        -- High-performing patterns (frequently detected)
        WHEN detection_count >= 100 THEN LEAST(confidence + 0.05, 1.0)
        WHEN detection_count >= 50 THEN LEAST(confidence + 0.03, 1.0)
        WHEN detection_count >= 10 THEN LEAST(confidence + 0.01, 1.0)
        -- Low-performing patterns (rarely detected)
        WHEN detection_count = 0 AND created_at < NOW() - INTERVAL '30 days' THEN GREATEST(confidence - 0.10, 0.1)
        WHEN detection_count <= 2 AND created_at < NOW() - INTERVAL '7 days' THEN GREATEST(confidence - 0.05, 0.1)
        ELSE confidence
    END,
    updated_at = CURRENT_TIMESTAMP
    WHERE is_active = true;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    -- Get new average confidence
    SELECT ROUND(AVG(confidence), 2) INTO conf_after FROM bot_patterns WHERE is_active = true;
    
    patterns_updated := updated_count;
    avg_confidence_before := conf_before;
    avg_confidence_after := conf_after;
    
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to get bot detection analytics
CREATE OR REPLACE FUNCTION get_bot_analytics(days_back INTEGER DEFAULT 7)
RETURNS TABLE(
    total_detections BIGINT,
    unique_patterns INTEGER,
    top_categories JSONB,
    detection_timeline JSONB,
    risk_distribution JSONB
) AS $$
BEGIN
    -- Get total detections from access logs
    SELECT COUNT(*) INTO total_detections 
    FROM access_logs 
    WHERE is_bot = true 
    AND created_at >= NOW() - (days_back || ' days')::INTERVAL;
    
    -- Get unique patterns that were detected
    SELECT COUNT(DISTINCT bot_type) INTO unique_patterns
    FROM access_logs 
    WHERE is_bot = true 
    AND created_at >= NOW() - (days_back || ' days')::INTERVAL;
    
    -- Get top categories
    SELECT jsonb_object_agg(category, detection_count) INTO top_categories
    FROM (
        SELECT 
            bp.category,
            COUNT(*) as detection_count
        FROM access_logs al
        JOIN bot_patterns bp ON LOWER(al.user_agent) LIKE '%' || LOWER(bp.pattern) || '%'
        WHERE al.is_bot = true 
        AND al.created_at >= NOW() - (days_back || ' days')::INTERVAL
        AND bp.is_active = true
        GROUP BY bp.category
        ORDER BY detection_count DESC
        LIMIT 10
    ) t;
    
    -- Get detection timeline (hourly for last 24 hours)
    SELECT jsonb_object_agg(hour_bucket, detection_count) INTO detection_timeline
    FROM (
        SELECT 
            date_trunc('hour', created_at) as hour_bucket,
            COUNT(*) as detection_count
        FROM access_logs
        WHERE is_bot = true 
        AND created_at >= NOW() - INTERVAL '24 hours'
        GROUP BY hour_bucket
        ORDER BY hour_bucket
    ) t;
    
    -- Get risk distribution (mock data based on categories)
    SELECT jsonb_build_object(
        'CRITICAL', COALESCE((SELECT SUM(detection_count) FROM bot_patterns WHERE category IN ('ad_verification', 'security', 'government')), 0),
        'HIGH', COALESCE((SELECT SUM(detection_count) FROM bot_patterns WHERE category IN ('ai_llm', 'automation', 'programming')), 0),
        'MEDIUM', COALESCE((SELECT SUM(detection_count) FROM bot_patterns WHERE category IN ('seo_tools', 'monitoring')), 0),
        'LOW', COALESCE((SELECT SUM(detection_count) FROM bot_patterns WHERE category IN ('content_discovery', 'archival')), 0)
    ) INTO risk_distribution;
    
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Create a view for easy bot pattern management
CREATE OR REPLACE VIEW bot_patterns_summary AS
SELECT 
    bp.id,
    bp.pattern,
    bp.category,
    bp.subcategory,
    bp.confidence,
    bp.detection_count,
    bp.is_active,
    bp.is_regex,
    bp.last_detected,
    bp.created_at,
    CASE 
        WHEN bp.category IN ('ad_verification', 'security', 'government') THEN 'CRITICAL'
        WHEN bp.category IN ('ai_llm', 'automation', 'programming') THEN 'HIGH'
        WHEN bp.category IN ('seo_tools', 'monitoring') THEN 'MEDIUM'
        ELSE 'LOW'
    END as risk_level,
    CASE 
        WHEN bp.detection_count >= 100 THEN 'High Performance'
        WHEN bp.detection_count >= 10 THEN 'Medium Performance'
        WHEN bp.detection_count > 0 THEN 'Low Performance'
        ELSE 'No Detections'
    END as performance_level
FROM bot_patterns bp
ORDER BY bp.confidence DESC, bp.detection_count DESC;

-- Display summary of the update
SELECT 'Bot pattern functions updated successfully!' as message;
