import { NextResponse } from "next/server";
import { getArrivalsAtStop } from "@/lib/tfl";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing station ID" }, { status: 400 });
  }

  try {
    const raw = await getArrivalsAtStop(id);
    // Convert seconds → minutes for the client; keep top 5.
    const arrivals = raw.slice(0, 5).map(a => ({
      ...a,
      timeToStation: Math.floor(a.timeToStation / 60),
    }));
    return NextResponse.json({ arrivals });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("TfL arrivals error:", message);
    return NextResponse.json({ error: "Failed to fetch arrivals" }, { status: 500 });
  }
}
