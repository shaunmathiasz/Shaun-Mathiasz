/** Outbound readiness is independent of optional inbound MX verification.
 * Source: current Resend retrieve-domain and domain verification documentation.
 */
export type ResendDomain = {
  status?: string;
  capabilities?: { sending?: string };
  records?: { record?: string; status?: string }[];
};
export function outboundReady(domain: ResendDomain | undefined) {
  if (!domain || domain.capabilities?.sending !== "enabled") return false;
  if (domain.status === "verified") return true;
  if (domain.status !== "partially_verified") return false;
  const dkim = domain.records?.filter((r) => r.record === "DKIM") ?? [],
    sending = domain.records?.filter((r) => r.record === "SPF") ?? [];
  return (
    dkim.length > 0 &&
    sending.length > 0 &&
    [...dkim, ...sending].every((r) => r.status === "verified")
  );
}
