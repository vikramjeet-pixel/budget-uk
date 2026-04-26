import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCityBySlug } from "@/data/cities";
import { ComingSoon } from "@/components/features/ComingSoon";
import { CityMapContent } from "@/components/features/CityMapContent";
import { SpotCardSkeleton } from "@/components/ui/Skeleton";

interface PageProps {
  params: Promise<{ city: string }>;
}

export default async function HomePage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);

  if (!city) {
    notFound();
  }

  if (city.comingSoon) {
    return <ComingSoon cityName={city.name} citySlug={city.slug} />;
  }

  return (
    <Suspense fallback={
      <div className="flex flex-col md:flex-row min-h-screen bg-[#fcfbf8]">
        <div className="h-[60vh] w-full md:h-screen md:w-[60%] shimmer" />
        <div className="flex flex-col gap-4 px-4 pt-4 md:w-[40%]">
          {[0, 1, 2, 3, 4].map((i) => <SpotCardSkeleton key={i} />)}
        </div>
      </div>
    }>
      <CityMapContent city={city} />
    </Suspense>
  );
}
