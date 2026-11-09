import { z } from "zod";
export const eventNames = [
  "digital_services_page_view",
  "package_card_view",
  "package_cta_click",
  "package_selected",
  "comparison_table_view",
  "custom_solution_cta_click",
  "enquiry_form_started",
  "enquiry_form_submit_attempt",
  "enquiry_form_validation_error",
  "enquiry_form_success",
  "enquiry_form_error",
  "whatsapp_cta_click",
  "email_cta_click",
  "phone_cta_click",
  "faq_interaction",
  "industry_selected",
  "demo_interaction",
  "generate_lead",
] as const;
export const eventSchema = z
  .object({
    eventId: z.uuid(),
    name: z.enum(eventNames),
    packageId: z.enum(["starter", "growth", "premium", "custom"]).optional(),
    category: z
      .enum([
        "Villas",
        "Boutique Hotels",
        "Guesthouses",
        "Travel Agencies",
        "Tour Operators",
        "Restaurants",
        "Other Businesses",
      ])
      .optional(),
    consent: z.literal(true),
  })
  .strict();
export type DigitalEvent = (typeof eventNames)[number];
/** Only configured campaign codes survive. Never accept arbitrary UTM text as analytics. */
const allowed: Record<string, readonly string[]> = {
  utm_source: [
    "google",
    "instagram",
    "facebook",
    "tiktok",
    "linkedin",
    "direct",
    "referral",
  ],
  utm_medium: ["organic", "social", "email", "cpc", "referral"],
  utm_campaign: ["sdm-digital-launch"],
  utm_content: ["profile", "post", "bio", "website"],
  utm_term: [],
};
export function safeAttribution(input: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(input).filter(([key, value]) =>
      allowed[key]?.includes(value),
    ),
  );
}
