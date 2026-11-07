BEGIN;
CREATE TABLE IF NOT EXISTS cv_requests (
 id uuid PRIMARY KEY, kind text NOT NULL CHECK(kind IN ('cv','admin')),
 full_name text NOT NULL, company text NOT NULL, email text NOT NULL,
 details jsonb NOT NULL DEFAULT '{}', session_hash text NOT NULL UNIQUE,
 session_expires_at timestamptz NOT NULL DEFAULT now()+interval '90 minutes',
 submitted_at timestamptz NOT NULL DEFAULT now(), verified_at timestamptz,
 verification_status text NOT NULL DEFAULT 'pending' CHECK(verification_status IN ('pending','verified','locked','replaced')),
 notification_status text NOT NULL DEFAULT 'not_queued', grant_count int NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS cv_request_submitted_idx ON cv_requests(submitted_at DESC);
CREATE INDEX IF NOT EXISTS cv_request_email_idx ON cv_requests(email);
CREATE TABLE IF NOT EXISTS cv_verification_challenges (
 request_id uuid PRIMARY KEY REFERENCES cv_requests(id) ON DELETE CASCADE,
 generation int NOT NULL DEFAULT 0, otp_hash text NOT NULL, expires_at timestamptz NOT NULL,
 failed_attempts int NOT NULL DEFAULT 0 CHECK(failed_attempts BETWEEN 0 AND 5),
 resend_count int NOT NULL DEFAULT 0 CHECK(resend_count BETWEEN 0 AND 3),
 sent_at timestamptz NOT NULL DEFAULT now(), accepted_at timestamptz,
 consumed_at timestamptz
);
CREATE TABLE IF NOT EXISTS cv_access_tokens (
 id uuid PRIMARY KEY, request_id uuid NOT NULL REFERENCES cv_requests(id) ON DELETE CASCADE,
 token_hash text NOT NULL UNIQUE, expires_at timestamptz NOT NULL,
 consumed_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cv_grants_request_idx ON cv_access_tokens(request_id);
CREATE TABLE IF NOT EXISTS cv_request_metadata (
 request_id uuid PRIMARY KEY REFERENCES cv_requests(id) ON DELETE CASCADE,
 ip_ciphertext text, ip_country text, ip_region text, ip_city text,
 device_type text, browser text, operating_system text, referrer text,
 gps_ciphertext text, gps_permission_status text NOT NULL DEFAULT 'pending', gps_recorded_at timestamptz,
 location_token_hash text NOT NULL, location_expires_at timestamptz NOT NULL DEFAULT now()+interval '10 minutes'
);
CREATE TABLE IF NOT EXISTS cv_access_events (
 id bigserial PRIMARY KEY, request_id uuid NOT NULL REFERENCES cv_requests(id) ON DELETE CASCADE,
 event_type text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cv_event_request_idx ON cv_access_events(request_id,created_at DESC);
CREATE TABLE IF NOT EXISTS cv_rate_limits (
 bucket text PRIMARY KEY, count int NOT NULL CHECK(count>0), expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS cv_notification_outbox (
 id uuid PRIMARY KEY, request_id uuid NOT NULL UNIQUE REFERENCES cv_requests(id) ON DELETE CASCADE,
 status text NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','processing','accepted','delivered','failed')),
 payload_ciphertext text, attempts int NOT NULL DEFAULT 0, next_attempt_at timestamptz NOT NULL DEFAULT now(),
 lease_until timestamptz, provider_id text UNIQUE, last_error text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cv_outbox_due_idx ON cv_notification_outbox(next_attempt_at) WHERE status IN ('queued','failed','processing');
CREATE TABLE IF NOT EXISTS cv_admin_audit (
 id bigserial PRIMARY KEY, action text NOT NULL, request_id uuid, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS cv_webhook_receipts (id text PRIMARY KEY,created_at timestamptz NOT NULL DEFAULT now());
REVOKE ALL ON cv_requests,cv_verification_challenges,cv_access_tokens,cv_request_metadata,cv_access_events,cv_rate_limits,cv_notification_outbox,cv_admin_audit,cv_webhook_receipts FROM PUBLIC;
COMMIT;
