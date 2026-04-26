"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ExternalLink, BookOpen, Clock, AlertCircle } from "lucide-react";
import {
  FREE_SECTIONS,
  isOpenNow,
  isOpenNowFromPlacesText,
} from "@/data/freeLondon";
import type { FreeEntry, FreeSection } from "@/data/freeLondon";
import { SpotCard } from "@/components/features/SpotCard";
import type { Spot } from "@/types";

// ── Open-now toggle ───────────────────────────────────────────────────────────

function OpenNowToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`flex items-center gap-2.5 px-4 py-2 rounded-full border text-[13px] font-semibold transition-colors ${
        value
          ? "bg-[#1c1c1c] text-[#fcfbf8] border-[#1c1c1c]"
          : "bg-[#fcfbf8] text-[#1c1c1c] border-passive hover:border-[#1c1c1c]/30"
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${value ? "bg-green-400" : "bg-[#5f5f5d]"}`}
      />
      Open now
    </button>
  );
}

// ── Status badge shown on entry cards ────────────────────────────────────────

function StatusBadge({ open }: { open: boolean | null }) {
  if (open === null) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
        open
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-700"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${open ? "bg-green-500" : "bg-red-500"}`} />
      {open ? "Open now" : "Closed now"}
    </span>
  );
}

// ── Single editorial entry card ───────────────────────────────────────────────

function EntryCard({ entry, showStatus }: { entry: FreeEntry; showStatus: boolean }) {
  const open = useMemo(() => {
    if (!showStatus) return null;
    return isOpenNow(entry.hours);
  }, [entry.hours, showStatus]);

  return (
    <div className="flex flex-col gap-3 py-4 border-b border-passive last:border-0 last:pb-0 first:pt-0">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] font-semibold text-[#1c1c1c]">{entry.name}</span>
            {entry.bookingRequired && (
              <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Booking required
              </span>
            )}
            {showStatus && <StatusBadge open={open} />}
          </div>
          {entry.address && (
            <span className="text-[12px] text-[#5f5f5d]">{entry.address}</span>
          )}
        </div>
        <a
          href={entry.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1 text-[12px] font-medium text-[#5f5f5d] hover:text-[#1c1c1c] transition-colors mt-0.5"
        >
          <ExternalLink className="w-3 h-3" />
          Visit
        </a>
      </div>

      <p className="text-[13px] text-[#5f5f5d] leading-relaxed">{entry.description}</p>

      {entry.hours.note && (
        <p className="flex items-start gap-1.5 text-[12px] text-[#5f5f5d]">
          <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          {entry.hours.note}
        </p>
      )}
    </div>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────

function SectionCard({
  section,
  openNow,
}: {
  section: FreeSection;
  openNow: boolean;
}) {
  const visibleEntries = useMemo(() => {
    if (!openNow) return section.entries;
    return section.entries.filter((e) => isOpenNow(e.hours));
  }, [section.entries, openNow]);

  if (openNow && visibleEntries.length === 0) return null;

  return (
    <article id={section.id} className="bg-[#fcfbf8] border border-passive rounded-2xl overflow-hidden scroll-mt-24">
      <div className="px-6 pt-6 pb-4 border-b border-passive">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="text-[22px] leading-none">{section.icon}</span>
          <h2 className="text-[18px] font-semibold text-[#1c1c1c]">{section.title}</h2>
        </div>
        <p className="text-[13px] text-[#5f5f5d] leading-relaxed">{section.intro}</p>
      </div>
      <div className="px-6 py-2">
        {visibleEntries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} showStatus={openNow} />
        ))}
      </div>
    </article>
  );
}

// ── Community spots from Firestore ───────────────────────────────────────────

function CommunitySpots({
  spots,
  openNow,
  citySlug,
}: {
  spots: Spot[];
  openNow: boolean;
  citySlug: string;
}) {
  const filtered = useMemo(() => {
    if (!openNow) return spots;
    return spots.filter((s) => {
      if (!s.openingHoursText?.length) return true; // no hours data — always show
      const open = isOpenNowFromPlacesText(s.openingHoursText);
      return open !== false; // show if open or unknown
    });
  }, [spots, openNow]);

  const withHours = filtered.filter((s) => s.openingHoursText?.length);
  const withoutHours = filtered.filter((s) => !s.openingHoursText?.length);

  if (spots.length === 0) return null;

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="t-h3 font-semibold text-[#1c1c1c]">
          Community Spots{" "}
          <span className="text-[#5f5f5d] font-normal text-[16px]">({filtered.length})</span>
        </h2>
        <p className="text-[13px] text-[#5f5f5d]">
          Free spots added by the BudgetUK community.
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="text-[14px] text-[#5f5f5d] py-6">No community spots open right now.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {withHours.map((spot) => (
            <SpotWithStatus key={spot.id} spot={spot} showStatus={openNow} citySlug={citySlug} />
          ))}
          {withoutHours.map((spot) => (
            <SpotWithStatus key={spot.id} spot={spot} showStatus={openNow} citySlug={citySlug} />
          ))}
        </div>
      )}

      {openNow && withoutHours.length > 0 && (
        <p className="flex items-center gap-2 text-[12px] text-[#5f5f5d]">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {withoutHours.length} spot{withoutHours.length !== 1 ? "s" : ""} shown without
          confirmed hours — verify before visiting.
        </p>
      )}
    </section>
  );
}

