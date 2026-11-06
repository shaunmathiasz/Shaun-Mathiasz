"use client";
import land from "@/content/land.json";
import { destinations, type DestinationId } from "@/content/worldwide";
const mapPath = land
  .map((r) =>
    r
      .map(
        ([x, y], i) =>
          `${i ? "L" : "M"}${(((x + 180) / 360) * 1000).toFixed(1)},${(((90 - y) / 180) * 500).toFixed(1)}`,
      )
      .join(" "),
  )
  .join(" ");
export function DestinationMap({
  selected,
  onSelect,
}: {
  selected: DestinationId;
  onSelect: (id: DestinationId) => void;
}) {
  return (
    <div className="ww-map" role="group" aria-label="Destination map">
      <svg viewBox="0 0 1000 500" aria-hidden="true">
        <path d={mapPath} fill="none" stroke="currentColor" strokeWidth="1.4" />
        {destinations.map((d) => (
          <circle
            key={d.id}
            cx={((d.lon + 180) / 360) * 1000}
            cy={((90 - d.lat) / 180) * 500}
            r={d.id === selected ? 4 : 3}
            fill={d.id === selected ? "#f2d6a6" : "#75b9d0"}
          />
        ))}
        {destinations
          .filter((d) => d.id !== selected)
          .map((d) => {
            const a = destinations.find((v) => v.id === selected)!;
            return (
              <path
                key={d.id}
                d={`M${((a.lon + 180) / 360) * 1000},${((90 - a.lat) / 180) * 500} Q500,20 ${((d.lon + 180) / 360) * 1000},${((90 - d.lat) / 180) * 500}`}
                fill="none"
                className="ww-map-route"
              />
            );
          })}
      </svg>
      {destinations.map((d) => (
        <button
          key={d.id}
          style={{
            left: `${((d.lon + 180) / 360) * 100}%`,
            top: `${((90 - d.lat) / 180) * 100}%`,
          }}
          data-destination={d.id}
          aria-pressed={d.id === selected}
          aria-label={`Select ${d.name} on map — ${d.code}`}
          onClick={() => onSelect(d.id)}
        >
          {d.code}
        </button>
      ))}
    </div>
  );
}
