import { z } from "zod";
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100),
  email: z.email("Please enter a valid email address.").max(254),
  message: z
    .string()
    .trim()
    .min(20, "Please include at least 20 characters.")
    .max(4000),
  website: z.string().max(0).optional(),
  consent: z.literal(true, {
    error: "Please agree to the privacy disclosure.",
  }),
});
export function contactConfigured() {
  return Boolean(
    process.env.RESEND_API_KEY &&
    process.env.CONTACT_FROM &&
    process.env.CONTACT_TO,
  );
}
