"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import * as Popover from "@radix-ui/react-popover";
import { useFavourite } from "@/hooks/useFavourite";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { MapPin, Globe, ArrowRight, Bookmark, BookmarkCheck, Flag } from "lucide-react";
import { NearestStation } from "@/components/features/NearestStation";
import { getDirectionsUrl } from "@/lib/maps/getDirectionsUrl";
import type { Spot } from "@/types";
import { trackSpotViewed } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface SpotDrawerProps {
  spot: Spot | null;
  onClose: () => void;
}

export function SpotDrawer({ spot, onClose }: SpotDrawerProps) {
  const router = useRouter();
  const { user } = useAuthContext();
  const { isSaved, toggleSave } = useFavourite(spot?.id);
  const [internalOpen, setInternalOpen] = useState(false);
  const [flagOpen, setFlagOpen] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [flagBusy, setFlagBusy] = useState(false);
  const [flagDone, setFlagDone] = useState(false);

  useEffect(() => {
    setInternalOpen(!!spot);
    if (spot?.id) {
      trackSpotViewed({
        spotId: spot.id,
        category: spot.category,
        neighbourhood: spot.neighbourhood,
        city: spot.city || "london",
      });
    }
  }, [spot]);

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  const slugify = (text: string) => encodeURIComponent(text.toLowerCase().replace(/\s+/g, "-"));

  const handleSaveClick = async () => {
    if (!user) {
      const city = spot?.city || "london";
      const nbhSlug = slugify(spot!.neighbourhood);
      const spotPath = `/${city}/${nbhSlug}/${spot!.slug}`;
      router.push(`/login?redirect=${encodeURIComponent(spotPath)}`);
      return;
    }
    await toggleSave();
  };


  const viewFullPage = () => {
    if (!spot) return;
    const city = spot.city || "london";
    const nbhSlug = slugify(spot.neighbourhood);
    router.push(`/${city}/${nbhSlug}/${spot.slug}`);
  };

  const submitFlag = async () => {
    if (!user || !spot || !flagReason.trim()) return;
    setFlagBusy(true);
    try {
      const token = await user.getIdToken();
      await fetch("/api/admin/flag", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ spotId: spot.id, spotName: spot.name, reason: flagReason.trim() }),
      });
      setFlagDone(true);
      setFlagReason("");
    } finally {
      setFlagBusy(false);
    }
  };

  return (
    <Dialog.Root open={internalOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px] md:bg-transparent" />

        <Dialog.Content
          className="fixed z-50 flex flex-col bg-[#fcfbf8] shadow-2xl outline-none
                     w-[calc(100%-32px)] left-4 right-4 bottom-4 rounded-2xl p-6
                     md:left-auto md:right-8 md:bottom-8 md:top-auto md:w-[380px] md:max-h-[85vh] md:rounded-2xl border border-passive
                     animate-in fade-in slide-in-from-right-8 duration-300 overflow-y-auto"
          onPointerDownOutside={(e) => {
            e.detail.originalEvent.preventDefault();
            onClose();
          }}
        >
          {spot && (
            <div className="flex flex-col gap-5">
              {/* Header with Selected Label */}
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[#5f5f5d] uppercase tracking-[0.1em] opacity-60">
                    Selected
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[24px]">
                      {spot.category === "food" ? "🍽️" : spot.category === "coffee" ? "☕" : "📍"}
                    </span>
                    <Dialog.Title className="text-[20px] font-bold text-[#1c1c1c] tracking-tight leading-tight">
                      {spot.name}
                    </Dialog.Title>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 -mt-2 text-[#5f5f5d] hover:text-[#1c1c1c] rounded-full transition-colors"
                >
                  <span className="text-2xl leading-none">&times;</span>
                </button>
              </div>

              {/* Address/Meta */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-[13px] text-[#5f5f5d] font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{spot.neighbourhood} {spot.postcodeDistrict ? `· ${spot.postcodeDistrict}` : ""}</span>
                </div>
                <div className="text-[13px] font-bold text-green-600">
                  {spot.priceTier === "free" ? "Free" : spot.priceTier}
                </div>
              </div>

              {/* Description */}
              <p className="text-[14px] text-[#5f5f5d] leading-relaxed line-clamp-4">
                {spot.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="category" className="bg-[#ede9e1] border-none text-[11px] py-0.5">
                  {spot.category}
                </Badge>
                {spot.tags?.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-[11px] py-0.5 border-passive text-[#5f5f5d]">
                    {tag}
                  </Badge>
                ))}
              </div>

              <hr className="border-passive" />

              {/* Actions */}
              <div className="flex gap-3 mt-1">
                <Button 
                  variant="primary" 
                  className="flex-1 justify-center py-5 h-auto bg-[#2d5a4c] hover:bg-[#23473c] text-white rounded-xl font-bold text-[14px]"
                  onClick={viewFullPage}
                >
                  View Details
                </Button>
                <a 
                  href={getDirectionsUrl(spot)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button 
                    variant="ghost" 
                    className="w-full justify-center py-5 h-auto border border-passive bg-[#f0ede4] text-[#1c1c1c] rounded-xl font-bold text-[14px] hover:bg-[#e5e0d5]"
                  >
                    <MapPin className="w-4 h-4 mr-2 opacity-60" />
                    Directions
                  </Button>
                </a>
              </div>

              {/* Save Button (Smaller/Minimal) */}
              <button
                onClick={handleSaveClick}
                className={cn(
                  "flex items-center justify-center gap-2 text-[12px] font-bold py-2 rounded-lg transition-all",
                  isSaved ? "text-[#2d5a4c]" : "text-[#5f5f5d] hover:text-[#1c1c1c]"
                )}
              >
                {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                {isSaved ? "Saved to your list" : "Save for later"}
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