function SpotWithStatus({ spot, showStatus, citySlug }: { spot: Spot; showStatus: boolean; citySlug: string }) {
  const open = useMemo(() => {
    if (!showStatus || !spot.openingHoursText?.length) return null;
    return isOpenNowFromPlacesText(spot.openingHoursText);
  }, [spot.openingHoursText, showStatus]);

  return (
    <div className="relative">
      <Link
        href={`/${citySlug}/${encodeURIComponent(spot.neighbourhood.toLowerCase().replace(/\s+/g, "-"))}/${spot.slug}`}
        className="block"
      >
        <SpotCard spot={spot} showDistance={false} />
      </Link>
      {showStatus && open !== null && (
        <div className="absolute top-2 right-2">
          <StatusBadge open={open} />
        </div>
      )}
    </div>
  );
}

// ── Quick-jump nav ────────────────────────────────────────────────────────────

function SectionNav() {
  return (
    <nav aria-label="Jump to section" className="flex flex-wrap gap-2">
      {FREE_SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border border-passive bg-[#fcfbf8] text-[#1c1c1c] hover:border-[#1c1c1c]/30 hover:bg-[#f7f4ed] transition-colors"
        >
          <span>{s.icon}</span>
          {s.title}
        </a>
      ))}
    </nav>
  );
}

// ── Root client component ─────────────────────────────────────────────────────

export function FreePageClient({ spots, citySlug }: { spots: Spot[]; citySlug: string }) {
  const [openNow, setOpenNow] = useState(false);
  const cityName = citySlug.charAt(0).toUpperCase() + citySlug.slice(1);

  return (
    <div className="min-h-screen bg-[#f7f4ed]">
      <main className="max-w-3xl mx-auto px-4 py-16 md:py-24 mt-4 flex flex-col gap-12">

        {/* Hero */}
        <header className="flex flex-col gap-5">
          <h1 className="t-h1 text-[#1c1c1c] tracking-tighter leading-tight">
            Free in {cityName}
          </h1>
          <p className="t-body-lg text-[#5f5f5d] max-w-xl leading-relaxed">
            Museums, parks, markets, concerts, and walks that cost nothing. {cityName} has world-class culture — most visitors don&apos;t realise how much is free.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <OpenNowToggle value={openNow} onChange={setOpenNow} />
            <SectionNav />
          </div>
        </header>

        {/* Editorial sections (only for London for now) */}
        {citySlug === "london" && FREE_SECTIONS.map((section) => (
          <SectionCard key={section.id} section={section} openNow={openNow} />
        ))}

        {/* Community spots */}
        <CommunitySpots spots={spots} openNow={openNow} citySlug={citySlug} />

        {/* Footer note */}
        <footer className="border-t border-passive pt-8">
          <p className="flex items-start gap-2 text-[13px] text-[#5f5f5d] leading-relaxed">
            <BookOpen className="w-4 h-4 mt-0.5 shrink-0" />
            Opening hours are checked at page load. Always verify directly with the venue before making a special trip.
            Know a free spot we&apos;ve missed?{" "}
            <Link
              href={`/${citySlug}/community/add`}
              className="underline underline-offset-4 hover:text-[#1c1c1c] transition-colors"
            >
              Submit it
            </Link>
            .
          </p>
        </footer>

      </main>
    </div>
  );
}
