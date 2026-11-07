import { z } from "zod";
const optional = (max: number) =>
  z.string().trim().max(max).optional().default("");
export const requesterTypes = [
  "Recruiter / Talent Acquisition",
  "Hiring Manager",
  "Human Resources",
  "Business Owner / Executive",
  "Other Professional Enquiry",
] as const;
export const applicantSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name.").max(100),
  company: z.string().trim().min(2, "Please enter your organisation.").max(140),
  email: z
    .email("Please enter a valid email address.")
    .max(254)
    .transform((s) => s.toLowerCase()),
  jobTitle: optional(120),
  requesterType: z
    .enum(["", ...requesterTypes])
    .optional()
    .default(""),
  opportunity: optional(180),
  opportunityLocation: optional(140),
  linkedinUrl: optional(300).refine(
    (v) =>
      !v ||
      /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_%.-]+\/?$/.test(v),
    "Use a LinkedIn profile URL beginning with https://www.linkedin.com/in/.",
  ),
  message: optional(2000),
  website: optional(200).refine((v) => !v, "Please leave this field empty."),
  turnstileToken: z
    .string()
    .min(1, "Please complete the security check.")
    .max(2048),
});
export type Applicant = z.infer<typeof applicantSchema>;
export const otpSchema = z
  .object({ code: z.string().regex(/^\d{6}$/, "Enter the six-digit code.") })
  .strict();
export const locationSchema = z
  .object({
    token: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
    status: z.enum([
      "granted",
      "denied",
      "unavailable",
      "timeout",
      "unsupported",
    ]),
    latitude: z.number().finite().min(-90).max(90).optional(),
    longitude: z.number().finite().min(-180).max(180).optional(),
    accuracy: z.number().finite().min(0).max(100000).optional(),
    timestamp: z.number().finite().optional(),
  })
  .strict()
  .refine(
    (v) =>
      v.status !== "granted" ||
      [v.latitude, v.longitude, v.accuracy, v.timestamp].every(
        (x) => x !== undefined,
      ),
    "A complete browser-reported position is required.",
  );
export type LocationReport = z.infer<typeof locationSchema>;
export type RequestKind = "cv" | "admin";
