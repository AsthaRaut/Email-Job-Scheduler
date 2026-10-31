
-- 1. Users: Google authenticated users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Senders: Multiple email sender accounts
CREATE TABLE senders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(320) NOT NULL,
    display_name VARCHAR(255),
    smtp_host VARCHAR(255),
    smtp_port INTEGER,
    smtp_user VARCHAR(255),
    smtp_password_encrypted TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, email)
);

-- 3. Campaigns: Scheduling configuration
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES senders(id),
    subject VARCHAR(998) NOT NULL,
    body TEXT NOT NULL,
    start_at TIMESTAMPTZ NOT NULL,
    delay_ms INTEGER NOT NULL DEFAULT 2000 CHECK (delay_ms >= 0),
    hourly_limit INTEGER NOT NULL DEFAULT 100 CHECK (hourly_limit > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled'
        CHECK (status IN ('scheduled', 'processing', 'completed', 'failed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Emails: Individual recipient jobs
CREATE TABLE emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES senders(id),
    recipient VARCHAR(320) NOT NULL,
    subject VARCHAR(998) NOT NULL,
    body TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled'
        CHECK (status IN ('scheduled', 'processing', 'sent', 'failed', 'cancelled')),
    error TEXT,
    attempts INTEGER NOT NULL DEFAULT 0,
    idempotency_key VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_emails_user_status
ON emails(user_id, status);

CREATE INDEX idx_emails_scheduled_at
ON emails(scheduled_at)
WHERE status = 'scheduled';

CREATE INDEX idx_emails_campaign
ON emails(campaign_id);

-- 5. Slack integrations
CREATE TABLE slack_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    team_id VARCHAR(255),
    team_name VARCHAR(255),
    access_token_encrypted TEXT,
    webhook_url_encrypted TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
