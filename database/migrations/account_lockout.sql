-- Failed login attempts tracking for account lockout
CREATE TABLE IF NOT EXISTS failed_login_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    attempt_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    INDEX idx_failed_logins_email (email),
    INDEX idx_failed_logins_user_id (user_id),
    INDEX idx_failed_logins_time (attempt_time)
);

-- Account lockouts table
CREATE TABLE IF NOT EXISTS account_lockouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    locked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    locked_until TIMESTAMP WITH TIME ZONE NOT NULL,
    reason VARCHAR(255) DEFAULT 'Too many failed login attempts',
    unlock_token VARCHAR(255),
    INDEX idx_lockouts_email (email),
    INDEX idx_lockouts_until (locked_until)
);

-- Function to check if account is locked
CREATE OR REPLACE FUNCTION is_account_locked(p_email VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    v_locked_until TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT locked_until INTO v_locked_until
    FROM account_lockouts
    WHERE email = p_email
    AND locked_until > CURRENT_TIMESTAMP;
    
    RETURN v_locked_until IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to lock account
CREATE OR REPLACE FUNCTION lock_account(
    p_email VARCHAR,
    p_user_id UUID,
    p_duration_minutes INTEGER DEFAULT 15
) RETURNS VOID AS $$
BEGIN
    INSERT INTO account_lockouts (user_id, email, locked_until)
    VALUES (
        p_user_id,
        p_email,
        CURRENT_TIMESTAMP + (p_duration_minutes || ' minutes')::INTERVAL
    )
    ON CONFLICT (email) 
    DO UPDATE SET
        locked_until = CURRENT_TIMESTAMP + (p_duration_minutes || ' minutes')::INTERVAL,
        locked_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function to unlock account
CREATE OR REPLACE FUNCTION unlock_account(p_email VARCHAR)
RETURNS VOID AS $$
BEGIN
    DELETE FROM account_lockouts WHERE email = p_email;
    DELETE FROM failed_login_attempts WHERE email = p_email;
END;
$$ LANGUAGE plpgsql;

-- Cleanup old failed attempts (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_failed_attempts()
RETURNS VOID AS $$
BEGIN
    DELETE FROM failed_login_attempts 
    WHERE attempt_time < CURRENT_TIMESTAMP - INTERVAL '24 hours';
    
    DELETE FROM account_lockouts
    WHERE locked_until < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;
