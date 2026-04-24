import { NextResponse } from "next/server";
import { getNearestStops } from "@/lib/tfl";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });
  }

  const radius = Number(searchParams.get("radius") ?? 500);
  const modesParam = searchParams.get("modes");
  const modes = modesParam ? modesParam.split(",") : undefined;

  try {
    const stops = await getNearestStops(Number(lat), Number(lon), radius, modes);
    // Remap stopId → id so all existing hooks and components stay compatible.
    const stations = stops.slice(0, 2).map(s => ({
      id: s.stopId,
      name: s.name,
      modes: s.modes,
      lines: s.lines,
      distance: s.distance,
    }));
    return NextResponse.json({ stations });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("TfL stations error:", message);
    return NextResponse.json({ error: "Failed to fetch transport data" }, { status: 500 });
  }
}
