# Repository rules

- Keep profile facts in typed content files; never invent dates, qualifications or outcomes.
- Keep draft articles clearly labeled and noindex until approved.
- Preserve confidentiality: no rates, contracts, margins, passenger data or internal assets.
- Use Server Components by default. Keep secrets server-only.
- Run lint, typecheck, unit tests and build before handoff; report browser tests honestly.
- Do not enable CV or professional links without real verified assets.

- CV access must remain server-authorised: no public PDFs, local-file fallback, URL bearer tokens, fake OTP delivery or client-only verification.
- Keep database transitions atomic; never log OTPs, cookies, provider keys or requester details. Private CV staging PDFs stay ignored by Git.
- Do not deploy the CV portal until real OTP/private-storage and owner-authentication checks pass. Local provider fixtures are not evidence of cloud delivery.
