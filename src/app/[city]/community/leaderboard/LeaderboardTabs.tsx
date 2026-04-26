"use client";

import React from "react";
import Link from "next/link";
import * as Tabs from "@radix-ui/react-tabs";
import type { LeaderboardEntry } from "./page";

interface Props {
  allTime: LeaderboardEntry[];
  monthly: LeaderboardEntry[];
  monthLabel: string;
}

const MEDAL = ["🥇", "🥈", "🥉"];

function ReputationBadge({ rep }: { rep: number }) {
  let label: string;
  let cls: string;

  if (rep >= 500) {
    label = "Legend";
    cls = "bg-amber-100 text-amber-800";
  } else if (rep >= 200) {
    label = "Curator";
    cls = "bg-purple-100 text-purple-800";
  } else if (rep >= 50) {
    label = "Local";
    cls = "bg-green-100 text-green-800";
  } else if (rep >= 10) {
    label = "Regular";
    cls = "bg-blue-100 text-blue-800";
  } else {
    label = "Newcomer";
    cls = "bg-[var(--hover-tint)] text-[#1c1c1c]";
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${cls}`}>
      {label}
    </span>
  );
}

function EntryRow({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  return (
    <Link
      href={`/u/${entry.uid}`}
      className="flex items-center gap-3 sm:gap-4 py-3 px-3 sm:px-4 rounded-xl hover:bg-[#f7f4ed] transition-colors group"
    >
      {/* Rank */}
      <span className="w-8 text-center text-[14px] font-bold text-[#5f5f5d] shrink-0">
        {rank <= 3 ? MEDAL[rank - 1] : rank}
      </span>

      {/* Avatar */}
      <img
        src={
          entry.photoUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.displayName || "U")}&background=1c1c1c&color=fcfbf8`
        }
        alt={entry.displayName}
        className="w-9 h-9 rounded-full object-cover bg-passive border border-passive shrink-0"
      />

      {/* Name + badge */}
      <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
        <span className="text-[14px] font-semibold text-[#1c1c1c] group-hover:underline truncate">
          {entry.displayName}
        </span>
        <ReputationBadge rep={entry.reputation} />
      </div>

      {/* Rep */}
      <div className="text-right shrink-0 flex flex-col gap-0.5 w-12">
        <span className="text-[14px] font-bold text-[#1c1c1c]">{entry.reputation}</span>
        <span className="text-[11px] text-[#5f5f5d]">rep</span>
      </div>

      {/* Spot count */}
      <div className="text-right shrink-0 hidden sm:flex flex-col gap-0.5 w-12">
        <span className="text-[14px] font-bold text-[#1c1c1c]">{entry.liveCount}</span>
        <span className="text-[11px] text-[#5f5f5d]">spots</span>
      </div>
    </Link>
  );
}

function EntryList({ entries, emptyMessage }: { entries: LeaderboardEntry[]; emptyMessage: string }) {
  if (entries.length === 0) {
    return (
      <div className="py-24 text-center text-[#5f5f5d] text-[14px]">{emptyMessage}</div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Column headers */}
      <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 pb-2 border-b border-passive">
        <span className="w-8 shrink-0" />
        <span className="w-9 shrink-0" />
        <span className="flex-1 text-[11px] font-semibold text-[#5f5f5d] uppercase tracking-wider">Contributor</span>
        <span className="text-right text-[11px] font-semibold text-[#5f5f5d] uppercase tracking-wider w-12 shrink-0">Rep</span>
        <span className="text-right text-[11px] font-semibold text-[#5f5f5d] uppercase tracking-wider w-12 shrink-0 hidden sm:block">Spots</span>
      </div>
      <div className="flex flex-col divide-y divide-passive">
        {entries.map((entry, i) => (
          <EntryRow key={entry.uid} entry={entry} rank={i + 1} />
        ))}
      </div>
    </div>
  );
}

export function LeaderboardTabs({ allTime, monthly, monthLabel }: Props) {
  return (
    <Tabs.Root defaultValue="alltime">
      <Tabs.List className="flex border-b border-passive mb-8">
        {[
          { value: "alltime", label: "All Time" },
          { value: "monthly", label: monthLabel },
        ].map(({ value, label }) => (
          <Tabs.Trigger
            key={value}
            value={value}
            className="px-6 py-3 text-[14px] font-medium text-[#5f5f5d] data-[state=active]:text-[#1c1c1c] data-[state=active]:border-b-2 data-[state=active]:border-[#1c1c1c] transition-colors focus:outline-none"
          >
            {label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <Tabs.Content value="alltime" className="focus:outline-none">
        <EntryList
          entries={allTime}
          emptyMessage="No leaderboard data yet — check back after the next daily refresh."
        />
      </Tabs.Content>

      <Tabs.Content value="monthly" className="focus:outline-none">
        <EntryList
          entries={monthly}
          emptyMessage="No contributions this month yet — be the first to submit a spot!"
        />
      </Tabs.Content>
    </Tabs.Root>
  );
}
