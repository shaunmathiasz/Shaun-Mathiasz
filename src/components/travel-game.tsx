"use client";
import { LinkArrow } from "@/components/link-arrow";

import { useEffect, useRef, useState } from "react";
const destinations = ["Colombo", "Malé", "London", "Tokyo", "Rome", "Paris"];
type Card = { id: number; city: string };
export function TravelGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [turned, setTurned] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [status, setStatus] = useState("");
  const startButton = useRef<HTMLButtonElement>(null);
  const complete = matched.length === destinations.length;
  useEffect(() => {
    if (turned.length !== 2) return;
    const timer = setTimeout(() => setTurned([]), 850);
    return () => clearTimeout(timer);
  }, [turned]);
  function start() {
    const next = [...destinations, ...destinations].map((city, id) => ({
      city,
      id,
    }));
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    setCards(next);
    setTurned([]);
    setMatched([]);
    setMoves(0);
    setStatus("Find six matching destination pairs. Take your time.");
  }
  function turn(card: Card) {
    if (
      turned.length === 2 ||
      turned.includes(card.id) ||
      matched.includes(card.city)
    )
      return;
    const next = [...turned, card.id];
    setTurned(next);
    if (next.length === 2) {
      setMoves((v) => v + 1);
      if (cards.find((c) => c.id === next[0])?.city === card.city) {
        setMatched((v) => [...v, card.city]);
        setStatus(
          matched.length === 5
            ? "All six destinations connected. Every great journey begins with curiosity."
            : `${card.city} connected. ${matched.length + 1} of six pairs found.`,
        );
      } else
        setStatus(
          "Different destinations. Remember their positions and try another pair.",
        );
    }
  }
  return (
    <section
      className="section travel-game"
      id="travel-detour"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setCards([]);
          setTurned([]);
          startButton.current?.focus();
        }
      }}
    >
      <div className="section-title">
        <div>
          <p className="eyebrow">OFF THE ITINERARY</p>
          <h2>A little curiosity goes a long way.</h2>
        </div>
        <span className="status">A two-minute detour</span>
      </div>
      <p>
        Six destinations. Twelve cards. Match the pairs and connect your own
        little world. Just for the pleasure of exploring.
      </p>
      <div className="game-actions">
        <button
          ref={startButton}
          className="button outline-button"
          onClick={start}
        >
          {cards.length ? "New journey ↻" : <>Play destination pairs <LinkArrow /></>}
        </button>
        {cards.length > 0 && (
          <>
            <span>
              {matched.length}/6 pairs · {moves} moves
            </span>
            <button
              className="text-link"
              onClick={() => {
                setCards([]);
                setTurned([]);
                startButton.current?.focus();
              }}
            >
              Close game ×
            </button>
          </>
        )}
      </div>
      {cards.length > 0 && (
        <>
          <div
            className="destination-grid"
            role="group"
            aria-label="Destination pairs memory game"
          >
            {cards.map((card, i) => {
              const known = matched.includes(card.city);
              const face = known || turned.includes(card.id);
              return (
                <button
                  key={card.id}
                  className={`destination-card ${face ? "face-up" : ""} ${known ? "pair-found" : ""}`}
                  aria-label={
                    face
                      ? `${known ? "CONNECTED" : "DESTINATION"} ${card.city} ${known ? "✓, matched" : "Remember this stop"}`
                      : `BOARDING / ${String(i + 1).padStart(2, "0")} ✧ Reveal destination — Card ${i + 1}, face down`
                  }
                  aria-disabled={known || turned.length === 2}
                  onClick={() => turn(card)}
                >
                  <span className="eyebrow">
                    {known
                      ? "CONNECTED"
                      : face
                        ? "DESTINATION"
                        : `BOARDING / ${String(i + 1).padStart(2, "0")}`}
                  </span>
                  <strong>{face ? card.city : "✧"}</strong>
                  <span>
                    {known
                      ? "✓"
                      : face
                        ? "Remember this stop"
                        : "Reveal destination"}
                  </span>
                </button>
              );
            })}
          </div>
          <p
            role="status"
            className={complete ? "game-message complete" : "game-message"}
          >
            {status}
          </p>
          <p className="micro-copy">
            Use Tab and Enter or tap a card. Escape closes the game. No timer,
            sign-in or score tracking.
          </p>
        </>
      )}
    </section>
  );
}
