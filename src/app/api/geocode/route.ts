import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Missing postcode parameter securely' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.error("CRITICAL: GOOGLE_MAPS_API_KEY is missing from .env.local restricting geocode bounds entirely!");
    return NextResponse.json({ error: 'Server configuration error globally' }, { status: 500 });
  }

  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q + ", UK")}&key=${apiKey}`);
    const data = await res.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return NextResponse.json({ lat: location.lat, lng: location.lng });
    } else {
      return NextResponse.json({ error: 'Valid boundary not discovered matching queries' }, { status: 404 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
