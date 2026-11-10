// Explicit local-only fixture configuration. No real provider credentials or production deployment.
import { spawn } from "node:child_process";
const env = {
  ...process.env,
  RESEND_API_KEY: "local-fixture-not-a-provider-key",
  DATABASE_URL: "postgres://localhost/local-cv-fixture",
  CV_DATA_ENVIRONMENT: "preview",
  CV_FROM_EMAIL: "cv@example.org",
  CV_APP_ORIGIN: "http://127.0.0.1:3060",
  CV_OTP_HMAC_SECRET: "local-only-fixture-hmac-do-not-deploy-000000",
  CV_DATA_ENCRYPTION_KEY: Buffer.alloc(32, 9).toString("base64"),
  TURNSTILE_SECRET_KEY: "local-fixture-not-a-provider-secret",
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: "local-fixture-site-key",
  BLOB_STORE_ID: "local-fixture-store",
  CV_BLOB_PATHNAME: "cv/private.pdf",
  CRON_SECRET: "local-only-fixture-cron-do-not-deploy-000000",
};
if (process.env.VERCEL === "1")
  throw new Error("This helper must never run on Vercel.");
const action = process.argv[2];
if (!["build", "start"].includes(action))
  throw new Error("Use build or start.");
const child = spawn(
  "npm",
  ["run", action, ...(action === "start" ? ["--", "--port", "3060"] : [])],
  { env, stdio: "inherit" },
);
child.on("exit", (code) => process.exit(code ?? 1));
