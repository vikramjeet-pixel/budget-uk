import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import { Spot } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import { SpotCard } from "@/components/features/SpotCard";
import { MapPin } from "lucide-react";
import { TransportInfo } from "@/components/features/TransportInfo";
import { NearestStation } from "@/components/features/NearestStation";
import { SaveSpotButton } from "@/components/features/SaveSpotButton";
import * as geofire from "geofire-common";

// Pre-build top 50 spots; all other slugs render on-demand and are cached for 1 hour.
export const revalidate = 3600;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{
    city: string;
    neighbourhood: string;
    slug: string;
  }>;
}

// Fetch spot by slug server-side
async function getSpotBySlug(slug: string): Promise<Spot | null> {
  const snapshot = await adminDb
    .collection("spots")
    .where("slug", "==", slug)
    .where("status", "==", "live")
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Spot;
}

// Fetch nearby spots server-side
async function getNearbySpots(spot: Spot, limit = 4): Promise<Spot[]> {
  const center: [number, number] = [spot.location.latitude, spot.location.longitude];
  const radiusInM = 2000; // Expanded to 2km for better sidebar variety
  const bounds = geofire.geohashQueryBounds(center, radiusInM);
  const promises = [];

  for (const b of bounds) {
    const q = adminDb
      .collection("spots")
      .orderBy("geohash")
      .startAt(b[0])
      .endAt(b[1]);
    promises.push(q.get());
  }

  const snapshots = await Promise.all(promises);
  const matchingDocs: (Spot & { distance: number })[] = [];

  for (const snap of snapshots) {
    for (const doc of snap.docs) {
      const data = doc.data();
      if (doc.id === spot.id || data.status !== "live") continue;

      const distanceInKm = geofire.distanceBetween(
        [data.location.latitude, data.location.longitude],
        center
      );
      const distanceInM = distanceInKm * 1000;

      if (distanceInM <= radiusInM) {
        matchingDocs.push({ id: doc.id, distance: distanceInM, ...data } as Spot & { distance: number });
      }
    }
  }

  // De-duplicate and sort
  const unique = Array.from(new Map(matchingDocs.map((item) => [item.id, item])).values());
  return unique.sort((a, b) => a.distance - b.distance).slice(0, limit) as Spot[];
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://budgetuk.io";

const FOOD_CATEGORIES = new Set(["food", "coffee", "bars", "grocery"]);

function buildSpotUrl(spot: Spot): string {
  const neighbourhood = encodeURIComponent(spot.neighbourhood.toLowerCase().replace(/\s+/g, "-"));
  return `${BASE_URL}/${spot.city || "london"}/${neighbourhood}/${spot.slug}`;
}

function priceTierToRange(tier: string): string {
  switch (tier) {
    case "free": return "Free";
    case "£": return "£0–£5";
    case "££": return "£5–£15";
    case "£££": return "£15–£30";
    case "££££": return "£30+";
    default: return "";
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function buildJsonLd(spot: Spot): Record<string, any> {
  const isFood = FOOD_CATEGORIES.has(spot.category);
  const url = buildSpotUrl(spot);

  const ld: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": isFood ? "Restaurant" : "LocalBusiness",
    name: spot.name,
    url,
    description: spot.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: spot.neighbourhood,
      addressRegion: spot.borough,
      postalCode: spot.postcodeDistrict,
      addressCountry: "GB",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: spot.location.latitude,
      longitude: spot.location.longitude,
    },
    priceRange: priceTierToRange(spot.priceTier),
  };

  if (spot.photoUrl) {
    ld.image = spot.photoUrl;
  }

  // Aggregate rating from Google Places enrichment
  if (spot.placeData?.rating && spot.placeData?.userRatingsTotal) {
    ld.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: spot.placeData.rating,
      reviewCount: spot.placeData.userRatingsTotal,
      bestRating: 5,
    };
  }

  // Opening hours from Google Places
  if (spot.placeData?.openingHours && spot.placeData.openingHours.length > 0) {
    ld.openingHoursSpecification = spot.placeData.openingHours.map((text) => {
      // Parse "Monday: 10:00 AM – 5:30 PM" format
      const match = text.match(/^(\w+):\s*(.+)$/);
      if (!match) return { "@type": "OpeningHoursSpecification", description: text };

      const dayOfWeek = match[1];
      const timeRange = match[2].trim();
      const spec: Record<string, any> = {
        "@type": "OpeningHoursSpecification",
        dayOfWeek,
      };

      if (timeRange.toLowerCase() !== "closed") {
        const times = timeRange.split(/\s*[–-]\s*/);
        if (times.length === 2) {
          spec.opens = times[0].trim();
          spec.closes = times[1].trim();
        }
      }

      return spec;
    });
  }

  // Phone and website
  if (spot.placeData?.phone) ld.telephone = spot.placeData.phone;
  if (spot.placeData?.website) ld.sameAs = spot.placeData.website;

  if (isFood && spot.tags?.length) {
    ld.servesCuisine = spot.tags.filter(t =>
      ["halal", "vegetarian", "vegan", "kosher", "gluten-free"].includes(t)
    );
  }

  return ld;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const spot = await getSpotBySlug(slug);

  if (!spot) {
    return { title: "Spot Not Found" };
  }

  const title = `${spot.name} — ${spot.category.charAt(0).toUpperCase() + spot.category.slice(1)} in ${spot.neighbourhood}`;
  const description = spot.description.length > 160
    ? spot.description.slice(0, 157) + "…"
    : spot.description;
  const url = buildSpotUrl(spot);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images: spot.photoUrl ? [{ url: spot.photoUrl, alt: spot.name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: spot.photoUrl ? [spot.photoUrl] : [],
    },
  };
}

