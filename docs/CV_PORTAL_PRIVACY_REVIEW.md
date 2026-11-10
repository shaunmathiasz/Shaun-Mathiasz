# Pre-release privacy assessment — CV request workflow

This engineering assessment is not a legal compliance certification. The portal is not enabled in production by this change.

## Purpose and proportionality

The professional details and verified email have a clear connection to a requested recruitment introduction. Email OTP, request-scoped cookies and limited technical metadata protect document access and email abuse. A browser permission prompt alone does not establish a lawful basis.

Precise coordinates add limited security value: they can be inaccurate or spoofed, and legitimate recruiters may be travelling or using privacy tools. They are not necessary for CV access. The implemented flow therefore discloses their one-time optional collection before submission, accepts denial without any delay/access penalty, never repeatedly prompts, never polls, encrypts coordinates, excludes them from ordinary notifications/CSV, deletes them after seven days and never treats them as identity/employment proof. It does not perform hiring decisions or influence scoring.

Before public launch the owner must decide whether the residual auditing value justifies precise collection under the applicable Sri Lankan, UK and EU requirements. If a valid basis or necessity cannot be established, omit precise collection before release rather than treating browser permission as blanket consent. This is an explicit outstanding release decision from the user's brief, not an automatic claim of compliance.

## Safeguards and rights

- Minimum mandatory fields: name, organisation, email. No phone or account registration.
- Raw IP/coordinates encrypted at rest in application records, TLS-validated external database connections, server-only credentials and private object storage.
- Single owner access, separate purpose-bound OTP sessions, no public analytics exposure.
- Only Vercel-reserved network metadata is read in the Vercel runtime; arbitrary forwarded headers are ignored elsewhere. IP location is approximate and coordinates browser-reported.
- Clear contact for access/correction/deletion/objection/withdrawal; optional GPS can be denied, browser permission revoked and stored coordinates removed on request.
- Short configurable retention with scheduled enforcement and cascade deletion; separate management needed for exports, email copies and provider backups.
- No unrelated marketing, pixels, fingerprinting, continuous location, covert tracking or browsing-history capture.

## Items for the owner before activation

Confirm the existing Resend sender/domain; select database region and private Blob region; review processor agreements and international transfer safeguards; document the lawful basis for each purpose, including optional location; ensure the published notice matches actual configured retention; define a rights-request and security-incident contact process; test cleanup and access controls with synthetic records before accepting genuine requester data.
