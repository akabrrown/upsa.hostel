-- Security events logging table
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL, -- 'login_failed', 'login_success', 'role_change', 'data_access', 'api_error', etc.
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255),
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    resource VARCHAR(255), -- What was accessed/modified
    action VARCHAR(100), -- What action was performed
    severity VARCHAR(20) DEFAULT 'info', -- 'info', 'warning', 'critical'
    details JSONB, -- Additional context
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for security_events table
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_user ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created ON security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_ip ON security_events(ip_address);

-- Function to log security event
CREATE OR REPLACE FUNCTION log_security_event(
    p_event_type VARCHAR,
    p_user_id UUID,
    p_email VARCHAR,
    p_ip_address VARCHAR,
    p_user_agent TEXT,
    p_resource VARCHAR DEFAULT NULL,
    p_action VARCHAR DEFAULT NULL,
    p_severity VARCHAR DEFAULT 'info',
    p_details JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
BEGIN
    INSERT INTO security_events (
        event_type,
        user_id,
        email,
        ip_address,
        user_agent,
        resource,
        action,
        severity,
        details
    ) VALUES (
        p_event_type,
        p_user_id,
        p_email,
        p_ip_address,
        p_user_agent,
        p_resource,
        p_action,
        p_severity,
        p_details
    ) RETURNING id INTO v_event_id;
    
    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- Cleanup old security events (keep 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_security_events()
RETURNS VOID AS $$
BEGIN
    DELETE FROM security_events 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days'
    AND severity != 'critical'; -- Keep critical events longer
END;
$$ LANGUAGE plpgsql;

-- View for recent suspicious activity
CREATE OR REPLACE VIEW suspicious_activity AS
SELECT 
    event_type,
    user_id,
    email,
    ip_address,
    COUNT(*) as event_count,
    MAX(created_at) as last_occurrence
FROM security_events
WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '1 hour'
AND event_type IN ('login_failed', 'api_error', 'unauthorized_access')
GROUP BY event_type, user_id, email, ip_address
HAVING COUNT(*) > 5
ORDER BY event_count DESC;
