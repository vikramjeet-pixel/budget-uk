"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { useFavourites, type SavedSpot } from "@/hooks/useFavourites";
import { SpotCard } from "@/components/features/SpotCard";
import { SpotCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

function FavouriteItem({ spot, onRemove, onNoteBlur }: {
  spot: SavedSpot;
  onRemove: () => void;
  onNoteBlur: (note: string) => void;
}) {
  const [note, setNote] = useState(spot.note ?? "");
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    onRemove();
  };

  return (
    <div className={`flex flex-col gap-3 transition-opacity ${removing ? "opacity-40 pointer-events-none" : ""}`}>
      <div className="relative">
        <SpotCard spot={spot} />
        <button
          onClick={handleRemove}
          className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full border border-passive text-[#5f5f5d] hover:text-[#dc2626] hover:border-[#dc2626]/20 transition-colors"
          aria-label="Remove from favourites"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={() => onNoteBlur(note)}
        placeholder="Add a note..."
        rows={2}
        className="w-full text-[13px] text-[#1c1c1c] placeholder:text-[#5f5f5d] border border-passive rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-[#1c1c1c] transition-colors bg-white"
      />
    </div>
  );
}

export function FavouritesTab() {
  const { spots, loading, updateNote, removeFavourite } = useFavourites();

  if (loading) {
    return (
      <div className="flex flex-col gap-4 py-4">
        {[0, 1, 2].map((i) => <SpotCardSkeleton key={i} />)}
      </div>
    );
  }

  if (spots.length === 0) {
    return (
      <EmptyState
        message="You haven't saved any spots yet. Start exploring to build your list."
        cta="Explore the map"
        ctaHref="/"
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      {spots.map((spot) => (
        <FavouriteItem
          key={spot.id}
          spot={spot}
          onRemove={() => removeFavourite(spot.id!)}
          onNoteBlur={(note) => updateNote(spot.id!, note)}
        />
      ))}
    </div>
  );
}
