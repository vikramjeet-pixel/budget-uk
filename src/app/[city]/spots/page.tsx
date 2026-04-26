import { Suspense } from "react";
import { SpotsGridContent } from "@/components/features/SpotsGridContent";

interface PageProps {
  params: Promise<{ city: string }>;
}

export default async function SpotsPage({ params }: PageProps) {
  const { city } = await params;
  
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-passive border-t-[#1c1c1c] rounded-full animate-spin" />
      </div>
    }>
      <SpotsGridContent citySlug={city} />
    </Suspense>
  );
}
