"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { useFavourite } from "@/hooks/useFavourite";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight, Bookmark, BookmarkCheck } from "lucide-react";
import type { Spot } from "@/types";

interface SpotDrawerProps {
  spot: Spot | null;
  onClose: () => void;
}

export function SpotDrawer({ spot, onClose }: SpotDrawerProps) {
  const router = useRouter();
  const { user } = useAuthContext();
  const { isSaved, toggleSave } = useFavourite(spot?.id);
  const [internalOpen, setInternalOpen] = useState(false);

  useEffect(() => {
    setInternalOpen(!!spot);
  }, [spot]);

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  const handleSaveClick = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    await toggleSave();
  };

  const getDirections = () => {
    if (!spot) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${spot.location.latitude},${spot.location.longitude}`;
    window.open(url, "_blank");
  };

  const viewFullPage = () => {
    if (!spot) return;
    router.push(`/london/${encodeURIComponent(spot.neighbourhood.toLowerCase())}/${spot.slug}`);
  };

  return (
    <Dialog.Root open={internalOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-transparent" />

        <Dialog.Content
          className="fixed z-50 flex flex-col bg-[#fcfbf8] shadow-[var(--focus-shadow)] outline-none
                     w-full bottom-0 top-[20vh] rounded-t-2xl px-6 py-6
                     md:right-0 md:top-0 md:bottom-0 md:h-full md:w-120 md:rounded-none overflow-y-auto"
          onPointerDownOutside={(e) => {
            e.detail.originalEvent.preventDefault();
            onClose();
          }}
        >
          {/* Mobile grab handle */}
          <div className="w-12 h-1.5 bg-[var(--border-passive)] rounded-full mx-auto mb-4 md:hidden" />

          {spot && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 md:slide-in-from-right-8 duration-300">

              {/* Top bar: close + save */}
              <div className="flex justify-between items-center -mt-2 -mx-2 md:mt-0 md:mx-0">
                <button
                  onClick={onClose}
                  className="p-2 text-[#5f5f5d] hover:text-[#1c1c1c] rounded-full transition-colors"
                >
                  <ArrowRight className="w-5 h-5 hidden md:block" />
                  <span className="md:hidden text-2xl leading-none">&times;</span>
                </button>
                <Button
                  variant="pill"
                  size="sm"
                  onClick={handleSaveClick}
                  className={isSaved ? "bg-[#1c1c1c] text-[#fcfbf8] border-[#1c1c1c]" : ""}
                >
                  {isSaved
                    ? <BookmarkCheck className="w-4 h-4 mr-1.5" />
                    : <Bookmark className="w-4 h-4 mr-1.5" />}
                  {isSaved ? "Saved" : "Save"}
                </Button>
              </div>

              {/* Hero photo */}
              <div className="w-full h-48 md:h-64 rounded-[12px] border border-[var(--border-passive)] overflow-hidden bg-[var(--border-passive)] flex-shrink-0 relative">
                {spot.photoUrl ? (
                  <img src={spot.photoUrl} alt={spot.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[#5f5f5d] text-sm">
                    No photo available
                  </div>
                )}
              </div>

              {/* Name + meta badges */}
              <div className="flex flex-col gap-3">
                <h2 className="t-h2 text-[#1c1c1c] tracking-tight">{spot.name}</h2>
                <div className="flex items-center flex-wrap gap-2">
                  <Badge variant="category">{spot.neighbourhood}</Badge>
                  {spot.postcodeDistrict && (
                    <Badge variant="category">{spot.postcodeDistrict}</Badge>
                  )}
                  <Badge variant={spot.priceTier === "free" ? "free" : "tier"}>
                    {spot.priceTier === "free" ? "Free" : spot.priceTier}
                  </Badge>
                </div>
              </div>

              <hr className="border-[var(--border-passive)]" />

              {/* Actions */}
              <Button
                onClick={getDirections}
                variant="ghost"
                className="w-full justify-center"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Get directions
              </Button>

              {/* Description */}
              <p className="t-body text-[#1c1c1c] leading-relaxed">{spot.description}</p>

              {/* Tips */}
              {spot.tips.length > 0 && (
                <div className="bg-[#f7f4ed] p-4 rounded-xl border border-passive shadow-inset-dark">
                  <h4 className="text-[14px] font-semibold mb-2">Local tips</h4>
                  <ul className="list-disc pl-5 space-y-1 text-[14px] text-[#5f5f5d]">
                    {spot.tips.map((tip, idx) => (
                      <li key={idx} className="pl-1">{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Nearest station placeholder */}
              <div className="flex items-center gap-2 text-[14px] text-[#5f5f5d] bg-[#fcfbf8] px-3 py-2 rounded-md border border-interactive w-max">
                <span className="text-[16px]">🚶‍♂️</span>
                <span>approx 10 min walk from central station</span>
              </div>

              {/* View full page */}
              <div className="pt-6 pb-8 text-center mt-auto">
                <button
                  onClick={viewFullPage}
                  className="text-[14px] font-medium text-[#1c1c1c] underline underline-offset-4 hover:text-[#5f5f5d] transition-colors"
                >
                  View full page
                </button>
              </div>

            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
