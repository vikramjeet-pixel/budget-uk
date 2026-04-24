"use client";

import React from "react";
import Link from "next/link";
import { DIET_TABS } from "@/data/diet";
import type { DietTab } from "@/data/diet";
import { SpotCard } from "@/components/features/SpotCard";
import type { Spot } from "@/types";

// ── Tab nav ───────────────────────────────────────────────────────────────────

function TabNav({ activeId }: { activeId: string }) {
  return (
    <nav aria-label="Filter by diet" className="flex gap-2 flex-wrap">
      {DIET_TABS.map((t) => {
        const isActive = t.id === activeId;
        return (
          <Link
            key={t.id}
            href={`?tab=${t.id}`}
            scroll={false}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold border transition-colors ${
              isActive
                ? "bg-[#1c1c1c] text-[#fcfbf8] border-[#1c1c1c]"
                : "bg-[#fcfbf8] text-[#1c1c1c] border-passive hover:border-[#1c1c1c]/30 hover:bg-[#f7f4ed]"
            }`}
          >
            <span>{t.emoji}</span>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

// ── Spots grid ────────────────────────────────────────────────────────────────

function SpotsGrid({ spots, activeTab }: { spots: Spot[]; activeTab: DietTab }) {
  if (spots.length === 0) {
    return (
      <div className="bg-[#fcfbf8] border border-passive rounded-2xl px-6 py-12 text-center">
        <p className="text-[15px] text-[#5f5f5d]">
          No {activeTab.label.toLowerCase()} spots yet.{" "}
          <Link href="/community/add" className="underline underline-offset-4 hover:text-[#1c1c1c] transition-colors">
            Add one
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {spots.map((spot) => (
        <Link
          key={spot.id}
          href={`/london/${encodeURIComponent(spot.neighbourhood.toLowerCase())}/${spot.slug}`}
          className="block"
        >
          <SpotCard spot={spot} showDistance={false} />
        </Link>
      ))}
    </div>
  );
}

// ── Root client component ─────────────────────────────────────────────────────

export function DietPageClient({
  activeTab,
  spots,
}: {
  activeTab: DietTab;
  spots: Spot[];
}) {
  return (
    <div className="min-h-screen bg-[#f7f4ed]">
      <main className="max-w-3xl mx-auto px-4 py-16 md:py-24 mt-4 flex flex-col gap-10">

        {/* Hero */}
        <header className="flex flex-col gap-5">
          <h1 className="t-h1 text-[#1c1c1c] tracking-tighter leading-tight">
            {activeTab.emoji} {activeTab.label} in London
          </h1>
          <p className="t-body-lg text-[#5f5f5d] max-w-xl leading-relaxed">
            {activeTab.intro}
          </p>
          <TabNav activeId={activeTab.id} />
        </header>

        {/* Spots */}
        <section className="flex flex-col gap-5">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-[16px] font-semibold text-[#1c1c1c]">
              Community spots
              <span className="text-[#5f5f5d] font-normal ml-2 text-[14px]">
                ({spots.length})
              </span>
            </h2>
            <Link
              href="/community/add"
              className="text-[12px] text-[#5f5f5d] hover:text-[#1c1c1c] underline underline-offset-4 transition-colors"
            >
              Add a spot
            </Link>
          </div>

          <SpotsGrid spots={spots} activeTab={activeTab} />
        </section>

        {/* Footer */}
        <footer className="border-t border-passive pt-8">
          <p className="text-[13px] text-[#5f5f5d] leading-relaxed">
            Spots are community-submitted and voted on. Always verify dietary requirements directly with the venue before visiting.{" "}
            <Link
              href="/community/add"
              className="underline underline-offset-4 hover:text-[#1c1c1c] transition-colors"
            >
              Know a spot we've missed? Add it.
            </Link>
          </p>
        </footer>

      </main>
    </div>
  );
}
