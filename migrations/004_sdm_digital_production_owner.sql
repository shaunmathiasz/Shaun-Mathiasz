-- Owner-authorised Production release, 10 November 2026.
-- Reuses the Preview-tested additive migration; aborts on another database/environment.
BEGIN;
SELECT pg_advisory_xact_lock(hashtext('sdm-digital-migration'));
DO $$ BEGIN
 IF current_database() <> 'shaun_cv_production' OR
    COALESCE((SELECT environment FROM public.cv_portal_environment WHERE singleton=true),'') <> 'production' THEN
  RAISE EXCEPTION 'Production database identity required; no changes applied';
 END IF;
END $$;
CREATE SCHEMA IF NOT EXISTS sdm_digital;
REVOKE ALL ON SCHEMA sdm_digital FROM PUBLIC;
CREATE TABLE IF NOT EXISTS sdm_digital.migrations (version text PRIMARY KEY,applied_at timestamptz NOT NULL DEFAULT now());
INSERT INTO sdm_digital.migrations(version) VALUES('004_sdm_digital') ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS sdm_digital.enquiries (
 id uuid PRIMARY KEY, reference text NOT NULL UNIQUE, submission_hash text NOT NULL UNIQUE,
 payload_hash text NOT NULL, full_name text NOT NULL, business_name text NOT NULL,
 business_category text NOT NULL, email text NOT NULL, phone text NOT NULL,
 selected_package text NOT NULL CHECK(selected_package IN ('starter','growth','premium','custom')),
 quoted_package_price integer CHECK(quoted_package_price>=0),
 business_location text NOT NULL DEFAULT '', existing_website text NOT NULL DEFAULT '',
 project_description text NOT NULL, estimated_budget text NOT NULL DEFAULT '', preferred_timeline text NOT NULL DEFAULT '',
 status text NOT NULL DEFAULT 'NEW' CHECK(status IN ('NEW','CONTACTED','QUALIFIED','PROPOSAL_SENT','NEGOTIATING','WON','LOST','SPAM')),
 source text NOT NULL DEFAULT 'services', attribution jsonb NOT NULL DEFAULT '{}',
 proposal_amount bigint NOT NULL DEFAULT 0 CHECK(proposal_amount>=0), accepted_amount bigint NOT NULL DEFAULT 0 CHECK(accepted_amount>=0), collected_amount bigint NOT NULL DEFAULT 0 CHECK(collected_amount>=0),
 consent_version text NOT NULL DEFAULT 'sdm-digital-v1', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS digital_enquiries_created ON sdm_digital.enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS digital_enquiries_status ON sdm_digital.enquiries(status,selected_package);
CREATE TABLE IF NOT EXISTS sdm_digital.activity (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, enquiry_id uuid REFERENCES sdm_digital.enquiries(id) ON DELETE CASCADE,
 action_type text NOT NULL, previous_status text, new_status text, note text NOT NULL DEFAULT '', actor_id text NOT NULL DEFAULT 'owner', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sdm_digital.tasks (
 id uuid PRIMARY KEY, enquiry_id uuid NOT NULL REFERENCES sdm_digital.enquiries(id) ON DELETE CASCADE,
 title text NOT NULL, due_at timestamptz NOT NULL, completed_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS digital_tasks_due ON sdm_digital.tasks(due_at) WHERE completed_at IS NULL;
CREATE TABLE IF NOT EXISTS sdm_digital.outbox (
 id uuid PRIMARY KEY, enquiry_id uuid NOT NULL REFERENCES sdm_digital.enquiries(id) ON DELETE CASCADE,
 kind text NOT NULL CHECK(kind IN ('owner','customer')), state text NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','sent','failed')),
 attempts integer NOT NULL DEFAULT 0, next_attempt_at timestamptz NOT NULL DEFAULT now(), lease_until timestamptz,
 provider_id text, sent_at timestamptz, UNIQUE(enquiry_id,kind)
);
CREATE TABLE IF NOT EXISTS sdm_digital.rate_limits (bucket text PRIMARY KEY, count integer NOT NULL, expires_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS sdm_digital.events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, event_id uuid NOT NULL UNIQUE, name text NOT NULL,
 package_id text, category text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS digital_events_date ON sdm_digital.events(created_at,name);
REVOKE ALL ON ALL TABLES IN SCHEMA sdm_digital FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA sdm_digital FROM PUBLIC;
GRANT USAGE ON SCHEMA sdm_digital TO shaun_cv_production_app;
GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA sdm_digital TO shaun_cv_production_app;
GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA sdm_digital TO shaun_cv_production_app;
COMMIT;
