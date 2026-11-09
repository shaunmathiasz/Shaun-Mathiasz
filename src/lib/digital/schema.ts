import { z } from "zod";
import { digital } from "@/config/digital";
const text = (min: number, max: number) => z.string().trim().min(min).max(max);
export const enquirySchema = z
  .object({
    fullName: text(2, 100),
    businessName: text(2, 160),
    businessCategory: z.enum(digital.categories),
    email: z
      .email()
      .max(254)
      .transform((v) => v.toLowerCase()),
    phone: text(7, 30).refine(
      (v) =>
        /^\+?[\d\s().-]+$/.test(v) &&
        v.replace(/\D/g, "").length >= 9 &&
        v.replace(/\D/g, "").length <= 15,
      "Enter a valid Sri Lankan or international contact number.",
    ),
    selectedPackage: z.enum(["starter", "growth", "premium", "custom"]),
    existingWebsite: z
      .string()
      .trim()
      .max(300)
      .optional()
      .default("")
      .refine(
        (v) =>
          !v ||
          (() => {
            try {
              const u = new URL(v);
              return (
                ["https:", "http:"].includes(u.protocol) &&
                !u.username &&
                !u.password
              );
            } catch {
              return false;
            }
          })(),
        "Enter a complete http or https URL.",
      ),
    businessLocation: z.string().trim().max(120).optional().default(""),
    projectDescription: text(20, 3000),
    preferredTimeline: z
      .enum(["", "Flexible", "Within a month", "1–3 months", "3+ months"])
      .optional()
      .default(""),
    estimatedBudget: z
      .enum([
        "",
        "Under LKR 30,000",
        "LKR 30,000–75,000",
        "LKR 75,000–150,000",
        "LKR 150,000+",
        "Discuss scope",
      ])
      .optional()
      .default(""),
    consent: z.literal(true),
    website: z.string().max(0).optional().default(""),
    turnstileToken: text(1, 2048),
    submissionKey: z.uuid(),
    attribution: z
      .record(z.string(), z.string().max(80))
      .optional()
      .default({}),
  })
  .strict();
export type EnquiryInput = z.infer<typeof enquirySchema>;
export const leadUpdateSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("status"), status: z.enum(digital.statuses) }),
  z.object({ action: z.literal("note"), note: text(1, 2000) }),
  z.object({
    action: z.literal("values"),
    proposalAmount: z.number().int().min(0).max(1000000000),
    acceptedAmount: z.number().int().min(0).max(1000000000),
    collectedAmount: z.number().int().min(0).max(1000000000),
  }),
  z.object({
    action: z.literal("task"),
    title: text(2, 200),
    dueAt: z.iso.datetime(),
  }),
  z.object({ action: z.literal("complete_task"), taskId: z.uuid() }),
  z.object({ action: z.literal("retry_notifications") }),
  z.object({ action: z.literal("delete"), confirmation: z.literal("DELETE") }),
]);
export const filterSchema = z.object({
  search: z.string().trim().max(100).default(""),
  status: z.enum(["all", ...digital.statuses]).default("all"),
  package: z
    .enum(["all", "starter", "growth", "premium", "custom"])
    .default("all"),
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
  page: z.coerce.number().int().min(0).max(10000).default(0),
  sort: z.enum(["newest", "oldest", "value"]).default("newest"),
});
