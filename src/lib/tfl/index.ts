// TfL Unified API — server-only, imported only from /api/tfl/* routes.
// Free tier: ~50 req/min unauthenticated.
// Set TFL_APP_KEY env var to raise the limit to 500 req/min.

export interface TflStop {
  stopId: string;
  name: string;
  modes: string[];
  lines: { id: string; name: string }[];
  distance: number; // metres
}

export interface TflArrival {
  lineName: string;
  destinationName: string;
  timeToStation: number; // seconds (raw from TfL)
  modeName: string;
}

// --- In-memory stop cache (24 h expiry) -----------------------------------
// Lives at module scope so it persists across requests in the same server
// process. Safe for a single-origin deployment; not shared across instances.

interface CacheEntry {
  data: TflStop[];
  expiresAt: number;
}

const stopsCache = new Map<string, CacheEntry>();
const STOPS_TTL = 24 * 60 * 60 * 1000; // 24 h in ms

// --- URL builder ------------------------------------------------------------

function tflUrl(path: string, params: Record<string, string> = {}): string {
  const url = new URL(`https://api.tfl.gov.uk${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  if (process.env.TFL_APP_KEY) url.searchParams.set("app_key", process.env.TFL_APP_KEY);
  return url.toString();
}

// --- Public functions -------------------------------------------------------

const DEFAULT_MODES = ["tube", "bus", "overground", "elizabeth-line", "dlr"];

// Stop types that cover all DEFAULT_MODES:
//   NaptanMetroStation   → tube, DLR, Overground, Elizabeth line
//   NaptanRailStation    → National Rail interchange stops
//   NaptanPublicBusCoachTram → bus
const STOP_TYPES = "NaptanMetroStation,NaptanRailStation,NaptanPublicBusCoachTram";

export async function getNearestStops(
  lat: number,
  lng: number,
  radius = 500,
  modes = DEFAULT_MODES
): Promise<TflStop[]> {
  const cacheKey = `${lat.toFixed(5)},${lng.toFixed(5)},${radius},${modes.join(",")}`;

  const hit = stopsCache.get(cacheKey);
  if (hit && hit.expiresAt > Date.now()) return hit.data;

  const url = tflUrl("/StopPoint", {
    lat: String(lat),
    lon: String(lng),
    stopTypes: STOP_TYPES,
    modes: modes.join(","),
    radius: String(radius),
  });

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`TfL StopPoint ${res.status}`);

  const raw = await res.json();
  const stops: TflStop[] = (raw.stopPoints ?? [])
    .map((p: Record<string, unknown>) => ({
      stopId: p.id as string,
      name: (p.commonName as string)
        .replace("Underground Station", "")
        .replace("Station", "")
        .trim(),
      modes: p.modes as string[],
      lines: ((p.lines ?? []) as { id: string; name: string }[]),
      distance: Math.round(p.distance as number),
    }))
    .sort((a: TflStop, b: TflStop) => a.distance - b.distance);

  stopsCache.set(cacheKey, { data: stops, expiresAt: Date.now() + STOPS_TTL });
  return stops;
}

export async function getArrivalsAtStop(stopId: string): Promise<TflArrival[]> {
  // Arrivals are never cached — data must be live.
  const url = tflUrl(`/StopPoint/${stopId}/Arrivals`);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`TfL Arrivals ${res.status}`);

  const raw: Record<string, unknown>[] = await res.json();
  return raw
    .map(item => ({
      lineName: item.lineName as string,
      destinationName: item.destinationName as string,
      timeToStation: item.timeToStation as number, // seconds
      modeName: item.modeName as string,
    }))
    .sort((a, b) => a.timeToStation - b.timeToStation);
}
