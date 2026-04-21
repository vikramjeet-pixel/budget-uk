import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });
  }

  try {
    const modes = "tube,dlr,overground,elizabeth-line";
    const stopTypes = "NaptanMetroStation,NaptanRailStation";
    const radius = 1000; // 1km

    // Using unauthenticated public endpoint. 
    // Credentials (app_id/app_key) can be appended if available in env.
    const tflUrl = `https://api.tfl.gov.uk/StopPoint?lat=${lat}&lon=${lon}&stopTypes=${stopTypes}&modes=${modes}&radius=${radius}`;

    const response = await fetch(tflUrl, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`TfL API responded with ${response.status}`);
    }

    const data = await response.json();
    
    // The API returns { stopPoints: [...] } for lat/lon queries
    const stopPoints = data.stopPoints || [];

    // Map and clean the data
    const stations = stopPoints
      .map((point: any) => ({
        id: point.id,
        name: point.commonName.replace("Underground Station", "").replace("Station", "").trim(),
        modes: point.modes,
        distance: Math.round(point.distance),
      }))
      // Sort by distance and take top 2
      .sort((a: any, b: any) => a.distance - b.distance)
      .slice(0, 2);

    return NextResponse.json({ stations });
  } catch (error: any) {
    console.error("TfL Integration Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transport data", details: error.message },
      { status: 500 }
    );
  }
}
