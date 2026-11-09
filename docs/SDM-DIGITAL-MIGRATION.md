# Verified Preview migration — 10 November 2026

Status: **completed and verified through the connected Neon owner integration**.

- Existing Neon project: shaun-cv-portal (`ancient-field-98524672`).
- Exact existing feature branch: preview/feature/sdm-digital (`br-soft-shape-bcmjt13i`), non-default, non-primary.
- Database: shaun_cv_preview. Environment marker: preview.
- Verified database owner and execution role: neondb_owner.
- Source: migrations/004_sdm_digital_preview_owner.sql, executed as one transaction through Neon with explicit project/branch/database/role arguments. The tool supplies credentials internally; no owner credential was exported or stored in Vercel.

Created only the sdm_digital schema and seven tables: activity, enquiries, events, migrations, outbox, rate_limits and tasks, plus their constraints/indexes/sequences. Recorded migration 004_sdm_digital.

Before/after CV request count: 4 → 4. Before/after public CV schema fingerprint: b173c1f1762cb84d7bfc8a6c9529ffce → b173c1f1762cb84d7bfc8a6c9529ffce. Commercial enquiry count immediately after migration: 0.

The existing shaun_cv_preview_app role was verified directly: USAGE on the service schema and SELECT/INSERT/UPDATE/DELETE on all service tables; sequence USAGE/SELECT granted. The role still cannot create schemas/databases and has no superuser, createdb or createrole privileges. No global role membership or Production permissions were changed. Production was not a migration target.

## Runtime connection correction

The prior deployed Preview continued returning a commercial schema error after the migration because its existing connection did not reach this new schema. Vercel rejected a branch-scoped override of CV_DATABASE_URL/DATABASE_URL: the project has no formally connected Git repository. No override was applied.

To preserve existing CV connections, a dedicated sensitive DIGITAL_DATABASE_URL was added for Preview only, obtained from the exact verified Neon feature branch using the limited shaun_cv_preview_app role. No owner-role credential was stored. The business service uses this separate connection and rejects a Vercel Preview deployment on another Git ref, preventing unrelated Preview branches from sharing feature leads. Existing CV_DATABASE_URL, DATABASE_URL, Resend/Turnstile settings and Production variables were not modified.

Automatic database migration was removed from the build helper. Builds are database-read-only in every environment. Future migrations are explicit and require target/role verification. Production migration and release remain subject to the owner's separate approval.

Deployment/runtime and provider end-to-end checks follow this migration; do not infer completed email delivery from successful DDL.
