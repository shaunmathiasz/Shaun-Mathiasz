import { z } from "zod";
import { eventNames } from "./events";
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
