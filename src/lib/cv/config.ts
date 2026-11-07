export type CvConfig = {
  databaseUrl: string;
  dataEnvironment: "production" | "preview";
  resendKey: string;
  fromEmail: string;
  ownerEmail: string;
  origin: string;
  hmacSecret: string;
  encryptionKey: string;
  turnstileSecret: string;
  turnstileSiteKey: string;
  blobPath: string;
  cronSecret: string;
  webhookSecret?: string;
  retention: {
    pendingHours: number;
    ipDays: number;
    gpsDays: number;
    verifiedDays: number;
  };
};
const required = [
  "DATABASE_URL",
  "RESEND_API_KEY",
  "CV_FROM_EMAIL",
  "CV_APP_ORIGIN",
  "CV_OTP_HMAC_SECRET",
  "CV_DATA_ENCRYPTION_KEY",
  "TURNSTILE_SECRET_KEY",
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
  "CV_BLOB_PATHNAME",
  "CRON_SECRET",
] as const;
export function dataEnvironment(
  env: NodeJS.ProcessEnv = process.env,
): "production" | "preview" | undefined {
  if (env.VERCEL === "1")
    return env.VERCEL_ENV === "production"
      ? "production"
      : env.VERCEL_ENV === "preview"
        ? "preview"
        : undefined;
  return env.CV_DATA_ENVIRONMENT === "production"
    ? "production"
    : env.CV_DATA_ENVIRONMENT === "preview"
      ? "preview"
      : undefined;
}
export function appOrigin(env: NodeJS.ProcessEnv = process.env) {
  if (env.CV_APP_ORIGIN) return env.CV_APP_ORIGIN;
  if (
    env.VERCEL === "1" &&
    env.VERCEL_ENV === "preview" &&
    env.VERCEL_URL &&
    /^[A-Za-z0-9.-]+\.vercel\.app$/.test(env.VERCEL_URL)
  )
    return `https://${env.VERCEL_URL}`;
  return undefined;
}
export function configProblems(env: NodeJS.ProcessEnv = process.env) {
  const origin = appOrigin(env);
  const missing: string[] = required.filter((k) =>
    k === "CV_APP_ORIGIN" ? !origin : !env[k],
  );
  if (!dataEnvironment(env))
    missing.push(
      "CV_DATA_ENVIRONMENT (production or preview, inferred on Vercel)",
    );
  if (!env.BLOB_STORE_ID && !env.BLOB_READ_WRITE_TOKEN)
    missing.push("BLOB_STORE_ID or BLOB_READ_WRITE_TOKEN");
  if (env.CV_OTP_HMAC_SECRET && env.CV_OTP_HMAC_SECRET.length < 32)
    missing.push("CV_OTP_HMAC_SECRET (at least 32 characters)");
  if (
    env.CV_DATA_ENCRYPTION_KEY &&
    Buffer.from(env.CV_DATA_ENCRYPTION_KEY, "base64").length !== 32
  )
    missing.push("CV_DATA_ENCRYPTION_KEY (32 bytes, base64)");
  if (env.CRON_SECRET && env.CRON_SECRET.length < 32)
    missing.push("CRON_SECRET (at least 32 characters)");
  if (
    env.CV_FROM_EMAIL &&
    !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(env.CV_FROM_EMAIL)
  )
    missing.push("CV_FROM_EMAIL (verified-domain address)");
  if (
    env.CV_FROM_EMAIL &&
    /@(gmail|yahoo|outlook|hotmail)\./i.test(env.CV_FROM_EMAIL)
  )
    missing.push("CV_FROM_EMAIL (use your own verified sending domain)");
  if (origin) {
    try {
      const u = new URL(origin);
      if (
        u.origin !== origin ||
        !(
          u.protocol === "https:" ||
          (env.VERCEL !== "1" &&
            ["localhost", "127.0.0.1"].includes(u.hostname))
        )
      )
        missing.push("CV_APP_ORIGIN (exact HTTPS origin)");
    } catch {
      missing.push("CV_APP_ORIGIN (valid origin)");
    }
  }
  if (
    env.VERCEL === "1" &&
    [env.TURNSTILE_SECRET_KEY, env.NEXT_PUBLIC_TURNSTILE_SITE_KEY].some(
      (v) => v && (/^[123]x0000/.test(v) || v.includes("fixture")),
    )
  )
    missing.push(
      "Turnstile production credentials (testing keys are not allowed on Vercel)",
    );
  if (env.CV_FROM_EMAIL?.endsWith("@resend.dev"))
    missing.push(
      "CV_FROM_EMAIL (Resend sandbox senders cannot serve arbitrary recruiters)",
    );
  if (
    env.CV_BLOB_PATHNAME &&
    !/^[A-Za-z0-9/_-]+\.pdf$/.test(env.CV_BLOB_PATHNAME)
  )
    missing.push("CV_BLOB_PATHNAME (fixed private PDF pathname)");
  return missing;
}
export function getConfig(): CvConfig {
  if (configProblems().length) throw new Error("CV_CONFIGURATION_UNAVAILABLE");
  const days = (k: string, n: number) => {
    const v = Number(process.env[k] ?? n);
    return Number.isFinite(v) && v > 0 && v <= 365 ? v : n;
  };
  return {
    databaseUrl: process.env.DATABASE_URL!,
    dataEnvironment: dataEnvironment()!,
    resendKey: process.env.RESEND_API_KEY!,
    fromEmail: process.env.CV_FROM_EMAIL!,
    ownerEmail: process.env.CV_OWNER_EMAIL || "shaun.emirates@gmail.com",
    origin: appOrigin()!,
    hmacSecret: process.env.CV_OTP_HMAC_SECRET!,
    encryptionKey: process.env.CV_DATA_ENCRYPTION_KEY!,
    turnstileSecret: process.env.TURNSTILE_SECRET_KEY!,
    turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
    blobPath: process.env.CV_BLOB_PATHNAME!,
    cronSecret: process.env.CRON_SECRET!,
    webhookSecret: process.env.RESEND_WEBHOOK_SECRET,
    retention: {
      pendingHours: days("CV_PENDING_RETENTION_HOURS", 24),
      ipDays: days("CV_IP_RETENTION_DAYS", 30),
      gpsDays: days("CV_GPS_RETENTION_DAYS", 7),
      verifiedDays: days("CV_VERIFIED_RETENTION_DAYS", 90),
    },
  };
}
