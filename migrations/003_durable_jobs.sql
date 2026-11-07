CREATE TABLE IF NOT EXISTS cv_background_jobs (
 request_id uuid NOT NULL REFERENCES cv_requests(id) ON DELETE CASCADE,
 kind text NOT NULL CHECK(kind IN ('retention','notification')),
 generation integer NOT NULL DEFAULT 0,
 run_id text,
 lease_until timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(request_id,kind)
);
REVOKE ALL ON cv_background_jobs FROM PUBLIC;
CREATE INDEX IF NOT EXISTS cv_background_pending_idx ON cv_background_jobs(created_at) WHERE run_id IS NULL;
INSERT INTO cv_background_jobs(request_id,kind) SELECT id,'retention' FROM cv_requests WHERE kind='cv' ON CONFLICT DO NOTHING;
INSERT INTO cv_background_jobs(request_id,kind) SELECT request_id,'notification' FROM cv_notification_outbox WHERE status NOT IN ('accepted','delivered') ON CONFLICT DO NOTHING;
