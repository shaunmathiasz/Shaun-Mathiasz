import { describe, expect, it } from "vitest";
import {
  destinations,
  hotels,
  flights,
  pricing,
  contracts,
  events,
} from "@/content/worldwide";
import {
  defaultDecision,
  newGame,
  launchRound,
  settleRound,
  quote,
  eventFor,
  randomAt,
  performance,
  restoreGame,
  serialiseGame,
  restoreBest,
  type Decision,
} from "@/lib/worldwide";
function run(seed: number, decision: Decision = defaultDecision) {
  let s = newGame(seed);
  for (let i = 0; i < 5; i++) s = settleRound(launchRound(s, decision), i % 2);
  return s;
}
describe("WORLDWIDE finance and decisions", () => {
  it("opens with the stated balances and no completed packages", () => {
    expect(newGame(42)).toMatchObject({
      capital: 10000,
      reputation: 50,
      satisfaction: 50,
      completedPackages: 0,
      history: [],
      pending: null,
    });
  });
  it("distinguishes markup from margin and scales capacity with capital", () => {
    const q = quote(defaultDecision);
    expect(q.sellingPrice).toBe(Math.round(q.unitCost * 1.3));
    expect(q.margin).toBeCloseTo(
      ((q.sellingPrice - q.unitCost) / q.sellingPrice) * 100,
    );
    expect(q.margin).toBeLessThan(30);
    expect(quote(defaultDecision, -100).capacity).toBe(2);
    expect(quote(defaultDecision, 100000).capacity).toBe(12);
  });
  it("reconciles every line and all cash for varied decisions and seeds", () => {
    for (let seed = 0; seed < 64; seed++) {
      const d: Decision = {
        destination: destinations[seed % 6].id,
        hotel: hotels[seed % 3].id,
        flight: flights[(seed >> 1) % 3].id,
        pricing: pricing[(seed >> 2) % 3].id,
        contract: contracts[seed % 2].id,
      };
      const s = run(seed, d);
      let capital = 10000,
        packages = 0;
      for (const r of s.history) {
        expect(r.revenue).toBe(r.bookings * r.sellingPrice);
        expect(r.directCosts).toBe(r.bookings * r.unitCost);
        expect(r.grossProfit).toBe(r.revenue - r.directCosts);
        expect(r.netProfit).toBe(
          r.grossProfit -
            r.releaseCharge -
            r.launchCost -
            r.eventCost -
            r.financeCharge,
        );
        capital += r.netProfit;
        expect(r.capitalAfter).toBe(capital);
        expect(r.bookings).toBeGreaterThanOrEqual(0);
        expect(r.bookings).toBeLessThanOrEqual(r.capacity);
        packages += r.bookings;
      }
      expect(s.capital).toBe(capital);
      expect(s.completedPackages).toBe(packages);
      expect(s.reputation).toBeGreaterThanOrEqual(0);
      expect(s.reputation).toBeLessThanOrEqual(100);
      expect(s.satisfaction).toBeGreaterThanOrEqual(0);
      expect(s.satisfaction).toBeLessThanOrEqual(100);
    }
  });
  it("charges release fees only for unfilled allotments", () => {
    const d: Decision = {
      ...defaultDecision,
      destination: "london",
      pricing: "premium",
      hotel: "essential",
      contract: "allotment",
    };
    const s = settleRound(launchRound(newGame(12), d), 1);
    const r = s.history[0];
    expect(r.releaseCharge).toBe(
      Math.round(Math.min(4, r.capacity - r.bookings) * r.unitCost * 0.35),
    );
    expect(r.releaseCharge).toBeGreaterThan(0);
    expect(
      settleRound(launchRound(newGame(12), { ...d, contract: "on-demand" }), 1)
        .history[0].releaseCharge,
    ).toBe(0);
  });
  it("keeps five rounds playable with a simulated overdraft", () => {
    let s = { ...newGame(1), capital: -1000 };
    s = settleRound(launchRound(s, defaultDecision), 0);
    expect(s.history[0].capacity).toBe(2);
    expect(s.history[0].financeCharge).toBe(75);
  });
  it("responds to positioning rather than always rewarding the highest markup", () => {
    const poor = run(12, {
      ...defaultDecision,
      destination: "london",
      hotel: "essential",
      pricing: "premium",
    });
    const fit = run(12, {
      ...defaultDecision,
      destination: "london",
      hotel: "boutique",
      pricing: "balanced",
    });
    expect(poor.satisfaction).toBeLessThan(fit.satisfaction);
    expect(poor.completedPackages).toBeLessThan(fit.completedPackages);
  });
  it("rejects duplicate launch, settlement without a product, invalid responses and a sixth round", () => {
    const s = newGame(1);
    expect(() => settleRound(s, 0)).toThrow();
    expect(() =>
      launchRound(launchRound(s, defaultDecision), defaultDecision),
    ).toThrow();
    expect(() => settleRound(launchRound(s, defaultDecision), 2)).toThrow();
    expect(() => launchRound(run(1), defaultDecision)).toThrow();
    expect(() => newGame(NaN)).toThrow();
    expect(() =>
      quote({
        ...defaultDecision,
        destination: "invented",
      } as unknown as Decision),
    ).toThrow();
  });
});
describe("WORLDWIDE events and scores", () => {
  it("is reproducible and each event offers two different responses", () => {
    expect(run(351)).toEqual(run(351));
    for (const event of events) {
      expect(event.options).toHaveLength(2);
      expect(event.options[0]).not.toEqual(event.options[1]);
    }
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) {
      const s = newGame(i);
      seen.add(eventFor(s).id);
      expect(randomAt(i, 0)).toBeGreaterThanOrEqual(0);
      expect(randomAt(i, 0)).toBeLessThan(1);
    }
    expect(seen.size).toBe(8);
  });
  it("flexible tickets protect against cancellation recovery cost", () => {
    let seed = 0;
    while (eventFor(newGame(seed)).id !== "cancellation") seed++;
    const flex = settleRound(
      launchRound(newGame(seed), { ...defaultDecision, flight: "flexible" }),
      0,
    );
    const direct = settleRound(launchRound(newGame(seed), defaultDecision), 0);
    expect(flex.history[0].eventCost).toBe(84);
    expect(direct.history[0].eventCost).toBe(420);
  });
  it("event responses change financial and customer results", () => {
    const s = launchRound(newGame(101), defaultDecision);
    expect(settleRound(s, 0)).not.toEqual(settleRound(s, 1));
  });
  it("bounds the composite score and assigns all five titles", () => {
    const s = run(1);
    const profiles = [
      [-9000, 0, 0],
      [10000, 50, 50],
      [18000, 60, 60],
      [26000, 70, 70],
      [50000, 100, 100],
    ];
    const titles = profiles.map(([capital, reputation, satisfaction]) => {
      const r = performance({ ...s, capital, reputation, satisfaction });
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(1000);
      return r.title;
    });
    expect(new Set(titles).size).toBe(5);
    expect(performance(s).netProfit).toBe(s.capital - 10000);
  });
});
describe("WORLDWIDE persistence", () => {
  it("round-trips a pending event, partial game and completed game without trusting saved money", () => {
    let s = launchRound(newGame(123), defaultDecision);
    expect(restoreGame(serialiseGame(s))).toEqual(s);
    s = settleRound(s, 1);
    expect(restoreGame(serialiseGame(s))).toEqual(s);
    expect(restoreGame(serialiseGame(run(123)))).toEqual(run(123));
    const raw = JSON.parse(serialiseGame(s));
    raw.capital = 999999999;
    expect(restoreGame(JSON.stringify(raw))?.capital).toBe(s.capital);
  });
  it("rejects malformed, oversized, incompatible and impossible saved progress", () => {
    for (const raw of [
      "",
      "null",
      "{broken",
      "x".repeat(13000),
      JSON.stringify({ version: 2, seed: 1, turns: [], pending: null }),
    ])
      expect(restoreGame(raw)).toBeNull();
    const complete = JSON.parse(serialiseGame(run(1)));
    complete.pending = defaultDecision;
    expect(restoreGame(JSON.stringify(complete))).toBeNull();
    complete.pending = null;
    complete.turns.push(complete.turns[0]);
    expect(restoreGame(JSON.stringify(complete))).toBeNull();
  });
  it("validates local personal-best records", () => {
    expect(restoreBest("{broken")).toBeNull();
    expect(restoreBest(null)).toBeNull();
    expect(
      restoreBest(
        JSON.stringify({
          version: 1,
          score: 9001,
          title: "Global Travel Mogul",
        }),
      ),
    ).toBeNull();
    expect(
      restoreBest(
        JSON.stringify({
          version: 1,
          score: 800,
          title: "Travel Industry Titan",
        }),
      )?.score,
    ).toBe(800);
  });
});
