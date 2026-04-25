import { NextRequest, NextResponse } from "next/server";

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

/**
 * GET /api/places/photo?ref=PHOTO_REF&maxwidth=400
 *
 * Server-side proxy for Google Places photos.
 * Hides the API key from the client — the photo reference is public
 * but the key is never exposed.
 */
export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref");
  const maxwidth = req.nextUrl.searchParams.get("maxwidth") || "400";

  if (!ref) {
    return NextResponse.json(
      { error: "ref query parameter is required" },
      { status: 400 }
    );
  }

  if (!GOOGLE_PLACES_API_KEY) {
    return NextResponse.json(
      { error: "Places API key not configured" },
      { status: 500 }
    );
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/photo");
  url.searchParams.set("photoreference", ref);
  url.searchParams.set("maxwidth", maxwidth);
  url.searchParams.set("key", GOOGLE_PLACES_API_KEY);

  try {
    const upstream = await fetch(url.toString(), { redirect: "follow" });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${upstream.status}` },
        { status: 502 }
      );
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    const body = await upstream.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
        "CDN-Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("Places photo proxy error:", err);
    return NextResponse.json(
      { error: "Failed to fetch photo from Google Places" },
      { status: 502 }
    );
  }
}
