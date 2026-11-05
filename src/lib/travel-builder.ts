export type BuilderInput = {
  destination: string;
  theme: string;
  traveller: string;
  budget: string;
  stay: string;
  priorities: string[];
};
export const defaults: BuilderInput = {
  destination: "Maldives",
  theme: "Rest & renewal",
  traveller: "Couple",
  budget: "Considered",
  stay: "Boutique",
  priorities: ["Unhurried pace"],
};
const destinations: Record<
  string,
  { arrival: string; discovery: string; logistics: string }
> = {
  Maldives: {
    arrival: "Arrival and a deliberately light settling-in day.",
    discovery:
      "An island-focused day, with time reserved for the ocean and rest.",
    logistics:
      "Confirm inter-island transfers, arrival windows and weather contingencies.",
  },
  "Sri Lanka": {
    arrival: "Arrival and time to settle into Colombo.",
    discovery:
      "A cultural neighbourhood visit followed by a slower coastal chapter.",
    logistics:
      "Consider road journey times and seasonal conditions before adding stops.",
  },
  "United Kingdom": {
    arrival: "Arrival with time to recover before exploring the city.",
    discovery:
      "A neighbourhood-led city day with an optional countryside extension.",
    logistics:
      "Consider airport-to-city transfers, opening days and rail connections.",
  },
};
export function buildConcept(input: BuilderInput) {
  const place = destinations[input.destination] || destinations.Maldives;
  return {
    title: `${input.destination} / ${input.theme}`,
    days: [
      place.arrival,
      input.theme === "Culture & discovery"
        ? place.discovery
        : "A flexible day built around " +
          input.theme.toLowerCase() +
          ", with optional activities.",
      input.priorities.includes("Local culture")
        ? place.discovery
        : "An open day with one considered experience, rather than a crowded schedule.",
      "A light final morning with a sensible departure buffer.",
    ],
    priorities: [
      `${input.traveller}: pace and inclusions should match the people travelling.`,
      `${input.stay} accommodation: confirm location, facilities and suitability.`,
      ...input.priorities,
    ],
    commercial: [
      place.logistics,
      input.budget === "Premium"
        ? "Prioritise fit and service quality; higher spend does not remove the need to compare inclusions."
        : "Limit unnecessary transfers and compare total inclusions before adding upgrades.",
      "Validate seasonality, cancellation conditions and supplier terms before any real proposal.",
    ],
    tradeoff: input.priorities.includes("More destinations")
      ? "More stops widen the experience but reduce time in each place and add transfer complexity."
      : "Fewer stops create more breathing room; the trade-off is a narrower geographic range.",
  };
}
