"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { FavouritesTab } from "@/components/features/FavouritesTab";
import { SpotCardSkeleton } from "@/components/ui/Skeleton";

export default function FavouritesPage() {
  const router = useRouter();
  const { user, loading } = useAuthContext();

  React.useEffect(() => {
    if (!loading && !user) router.push("/login?redirect=/account/favourites");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12">
        <div className="h-9 w-40 shimmer rounded mb-8" aria-hidden="true" />
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((i) => <SpotCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/account" className="text-[14px] text-[#5f5f5d] hover:text-[#1c1c1c] transition-colors">
          Account
        </Link>
        <span className="text-[#5f5f5d]">/</span>
        <h1 className="t-h2 text-[#1c1c1c]">Saved spots</h1>
      </div>
      <FavouritesTab />
    </div>
  );
}
