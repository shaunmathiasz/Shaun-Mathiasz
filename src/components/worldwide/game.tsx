"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion } from "motion/react";
import {
  ArrowUpRight,
  Plane,
  Trophy,
  Volume2,
  VolumeX,
  RotateCcw,
  Globe2,
  Check,
  Copy,
} from "lucide-react";
import { useSafeReducedMotion } from "@/lib/use-safe-reduced-motion";
import {
  destinations,
  hotels,
  flights,
  pricing,
  contracts,
  events,
} from "@/content/worldwide";
import { DestinationMap } from "./destination-map";
import { EarthEntrance } from "./earth-entrance";
import {
  BEST_KEY,
  SAVE_KEY,
  ROUNDS,
  defaultDecision,
  newGame,
  quote,
  launchRound,
  settleRound,
  eventFor,
  performance,
  serialiseGame,
  restoreGame,
  restoreBest,
  destinationName,
  type Decision,
  type GameState,
  type RoundResult,
  type PersonalBest,
} from "@/lib/worldwide";
const money = (n: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);
type View = "intro" | "planning" | "event" | "outcome" | "results";
function AmbientParticles() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let visible = true;
    const update = () =>
      el.style.setProperty(
        "--ww-ambient-state",
        visible && !document.hidden ? "running" : "paused",
      );
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  return (
    <div ref={ref} className="ww-particles" aria-hidden="true">
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} />
      ))}
    </div>
  );
}
function MoneyCounter({ value }: { value: number }) {
  const node = useRef<HTMLSpanElement>(null);
  const previous = useRef(value);
  const reduced = useSafeReducedMotion();
  useEffect(() => {
    const el = node.current;
    if (!el) return;
    const from = previous.current;
    previous.current = value;
    if (reduced || from === value) {
      el.textContent = money(value);
      return;
    }
    const control = animate(from, value, {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (n) => {
        el.textContent = money(n);
      },
    });
    return () => control.stop();
  }, [value, reduced]);
  return (
    <span>
      <span ref={node} aria-hidden="true">
        {money(value)}
      </span>
      <span className="sr-only">{money(value)}</span>
    </span>
  );
}
function Options<T extends string>({
  legend,
  value,
  items,
  onChange,
}: {
  legend: string;
  value: T;
  items: readonly { id: T; name: string; detail: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="ww-options">
      <legend>{legend}</legend>
      <div>
        {items.map((item) => (
          <label key={item.id} data-selected={value === item.id}>
            <input
              type="radio"
              name={legend}
              value={item.id}
              checked={value === item.id}
              onChange={() => onChange(item.id)}
            />
            <span>
              <strong>{item.name}</strong>
              <small>{item.detail}</small>
            </span>
            <Check size={16} aria-hidden="true" />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
function Stat({
  label,
  children,
  detail,
}: {
  label: string;
  children: ReactNode;
  detail?: string;
}) {
  return (
    <div className="ww-stat">
      <span>{label}</span>
      <strong>{children}</strong>
      {detail && <small>{detail}</small>}
    </div>
  );
}
function Ledger({ result }: { result: RoundResult }) {
  return (
    <dl className="ww-ledger">
      <div>
        <dt>Bookings × selling price</dt>
        <dd>
          {result.bookings} × {money(result.sellingPrice)}
        </dd>
      </div>
      <div>
        <dt>Revenue</dt>
        <dd>{money(result.revenue)}</dd>
      </div>
      <div>
        <dt>Direct package costs</dt>
        <dd>−{money(result.directCosts)}</dd>
      </div>
      <div className="ww-ledger-sub">
        <dt>Gross profit</dt>
        <dd>{money(result.grossProfit)}</dd>
      </div>
      <div>
        <dt>Unfilled allotment charge</dt>
        <dd>−{money(result.releaseCharge)}</dd>
      </div>
      <div>
        <dt>Launch & finance costs</dt>
        <dd>−{money(result.launchCost + result.financeCharge)}</dd>
      </div>
      <div>
        <dt>
          {result.eventCost < 0
            ? "Supplier contribution"
            : "Event response cost"}
        </dt>
        <dd>
          {result.eventCost < 0 ? "+" : "−"}
          {money(Math.abs(result.eventCost))}
        </dd>
      </div>
      <div className="ww-ledger-total">
        <dt>Net profit / cash movement</dt>
        <dd>{money(result.netProfit)}</dd>
      </div>
      <div>
        <dt>Capital after settlement</dt>
        <dd>{money(result.capitalAfter)}</dd>
      </div>
    </dl>
  );
}
export default function WorldwideGame() {
  const [game, setGame] = useState<GameState | null>(null),
    [saved, setSaved] = useState<GameState | null>(null),
    [best, setBest] = useState<PersonalBest | null>(null);
  const [view, setView] = useState<View>("intro"),
    [decision, setDecision] = useState<Decision>(defaultDecision),
    [ready, setReady] = useState(false),
    [sound, setSound] = useState(false),
    [notice, setNotice] = useState(""),
    [shareText, setShareText] = useState(""),
    [confirmReset, setConfirmReset] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null),
    audio = useRef<AudioContext | null>(null);
  const reduced = useSafeReducedMotion();
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        const restored = raw ? restoreGame(raw) : null;
        setSaved(restored);
        setBest(restoreBest(localStorage.getItem(BEST_KEY)));
        if (raw && !restored)
          setNotice(
            "Your saved journey could not be restored. Start a new empire.",
          );
      } catch {
        setNotice(
          "Browser storage is unavailable. You can still play; progress will last for this visit.",
        );
      }
      setReady(true);
    });
    return () => {
      cancelAnimationFrame(frame);
      void audio.current?.close().catch(() => {});
    };
  }, []);
  useEffect(() => {
    if (!game) return;
    try {
      localStorage.setItem(SAVE_KEY, serialiseGame(game));
      if (game.history.length === ROUNDS) {
        const result = performance(game);
        const old = restoreBest(localStorage.getItem(BEST_KEY));
        if (!old || result.score > old.score) {
          const next: PersonalBest = {
            version: 1,
            score: result.score,
            title: result.title,
          };
          localStorage.setItem(BEST_KEY, JSON.stringify(next));
          requestAnimationFrame(() => setBest(next));
        }
      }
    } catch {
      const frame = requestAnimationFrame(() =>
        setNotice(
          "Progress could not be saved in this browser. Keep this tab open to continue.",
        ),
      );
      return () => cancelAnimationFrame(frame);
    }
  }, [game]);
  useEffect(() => {
    if (view !== "intro") heading.current?.focus();
  }, [view]);
  function tone() {
    if (!sound || !audio.current) return;
    try {
      const ctx = audio.current;
      if (ctx.state !== "running") return;
      const o = ctx.createOscillator(),
        g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(440, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.15);
      g.gain.setValueAtTime(0.035, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.25);
    } catch {}
  }
  async function toggleSound() {
    if (sound) {
      setSound(false);
      return;
    }
    try {
      audio.current ??= new AudioContext();
      await audio.current.resume();
      setSound(true);
    } catch {
      setNotice(
        "Sound is unavailable in this browser. The game remains fully playable.",
      );
    }
  }
  function start() {
    let seed: number;
    try {
      seed = crypto.getRandomValues(new Uint32Array(1))[0];
    } catch {
      seed = 20261106; // Controlled fallback if secure browser randomness is unavailable.
    }
    setGame(newGame(seed));
    setDecision(defaultDecision);
    setView("planning");
    setConfirmReset(false);
    setShareText("");
    tone();
  }
  function resume() {
    if (!saved) return;
    setGame(saved);
    setDecision(saved.pending ?? defaultDecision);
    setView(
      saved.history.length === ROUNDS
        ? "results"
        : saved.pending
          ? "event"
          : "planning",
    );
    tone();
  }
  function launch() {
    if (!game || game.pending) return;
    setGame(launchRound(game, decision));
    setView("event");
    tone();
  }
  function respond(index: number) {
    if (!game?.pending) return;
    setGame(settleRound(game, index));
    setView("outcome");
    tone();
  }
  async function copyResult() {
    if (!game) return;
    const result = performance(game);
    const text = `WORLDWIDE — ${result.title}\n${result.score}/1,000 · five rounds completed\nCan you build your own travel empire?\n${window.location.origin}/play`;
    try {
      await navigator.clipboard.writeText(text);
      setShareText("Results copied. Your strategy stays a secret.");
    } catch {
      setShareText(text);
    }
  }
  function downloadCard() {
    if (!game) return;
    const result = performance(game);
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const c = canvas.getContext("2d");
    if (!c) {
      setShareText("Image export is unavailable. Use Copy results instead.");
      return;
    }
    const grad = c.createLinearGradient(0, 0, 1200, 630);
    grad.addColorStop(0, "#060b16");
    grad.addColorStop(1, "#152e45");
    c.fillStyle = grad;
    c.fillRect(0, 0, 1200, 630);
    c.strokeStyle = "#d2b88a";
    c.strokeRect(35, 35, 1130, 560);
    c.fillStyle = "#d2b88a";
    c.font = "18px sans-serif";
    c.fillText("THE TRAVEL TYCOON CHALLENGE", 80, 110);
    c.fillStyle = "#f5f2ea";
    c.font = "bold 86px sans-serif";
    c.fillText("WORLDWIDE", 76, 220);
    c.font = "38px serif";
    c.fillText(result.title, 80, 330);
    c.font = "bold 72px sans-serif";
    c.fillText(`${result.score} / 1,000`, 80, 430);
    c.font = "20px sans-serif";
    c.fillText(
      "Five rounds. A world of decisions. Your next departure: /play",
      80,
      510,
    );
    c.fillStyle = "#9daabd";
    c.font = "16px sans-serif";
    c.fillText("Fictional strategy game · shaun-mathiasz.vercel.app", 80, 552);
    canvas.toBlob((blob) => {
      if (!blob) {
        setShareText("Image export failed. Use Copy results instead.");
        return;
      }
      const url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = "worldwide-results.png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setShareText("Results card prepared for download.");
    }, "image/png");
  }
  const current = game?.history.at(-1),
    result = game ? performance(game) : null;
  const q = quote(game?.pending ?? decision, game?.capital ?? 10000);
  const intro = view === "intro";
  return (
    <div className="worldwide" data-reduced={reduced}>
      <div className="ww-toolbar">
        <Link href="/play" prefetch={false} className="ww-brand">
          W<span>/</span>W <small>WORLDWIDE</small>
        </Link>
        <div>
          <span>STRATEGY / FIVE ROUNDS</span>
          <button
            className="ww-sound"
            aria-label={
              sound
                ? "Sound on — mute game sound"
                : "Sound off — enable game sound"
            }
            aria-pressed={sound}
            onClick={toggleSound}
          >
            {sound ? <Volume2 size={17} /> : <VolumeX size={17} />}
            <span>Sound {sound ? "on" : "off"}</span>
          </button>
        </div>
      </div>
      {notice && (
        <p className="ww-notice" role="status">
          {notice}
        </p>
      )}
      {intro ? (
        <section className="ww-intro">
          <AmbientParticles />
          <div className="ww-intro-copy">
            <p className="eyebrow">YOUR NEXT CHAPTER IS GLOBAL</p>
            <h1 aria-label="WORLDWIDE">
              WORLD<span>WIDE</span>
              <i aria-hidden="true">↗</i>
            </h1>
            <h2>The Travel Tycoon Challenge</h2>
            <p className="ww-tagline">
              Build routes. Conquer destinations.
              <br />
              Become a travel mogul.
            </p>
            <div className="ww-actions">
              <button
                className="button gold-button"
                disabled={!ready}
                onClick={start}
              >
                START YOUR EMPIRE <ArrowUpRight size={19} />
              </button>
              {saved && (
                <button className="ww-secondary" onClick={resume}>
                  {saved.history.length === ROUNDS
                    ? "View saved results"
                    : `Resume round ${Math.min(5, saved.history.length + 1)}`}{" "}
                  <ArrowUpRight size={16} />
                </button>
              )}
            </div>
            <p className="ww-intro-meta">
              £10,000 capital <span>·</span> 5 rounds <span>·</span> 6
              destinations
            </p>
            {best && (
              <p className="ww-best">
                <Trophy size={14} /> Your local best: {best.score}/1,000 ·{" "}
                {best.title}
              </p>
            )}
            <details className="ww-rules">
              <summary>Your briefing & cash-flow rules</summary>
              <p>
                Start with £10,000 virtual capital, 50 reputation and 50
                satisfaction. Build one three-night package per round, choose a
                response to an event, then see the settled result. A booking
                means one completed traveller package.
              </p>
              <p>
                Revenue = bookings × selling price. Gross profit = revenue −
                booked package costs. Net profit also deducts a £180 launch fee,
                event costs, unfilled allotment charges and any finance charge.
                Capital changes by net profit.
              </p>
              <p>
                Bookings pay before suppliers in this simplified game. Capacity
                uses 80% of current capital divided by unit cost, limited to
                2–12 places. A negative balance is a simulated overdraft:
                capacity falls to two places and the next round costs £75 in
                finance charges. All five rounds remain playable.
              </p>
              <p>
                Cost markup differs from gross margin. Reputation, satisfaction,
                product fit and seeded demand affect sales. Results score
                financial resilience (35%), reputation (30%), satisfaction (25%)
                and completed rounds (10%). A seed fixes event and demand rolls;
                different strategies still change outcomes.
              </p>
              <p>
                Progress and personal bests stay in this browser. No public
                leaderboard, account or tracking. Sound is optional and off by
                default.
              </p>
            </details>
          </div>
          <div className="ww-intro-art">
            <EarthEntrance />
            <div className="ww-departure">
              <span>NEXT DEPARTURE</span>
              <strong>ANYWHERE.</strong>
              <Plane size={21} />
              <small>YOUR WORLD. YOUR DECISIONS.</small>
            </div>
          </div>
          <div className="ww-intro-bottom">
            <span>01 / BUILD A PRODUCT</span>
            <span>02 / NAVIGATE THE UNEXPECTED</span>
            <span>03 / GROW WITH PURPOSE</span>
          </div>
        </section>
      ) : (
        game && (
          <div className="ww-cockpit">
            <div className="ww-round-heading">
              <div>
                <p className="eyebrow">
                  YOUR EMPIRE /{" "}
                  {view === "results"
                    ? "FINAL ARRIVAL"
                    : `DEPARTURE ${Math.min(game.history.length + (view === "outcome" ? 0 : 1), 5)} OF 5`}
                </p>
                <h1 ref={heading} tabIndex={-1}>
                  {view === "planning"
                    ? "Where to next?"
                    : view === "event"
                      ? "Expect the unexpected."
                      : view === "outcome"
                        ? "The departure, settled."
                        : "Your world. Your legacy."}
                </h1>
              </div>
              <div
                className="ww-round-dots"
                role="group"
                aria-label={`${game.history.length} of 5 rounds settled`}
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    data-complete={game.history.length > i}
                    data-current={game.history.length === i}
                  >
                    {game.history.length > i ? <Check size={13} /> : i + 1}
                  </span>
                ))}
              </div>
            </div>
            <div className="ww-stats" aria-label="Empire performance">
              <Stat
                label="Working capital"
                detail={
                  game.capital < 0
                    ? "Virtual overdraft"
                    : "Opening capital £10,000"
                }
              >
                <MoneyCounter value={game.capital} />
              </Stat>
              <Stat label="Net profit" detail="All settled rounds">
                <MoneyCounter value={game.capital - 10000} />
              </Stat>
              <Stat label="Reputation">
                <span>
                  {game.reputation}
                  <small>/100</small>
                </span>
                <meter
                  min={0}
                  max={100}
                  value={game.reputation}
                  aria-label="Reputation"
                />
              </Stat>
              <Stat label="Satisfaction">
                <span>
                  {game.satisfaction}
                  <small>/100</small>
                </span>
                <meter
                  min={0}
                  max={100}
                  value={game.satisfaction}
                  aria-label="Customer satisfaction"
                />
              </Stat>
              <Stat
                label="Completed packages"
                detail="One booking = one traveller"
              >
                {game.completedPackages}
              </Stat>
            </div>
            <motion.div
              key={view + game.history.length}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {view === "planning" && (
                <div className="ww-planning">
                  <div className="ww-product">
                    <div className="ww-panel-heading">
                      <span className="eyebrow">
                        01 / YOUR NEXT DESTINATION
                      </span>
                      <span>THREE-NIGHT GAME PACKAGE</span>
                    </div>
                    <DestinationMap
                      selected={decision.destination}
                      onSelect={(id) =>
                        setDecision((v) => ({ ...v, destination: id }))
                      }
                    />
                    <div
                      className="ww-destinations"
                      role="group"
                      aria-label="Choose destination"
                    >
                      {destinations.map((d) => (
                        <button
                          key={d.id}
                          aria-pressed={decision.destination === d.id}
                          onClick={() =>
                            setDecision((v) => ({ ...v, destination: d.id }))
                          }
                        >
                          <span>{d.code}</span>
                          <strong>{d.name}</strong>
                          <small>{d.appeal}</small>
                          <ArrowUpRight size={16} />
                        </button>
                      ))}
                    </div>
                    <p className="ww-market-note">
                      <Globe2 size={16} />
                      {q.destination.risk}
                    </p>
                    <div className="ww-choices">
                      <Options
                        legend="Accommodation"
                        items={hotels}
                        value={decision.hotel}
                        onChange={(hotel) =>
                          setDecision((v) => ({ ...v, hotel }))
                        }
                      />
                      <Options
                        legend="Flight arrangement"
                        items={flights}
                        value={decision.flight}
                        onChange={(flight) =>
                          setDecision((v) => ({ ...v, flight }))
                        }
                      />
                      <Options
                        legend="Pricing strategy"
                        items={pricing}
                        value={decision.pricing}
                        onChange={(pricing) =>
                          setDecision((v) => ({ ...v, pricing }))
                        }
                      />
                      <Options
                        legend="Supplier agreement"
                        items={contracts}
                        value={decision.contract}
                        onChange={(contract) =>
                          setDecision((v) => ({ ...v, contract }))
                        }
                      />
                    </div>
                  </div>
                  <aside className="ww-quote">
                    <p className="eyebrow">THE PRODUCT BRIEF</p>
                    <h2>
                      {q.destination.name}
                      <span> / {q.destination.code}</span>
                    </h2>
                    <p>
                      {q.destination.country}
                      <br />
                      {q.destination.appeal}
                    </p>
                    <dl>
                      <div>
                        <dt>Direct cost / traveller</dt>
                        <dd>{money(q.unitCost)}</dd>
                      </div>
                      <div>
                        <dt>Selling price / traveller</dt>
                        <dd>{money(q.sellingPrice)}</dd>
                      </div>
                      <div>
                        <dt>Gross margin if booked</dt>
                        <dd>{q.margin.toFixed(1)}%</dd>
                      </div>
                      <div>
                        <dt>Departure capacity</dt>
                        <dd>{q.capacity} travellers</dd>
                      </div>
                    </dl>
                    <div className="ww-price">
                      <span>ILLUSTRATIVE SELLING PRICE</span>
                      <strong>{money(q.sellingPrice)}</strong>
                      <small>per traveller · three nights</small>
                    </div>
                    <p className="ww-small">
                      Bookings are decided after the event. Costs and demand are
                      fictional game values.
                    </p>
                    <button className="button gold-button" onClick={launch}>
                      Launch this product <Plane size={18} />
                    </button>
                    <p className="ww-small">
                      Your choices lock for this round. Next: one event, two
                      responses.
                    </p>
                  </aside>
                </div>
              )}
              {view === "event" && (
                <section className="ww-event">
                  <div className="ww-event-symbol" aria-hidden="true">
                    <Plane size={64} />
                  </div>
                  <p className="eyebrow">
                    LIVE BRIEFING / {q.destination.code}
                  </p>
                  <h2>{eventFor(game).name}</h2>
                  <p>{eventFor(game).story}</p>
                  <div className="ww-event-options">
                    {eventFor(game).options.map((o, i) => (
                      <button key={o.label} onClick={() => respond(i)}>
                        <span>RESPONSE 0{i + 1}</span>
                        <strong>{o.label}</strong>
                        <p>{o.detail}</p>
                        <ArrowUpRight size={24} />
                      </button>
                    ))}
                  </div>
                  <details className="ww-rules">
                    <summary>Your locked product</summary>
                    <p>
                      {q.destination.name} · {q.hotel.name} · {q.flight.name} ·{" "}
                      {q.price.name} · {q.contract.name}
                    </p>
                    <p>
                      {money(q.sellingPrice)} per traveller · {q.capacity}{" "}
                      places · {money(q.unitCost)} direct unit cost.
                    </p>
                  </details>
                </section>
              )}
              {view === "outcome" && current && (
                <section className="ww-outcome">
                  <div>
                    <p className="eyebrow">
                      ARRIVED /{" "}
                      {destinationName(
                        current.decision.destination,
                      ).toUpperCase()}
                    </p>
                    <h2>
                      {current.bookings}
                      <span>
                        {" "}
                        travellers.
                        <br />
                        One considered journey.
                      </span>
                    </h2>
                    <p>{current.reason}</p>
                    <div className="ww-outcome-signals">
                      <span>
                        Reputation {current.reputationChange >= 0 ? "+" : ""}
                        {current.reputationChange}
                      </span>
                      <span>
                        Satisfaction{" "}
                        {current.satisfactionChange >= 0 ? "+" : ""}
                        {current.satisfactionChange}
                      </span>
                    </div>
                    <p className="ww-small">
                      Meters are capped at 0–100; changes shown are the round’s
                      effects before caps.
                    </p>
                    <button
                      className="button gold-button"
                      onClick={() => {
                        setView(
                          game.history.length === ROUNDS
                            ? "results"
                            : "planning",
                        );
                        tone();
                      }}
                    >
                      {game.history.length === ROUNDS
                        ? "See your legacy"
                        : "Plan the next departure"}{" "}
                      <ArrowUpRight size={18} />
                    </button>
                  </div>
                  <div className="ww-statement">
                    <p className="eyebrow">
                      ROUND {current.round} / FINANCIAL STATEMENT
                    </p>
                    <Ledger result={current} />
                  </div>
                </section>
              )}
              {view === "results" && result && (
                <section className="ww-results">
                  <div className="ww-result-seal">
                    <Trophy size={38} />
                    <span>FIVE DEPARTURES / WORLDWIDE</span>
                  </div>
                  <p className="eyebrow">YOUR ACHIEVEMENT</p>
                  <h2>{result.title}</h2>
                  <div className="ww-score">
                    {result.score}
                    <span>/ 1,000</span>
                  </div>
                  <p>A world of decisions. A strategy entirely your own.</p>
                  <div className="ww-result-grid">
                    <Stat label="Final net profit">
                      {money(result.netProfit)}
                    </Stat>
                    <Stat label="Remaining capital">{money(game.capital)}</Stat>
                    <Stat label="Reputation">{game.reputation}/100</Stat>
                    <Stat label="Satisfaction">{game.satisfaction}/100</Stat>
                  </div>
                  {best && (
                    <p className="ww-best">
                      <Trophy size={15} /> Personal best on this browser:{" "}
                      {best.score}/1,000 · {best.title}
                    </p>
                  )}
                  <p className="ww-small">
                    Local record only. There is no public leaderboard.
                  </p>
                  <div className="ww-actions">
                    <button className="button gold-button" onClick={start}>
                      Build another empire <RotateCcw size={17} />
                    </button>
                    <button className="ww-secondary" onClick={copyResult}>
                      <Copy size={16} /> Copy results
                    </button>
                    <button className="ww-secondary" onClick={downloadCard}>
                      Download results card ↗
                    </button>
                  </div>
                  <p role="status" className="ww-share-status">
                    {shareText}
                  </p>
                  <Link href="/about" className="text-link">
                    Meet the person behind the game <ArrowUpRight size={15} />
                  </Link>
                </section>
              )}
            </motion.div>
            {game.history.length > 0 && (
              <details className="ww-history">
                <summary>
                  Your departure journal · {game.history.length} settled
                </summary>
                {game.history.map((r) => (
                  <details key={r.round}>
                    <summary>
                      0{r.round} / {destinationName(r.decision.destination)} ·{" "}
                      {r.bookings} packages · net {money(r.netProfit)}
                    </summary>
                    <p>
                      {events.find((e) => e.id === r.eventId)?.name} ·{" "}
                      {
                        events.find((e) => e.id === r.eventId)?.options[
                          r.response
                        ].label
                      }
                    </p>
                    <Ledger result={r} />
                  </details>
                ))}
              </details>
            )}
            {view !== "results" && (
              <div className="ww-restart">
                {confirmReset ? (
                  <div role="alert">
                    <p>
                      Start again? This replaces your current journey. Your
                      personal best stays.
                    </p>
                    <button onClick={start}>Yes, start a new empire</button>
                    <button onClick={() => setConfirmReset(false)}>
                      Keep playing
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmReset(true)}>
                    <RotateCcw size={14} /> Restart journey
                  </button>
                )}
              </div>
            )}
          </div>
        )
      )}
      <footer className="ww-footer">
        <p>
          Inspired by the decisions behind international travel product
          development.
        </p>
        <p>
          Fictional strategy game. All money, fares, demand and scenarios are
          simulated; no bookings or financial advice.
        </p>
        <Link href="/about" className="text-link">
          A game by Shaun Denver Mathiasz ↗
        </Link>
      </footer>
    </div>
  );
}