export async function generateStaticParams() {
  try {
    const snapshot = await adminDb
      .collection("spots")
      .where("status", "==", "live")
      .orderBy("voteCount", "desc")
      .limit(50)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        city: data.city || "london",
        neighbourhood: data.neighbourhood.toLowerCase().replace(/\s+/g, "-"),
        slug: data.slug,
      };
    });
  } catch (error) {
    console.error("Error in generateStaticParams:", error);
    return [];
  }
}

export default async function SpotPage({ params }: PageProps) {
  const { slug } = await params;
  const spot = await getSpotBySlug(slug);

  if (!spot) {
    notFound();
  }

  const nearbySpots = await getNearbySpots(spot);
  const jsonLd = buildJsonLd(spot);

  return (
    <div className="min-h-screen bg-[#fcfbf8] pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Main Content (2/3) */}
          <div className="flex-grow lg:w-2/3 flex flex-col gap-8">
            
            {/* Hero Image */}
            <div className="w-full aspect-video rounded-[12px] border border-passive overflow-hidden bg-passive relative shadow-sm">
              {spot.photoUrl ? (
                <Image 
                  src={spot.photoUrl} 
                  alt={spot.name} 
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                  className="object-cover" 
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#5f5f5d]">
                  No photo available
                </div>
              )}
            </div>

            {/* Title & Badges */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="t-h2 text-[#1c1c1c] tracking-tight">{spot.name}</h1>
                <div className="flex items-center flex-wrap gap-2">
                  <Badge variant="category">{spot.neighbourhood}</Badge>
                  <Badge variant="category">{spot.postcodeDistrict}</Badge>
                  <Badge variant={spot.priceTier === "free" ? "free" : "tier"}>
                    {spot.priceTier === "free" ? "Free" : spot.priceTier}
                  </Badge>
                </div>
              </div>
              <hr className="border-passive" />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-4">
              <h2 className="t-h3 font-semibold text-[#1c1c1c]">About</h2>
              <p className="t-body text-[var(--text-body)] leading-relaxed">
                {spot.description}
              </p>
            </div>

            {/* Local Tips */}
            {spot.tips && spot.tips.length > 0 && (
              <div className="bg-[#f7f4ed] p-6 rounded-xl border border-passive shadow-inset-dark">
                <h3 className="text-[18px] font-semibold text-[#1c1c1c] mb-4">Local Tips</h3>
                <ul className="space-y-3">
                  {spot.tips.map((tip, idx) => (
                    <li key={idx} className="flex gap-3 text-[15px] text-[#5f5f5d]">
                      <span className="text-[#1c1c1c] font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Real-time transport data */}
            <TransportInfo 
              latitude={spot.location.latitude} 
              longitude={spot.location.longitude} 
            />
          </div>

          {/* Sidebar (1/3) */}
          <aside className="lg:w-1/3 flex flex-col gap-8">
            
            {/* Sticky Interaction Card */}
            <div className="sticky top-24 flex flex-col gap-8">
              
              <Card className="p-6 flex flex-col gap-6 shadow-sm">
                <div className="flex flex-col gap-2">
                  <span className="t-caption text-[#5f5f5d] uppercase tracking-wider">Estimated Cost</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-[#1c1c1c]">
                      {spot.priceTier === "free" ? "Free" : spot.priceTier}
                    </span>
                    {spot.approxPriceGbp && (
                      <span className="text-[#5f5f5d] text-lg">~£{spot.approxPriceGbp}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <SaveSpotButton spotId={spot.id!} />
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${spot.location.latitude},${spot.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" className="w-full justify-center py-4 h-auto">
                      <MapPin className="w-4 h-4 mr-2" />
                      Get directions
                    </Button>
                  </a>
                </div>

                <div className="pt-2 text-center">
                  <span className="t-caption text-[#5f5f5d]">
                    Added {new Date(spot.createdAt.toDate()).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                  </span>
                </div>
              </Card>

              {/* Nearest station */}
              <div className="flex flex-col gap-3">
                <h3 className="t-h3 font-semibold text-[#1c1c1c] px-1">Getting here</h3>
                <NearestStation
                  latitude={spot.location.latitude}
                  longitude={spot.location.longitude}
                />
              </div>

              {/* Nearby Spots */}
              {nearbySpots.length > 0 && (
                <div className="flex flex-col gap-4">
                  <h3 className="t-h3 font-semibold text-[#1c1c1c] px-1">Nearby Budget Spots</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {nearbySpots.map((nearby) => (
                      <SpotCard 
                        key={nearby.id} 
                        spot={nearby} 
                        showDistance={true}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
