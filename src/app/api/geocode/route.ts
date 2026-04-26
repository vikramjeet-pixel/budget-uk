import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Missing postcode parameter' }, { status: 400 });
  }

  // 1. Try Postcodes.io first for UK postcodes (it's free and very reliable for UK)
  try {
    const pcClean = q.replace(/\s/g, '').toUpperCase();
    const pcRes = await fetch(`https://api.postcodes.io/postcodes/${pcClean}`);
    const pcData = await pcRes.json();

    if (pcData.status === 200 && pcData.result) {
      return NextResponse.json({ 
        lat: pcData.result.latitude, 
        lng: pcData.result.longitude,
        source: 'postcodes.io'
      });
    }
  } catch (pcErr) {
    console.error("Postcodes.io failed, falling back to Google:", pcErr);
  }

  // 2. Fallback to Google Maps if Postcodes.io fails or it's not a standard postcode
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
  }

  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q + ", London, UK")}&key=${apiKey}`);
    const data = await res.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return NextResponse.json({ lat: location.lat, lng: location.lng, source: 'google' });
    } else {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
