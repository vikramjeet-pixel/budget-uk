import { NextResponse } from "next/server";

export async function GET() {
  try {
    const modes = "tube,dlr,overground,elizabeth-line";
    const tflUrl = `https://api.tfl.gov.uk/Line/Mode/${modes}/Status`;

    const response = await fetch(tflUrl, {
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`TfL API responded with ${response.status}`);
    }

    const data = await response.json();

    // Filter for non-"Good Service" statuses
    const disruptions = data
      .filter((line: any) => 
        line.lineStatuses.some((status: any) => status.statusSeverityDescription !== "Good Service")
      )
      .map((line: any) => ({
        id: line.id,
        name: line.name,
        status: line.lineStatuses[0].statusSeverityDescription,
        reason: line.lineStatuses[0].reason || ""
      }));

    return NextResponse.json({ disruptions });
  } catch (error: any) {
    console.error("TfL Status Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch network status", details: error.message },
      { status: 500 }
    );
  }
}
