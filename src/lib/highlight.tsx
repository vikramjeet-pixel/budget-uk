import React from "react";

/**
 * Wraps matched substrings in a <mark> with --hover-tint background.
 * Returns plain string when query is empty so callers can render it directly.
 *
 * TODO: When the spot index exceeds ~500 docs, swap the client-side filter in
 * useSpots + this highlight utility for an Algolia or Typesense integration.
 * Swap point: src/hooks/useSpots.ts — replace the onSnapshot + client filter
 * with a call to the search client, and use the hit's `_highlightResult` field
 * instead of this function.
 */
export function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  const lower = query.toLowerCase();

  return parts.map((part, i) =>
    part.toLowerCase() === lower ? (
      <mark
        key={i}
        className="bg-[var(--hover-tint)] rounded-sm not-italic font-[inherit]"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}
