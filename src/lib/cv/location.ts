/** Build a map link only from valid, consented browser coordinates. */
export function browserLocationMap(location: unknown, permission: unknown) {
  if (permission !== "granted" || !location || typeof location !== "object")
    return null;
  const { latitude, longitude, accuracy } = location as Record<string, unknown>;
  if (
    typeof latitude !== "number" || !Number.isFinite(latitude) ||
    latitude < -90 || latitude > 90 ||
    typeof longitude !== "number" || !Number.isFinite(longitude) ||
    longitude < -180 || longitude > 180
  ) return null;
  const url = new URL("https://www.google.com/maps/search/");
  url.searchParams.set("api", "1");
  url.searchParams.set("query", `${latitude},${longitude}`);
  return {
    url: url.toString(),
    latitude,
    longitude,
    accuracy: typeof accuracy === "number" && Number.isFinite(accuracy) && accuracy >= 0
      ? accuracy : null,
  };
}
