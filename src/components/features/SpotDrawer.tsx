"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { useFavourite } from "@/hooks/useFavourite";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight, Bookmark, BookmarkCheck } from "lucide-react";

interface SpotDrawerProps {
  spot: any | null;
  onClose: () => void;
}

export function SpotDrawer({ spot, onClose }: SpotDrawerProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { isSaved, toggleSave, loading: loadingSave } = useFavourite(spot?.id);
  const [internalOpen, setInternalOpen] = useState(false);

  // Sync internal Radix state safely handling null inputs gracefully!
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
    // Route safely ensuring variables map cleanly against dynamically parsed variables.
    router.push(`/london/${encodeURIComponent(spot.neighbourhood.toLowerCase())}/${spot.slug}`);
  };

  return (
    <Dialog.Root open={internalOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-transparent transition-opacity" />
        
        <Dialog.Content 
          className="fixed z-50 flex flex-col bg-[#fcfbf8] shadow-[var(--focus-shadow)] outline-none 
                    w-full bottom-0 top-[20vh] rounded-t-2xl px-6 py-6 
                    md:right-0 md:top-0 md:bottom-0 md:h-full md:w-[480px] md:rounded-none overflow-y-auto"
                   
          onPointerDownOutside={(e) => {
             // Let mobile users swipe or click the map purely without strict active blocks natively.
             e.detail.originalEvent.preventDefault();
             onClose();
          }}
        >
          {/* Mobile Handle */}
          <div className="w-12 h-1.5 bg-[var(--border-passive)] rounded-full mx-auto mb-4 md:hidden" />

          {spot && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 md:slide-in-from-right-8 duration-300">
              
              {/* Header Close Container cleanly overriding structural overlaps */}
              <div className="flex justify-between items-center -mt-2 -mx-2 md:mt-0 md:mx-0">
                <button onClick={onClose} className="p-2 text-[#5f5f5d] hover:text-[#1c1c1c] rounded-full transition-colors">
                  <ArrowRight className="w-5 h-5 hidden md:block" />
                  <span className="md:hidden text-2xl leading-none">&times;</span>
                </button>
                <div className="flex gap-2">
                   <Button 
                     variant="pill" 
                     size="sm" 
                     onClick={handleSaveClick}
                     className={isSaved ? "bg-[#1c1c1c] text-[#fcfbf8] border-[#1c1c1c]" : ""}
                   >
                     {isSaved ? <BookmarkCheck className="w-4 h-4 mr-1.5"/> : <Bookmark className="w-4 h-4 mr-1.5"/>}
                     {isSaved ? "Saved" : "Save"}
                   </Button>
                </div>
              </div>

              {/* Cover Photo */}
              <div className="w-full h-48 md:h-64 rounded-[12px] border border-[var(--border-passive)] overflow-hidden bg-[var(--border-passive)] flex-shrink-0 relative">
                 {spot.photoUrl ? (
                    <img src={spot.photoUrl} alt={spot.name} className="w-full h-full object-cover" />
                 ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[#5f5f5d] text-sm">No cover photo available</div>
                 )}
              </div>

              {/* Core Titles */}
              <div className="flex flex-col gap-3">
                 <h2 className="t-h2 text-[#1c1c1c] tracking-tight">{spot.name}</h2>
                 
                 <div className="flex items-center flex-wrap gap-2">
                    <Badge variant="category">{spot.neighbourhood}</Badge>
                    {spot.postcodeDistrict && <Badge variant="category">{spot.postcodeDistrict}</Badge>}
                    <Badge variant={spot.priceTier === "free" ? "free" : "tier"}>
                       {spot.priceTier === "free" ? "Free" : spot.priceTier}
                    </Badge>
                 </div>
              </div>

              <hr className="border-[var(--border-passive)]" />

              {/* Action Array */}
              <div className="flex gap-3">
                 <Button onClick={getDirections} variant="ghost" className="flex-1 justify-center text-[#5f5f5d] hover:text-[#1c1c1c] bg-[#fcfbf8] border-[var(--border-interactive)] shadow-sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    Get directions
                 </Button>
              </div>

              {/* Content Description */}
              <div className="flex flex-col gap-4 text-[#1c1c1c]">
                 <p className="t-body leading-relaxed">{spot.description}</p>
                 
                 {/* Tips Logic seamlessly parsing explicitly configured arrays natively */}
                 {spot.tips && spot.tips.length > 0 && (
                    <div className="bg-[#f7f4ed] p-4 rounded-xl border border-[var(--border-passive)] shadow-[var(--inset-dark)] mt-2">
                      <h4 className="text-[14px] font-semibold mb-2">Local Tips</h4>
                      <ul className="list-disc pl-5 space-y-1 text-[14px] text-[#5f5f5d]">
                         {spot.tips.map((tip: string, idx: number) => (
                            <li key={idx} className="pl-1">{tip}</li>
                         ))}
                      </ul>
                    </div>
                 )}
              </div>

              {/* Travel Time Placeholder Mapping */}
              <div className="flex items-center gap-2 text-[14px] text-[#5f5f5d] mt-2 bg-[#fcfbf8] px-3 py-2 rounded-[8px] border border-[var(--border-interactive)] w-max">
                 <span className="text-[16px]">🚶‍♂️</span>
                 <span>approx 10 min walk from central station</span>
              </div>

              {/* Bottom Nav */}
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
