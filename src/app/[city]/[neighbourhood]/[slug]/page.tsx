import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import { Spot } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import { SpotCard } from "@/components/features/SpotCard";
import { MapPin, Bookmark, ExternalLink } from "lucide-react";
import { TransportInfo } from "@/components/features/TransportInfo";
import * as geofire from "geofire-common";

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
  const matchingDocs: any[] = [];

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
        matchingDocs.push({
          id: doc.id,
          distance: distanceInM,
          ...data,
        });
      }
    }
  }

  // De-duplicate and sort
  const unique = Array.from(new Map(matchingDocs.map((item) => [item.id, item])).values());
  return unique.sort((a, b) => a.distance - b.distance).slice(0, limit) as Spot[];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const spot = await getSpotBySlug(slug);

  if (!spot) {
    return {
      title: "Spot Not Found | BudgetUK",
    };
  }

  const title = `${spot.name} ${spot.neighbourhood} — ${spot.category.charAt(0).toUpperCase() + spot.category.slice(1)} in ${spot.postcodeDistrict} | BudgetUK`;
  
  return {
    title,
    description: spot.description,
    openGraph: {
      title,
      description: spot.description,
      images: spot.photoUrl ? [{ url: spot.photoUrl }] : [],
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

  return (
    <div className="min-h-screen bg-[#fcfbf8] pb-20">
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Main Content (2/3) */}
          <div className="flex-grow lg:w-2/3 flex flex-col gap-8">
            
            {/* Hero Image */}
            <div className="w-full aspect-video rounded-[12px] border border-[var(--border-passive)] overflow-hidden bg-[var(--border-passive)] relative shadow-sm">
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
              <hr className="border-[var(--border-passive)]" />
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
              <div className="bg-[#f7f4ed] p-6 rounded-xl border border-[var(--border-passive)] shadow-[var(--inset-dark)]">
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
                  <Button variant="primary" className="w-full justify-center py-6 h-auto text-lg cursor-not-allowed opacity-70">
                    <Bookmark className="w-5 h-5 mr-3" />
                    Save this spot
                  </Button>
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
