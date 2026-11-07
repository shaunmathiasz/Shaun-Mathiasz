CREATE TABLE IF NOT EXISTS cv_portal_environment (
 singleton boolean PRIMARY KEY DEFAULT true CHECK(singleton),
 environment text NOT NULL CHECK(environment IN ('production','preview'))
);
REVOKE ALL ON cv_portal_environment FROM PUBLIC;
CREATE TABLE IF NOT EXISTS cv_schema_migrations (
 version text PRIMARY KEY,
 applied_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON cv_schema_migrations FROM PUBLIC;
