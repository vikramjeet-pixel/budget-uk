import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing station ID" }, { status: 400 });
  }

  try {
    const tflUrl = `https://api.tfl.gov.uk/StopPoint/${id}/Arrivals`;

    const response = await fetch(tflUrl, {
      next: { revalidate: 30 } // Cache for 30 seconds (real-time data)
    });

    if (!response.ok) {
      throw new Error(`TfL API responded with ${response.status}`);
    }

    const data = await response.json();

    // Transform and clean
    const arrivals = data
      .map((item: any) => ({
        lineName: item.lineName,
        destinationName: item.destinationName,
        timeToStation: Math.floor(item.timeToStation / 60), // Convert to minutes
      }))
      // Sort by time ascending
      .sort((a: any, b: any) => a.timeToStation - b.timeToStation)
      // Limit to 5
      .slice(0, 5);

    return NextResponse.json({ arrivals });
  } catch (error: any) {
    console.error("TfL Arrivals Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch arrivals", details: error.message },
      { status: 500 }
    );
  }
}
