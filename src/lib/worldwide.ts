import { z } from "zod";
import {
  destinations,
  hotels,
  flights,
  pricing,
  contracts,
  events,
  type DestinationId,
} from "@/content/worldwide";
export const GAME_VERSION = 1;
export const SAVE_KEY = "shaun-worldwide-v1";
export const BEST_KEY = "shaun-worldwide-best-v1";
export const ROUNDS = 5;
export const decisionSchema = z.object({
  destination: z.enum([
    "london",
    "maldives",
    "dubai",
    "tokyo",
    "bali",
    "new-york",
  ]),
  hotel: z.enum(["essential", "boutique", "luxury"]),
  flight: z.enum(["connection", "direct", "flexible"]),
  pricing: z.enum(["value", "balanced", "premium"]),
  contract: z.enum(["on-demand", "allotment"]),
});
export type Decision = z.infer<typeof decisionSchema>;
export const defaultDecision: Decision = {
  destination: "maldives",
  hotel: "boutique",
  flight: "direct",
  pricing: "balanced",
  contract: "on-demand",
};
export type RoundResult = {
  round: number;
  decision: Decision;
  eventId: string;
  response: number;
  bookings: number;
  capacity: number;
  unitCost: number;
  sellingPrice: number;
  revenue: number;
  directCosts: number;
  grossProfit: number;
  releaseCharge: number;
  launchCost: number;
  eventCost: number;
  financeCharge: number;
  netProfit: number;
  reputationChange: number;
  satisfactionChange: number;
  capitalAfter: number;
  reason: string;
};
export type GameState = {
  seed: number;
  capital: number;
  reputation: number;
  satisfaction: number;
  completedPackages: number;
  history: RoundResult[];
  pending: Decision | null;
};
const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));
/** Stateless integer PRNG. The same seed, round and stream always yield the same result. */
export function randomAt(seed: number, round: number, stream = 0) {
  let x =
    (seed ^
      Math.imul(round + 1, 0x9e3779b9) ^
      Math.imul(stream + 1, 0x85ebca6b)) >>>
    0;
  x = Math.imul(x ^ (x >>> 16), 0x21f0aaad);
  x = Math.imul(x ^ (x >>> 15), 0x735a2d97);
  return ((x ^ (x >>> 15)) >>> 0) / 4294967296;
}
export function newGame(seed: number): GameState {
  if (!Number.isInteger(seed) || seed < 0 || seed > 4294967295)
    throw Error("Invalid game seed");
  return {
    seed,
    capital: 10000,
    reputation: 50,
    satisfaction: 50,
    completedPackages: 0,
    history: [],
    pending: null,
  };
}
export function eventFor(state: GameState) {
  return events[
    Math.floor(randomAt(state.seed, state.history.length, 0) * events.length)
  ];
}
export function quote(decision: Decision, capital = 10000) {
  const d = decisionSchema.parse(decision);
  const destination = destinations.find((v) => v.id === d.destination)!;
  const hotel = hotels.find((v) => v.id === d.hotel)!;
  const flight = flights.find((v) => v.id === d.flight)!;
  const price = pricing.find((v) => v.id === d.pricing)!;
  const contract = contracts.find((v) => v.id === d.contract)!;
  const unitCost = Math.round(
    (destination.flight * flight.multiplier +
      destination.hotel * hotel.multiplier) *
      (1 - contract.discount),
  );
  const sellingPrice = Math.round(unitCost * (1 + price.markup));
  const capacity = clamp(
    Math.floor((Math.max(0, capital) * 0.8) / unitCost),
    2,
    12,
  );
  return {
    destination,
    hotel,
    flight,
    price,
    contract,
    unitCost,
    sellingPrice,
    capacity,
    margin: ((sellingPrice - unitCost) / sellingPrice) * 100,
  };
}
export function launchRound(state: GameState, decision: Decision): GameState {
  if (state.pending || state.history.length >= ROUNDS)
    throw Error("This round cannot be launched");
  return { ...state, pending: decisionSchema.parse(decision) };
}
export function settleRound(state: GameState, response: number): GameState {
  if (
    !state.pending ||
    state.history.length >= ROUNDS ||
    (response !== 0 && response !== 1)
  )
    throw Error("Choose a valid event response");
  const d = state.pending;
  const q = quote(d, state.capital);
  const event = eventFor(state);
  const option = event.options[response];
  const fit =
    d.pricing === "premium"
      ? d.hotel === "luxury"
        ? 1.2
        : d.hotel === "essential"
          ? 0.65
          : 0.94
      : d.pricing === "value" && d.hotel === "luxury"
        ? 0.82
        : 1;
  const luxuryBonus =
    event.id === "luxury" && response === 0 && d.hotel === "luxury" ? 1.3 : 1;
  const demand =
    q.destination.demand *
    q.price.demand *
    q.hotel.appeal *
    fit *
    luxuryBonus *
    option.demand *
    (0.6 + state.reputation / 160) *
    (0.65 + state.satisfaction / 200) *
    (0.76 + randomAt(state.seed, state.history.length, 1) * 0.4);
  const bookings = clamp(Math.floor(demand), 0, q.capacity);
  const revenue = bookings * q.sellingPrice;
  const directCosts = bookings * q.unitCost;
  const grossProfit = revenue - directCosts;
  const releaseCharge =
    d.contract === "allotment"
      ? Math.round(Math.min(4, q.capacity - bookings) * q.unitCost * 0.35)
      : 0;
  const launchCost = 180;
  const financeCharge = state.capital < 0 ? 75 : 0;
  const eventCost =
    event.id === "cancellation" && response === 0 && d.flight === "flexible"
      ? 84
      : option.cost;
  const netProfit =
    grossProfit - releaseCharge - launchCost - eventCost - financeCharge;
  const satisfactionChange =
    q.hotel.satisfaction +
    q.flight.satisfaction +
    q.price.satisfaction +
    option.satisfaction +
    (d.pricing === "premium" && d.hotel === "essential" ? -10 : 0);
  const reputationChange =
    option.reputation +
    (satisfactionChange >= 5 ? 3 : satisfactionChange < -5 ? -4 : 1) +
    (bookings === 0 ? -3 : 0);
  const reason =
    d.pricing === "premium" && d.hotel === "essential"
      ? "Premium pricing with an essential stay weakened the promise. Matching the product to its audience matters."
      : q.capacity <= 3
        ? "Working capital limited your departure capacity. A smaller launch reduced exposure, but also capped bookings."
        : bookings === q.capacity
          ? "Demand filled the departure. Your capacity capped sales; a higher price or a different route could change the balance."
          : "The departure did not fill. Price, product fit, reputation and the event response all shaped demand.";
  const result: RoundResult = {
    round: state.history.length + 1,
    decision: d,
    eventId: event.id,
    response,
    bookings,
    capacity: q.capacity,
    unitCost: q.unitCost,
    sellingPrice: q.sellingPrice,
    revenue,
    directCosts,
    grossProfit,
    releaseCharge,
    launchCost,
    eventCost,
    financeCharge,
    netProfit,
    reputationChange,
    satisfactionChange,
    capitalAfter: state.capital + netProfit,
    reason,
  };
  return {
    seed: state.seed,
    capital: state.capital + netProfit,
    reputation: clamp(state.reputation + reputationChange, 0, 100),
    satisfaction: clamp(state.satisfaction + satisfactionChange, 0, 100),
    completedPackages: state.completedPackages + bookings,
    history: [...state.history, result],
    pending: null,
  };
}
export const achievementTitles = [
  "Rookie Explorer",
  "Route Builder",
  "Destination Strategist",
  "Travel Industry Titan",
  "Global Travel Mogul",
] as const;
export function performance(state: GameState) {
  const score = Math.round(
    clamp((state.capital - 10000 + 8000) / 28000, 0, 1) * 350 +
      state.reputation * 3 +
      state.satisfaction * 2.5 +
      state.history.length * 20,
  );
  const title =
    achievementTitles[
      score < 350 ? 0 : score < 500 ? 1 : score < 650 ? 2 : score < 800 ? 3 : 4
    ];
  return { score, title, netProfit: state.capital - 10000 };
}
const saveSchema = z.object({
  version: z.literal(GAME_VERSION),
  seed: z.number().int().min(0).max(4294967295),
  turns: z
    .array(
      z.object({
        decision: decisionSchema,
        response: z.union([z.literal(0), z.literal(1)]),
      }),
    )
    .max(ROUNDS),
  pending: decisionSchema.nullable(),
});
export function serialiseGame(state: GameState) {
  return JSON.stringify({
    version: GAME_VERSION,
    seed: state.seed,
    turns: state.history.map((r) => ({
      decision: r.decision,
      response: r.response,
    })),
    pending: state.pending,
  });
}
/** Replay decisions rather than trusting balances from browser storage. Local scores are not anti-cheat validated. */
export function restoreGame(raw: string): GameState | null {
  try {
    if (raw.length > 12000) return null;
    const save = saveSchema.parse(JSON.parse(raw));
    let state = newGame(save.seed);
    for (const turn of save.turns)
      state = settleRound(launchRound(state, turn.decision), turn.response);
    if (save.pending) state = launchRound(state, save.pending);
    return state;
  } catch {
    return null;
  }
}
export const bestSchema = z.object({
  version: z.literal(1),
  score: z.number().int().min(0).max(1000),
  title: z.enum(achievementTitles),
});
export type PersonalBest = z.infer<typeof bestSchema>;
export function restoreBest(raw: string | null): PersonalBest | null {
  try {
    return bestSchema.parse(JSON.parse(raw ?? "null"));
  } catch {
    return null;
  }
}
export function destinationName(id: DestinationId) {
  return destinations.find((d) => d.id === id)!.name;
}
