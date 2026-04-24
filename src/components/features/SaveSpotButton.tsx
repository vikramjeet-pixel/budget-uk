"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import * as Popover from "@radix-ui/react-popover";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavourite } from "@/hooks/useFavourite";
import { useAuthContext } from "@/components/providers/AuthProvider";

interface SaveSpotButtonProps {
  spotId: string;
}

export function SaveSpotButton({ spotId }: SaveSpotButtonProps) {
  const pathname = usePathname();
  const { user } = useAuthContext();
  const { isSaved, toggleSave, loading } = useFavourite(spotId);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleClick = async () => {
    if (!user) {
      setPopoverOpen(true);
      return;
    }
    await toggleSave();
  };

  const loginHref = `/login?redirect=${encodeURIComponent(pathname)}`;

  return (
    <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
      <Popover.Anchor asChild>
        <Button
          variant="primary"
          onClick={handleClick}
          disabled={loading}
          className="w-full justify-center py-6 h-auto text-lg"
        >
          {isSaved
            ? <BookmarkCheck className="w-5 h-5 mr-3" />
            : <Bookmark className="w-5 h-5 mr-3" />}
          {isSaved ? "Saved" : "Save this spot"}
        </Button>
      </Popover.Anchor>

      <Popover.Portal>
        <Popover.Content
          className="z-50 bg-white rounded-xl border border-passive shadow-lg p-5 w-64 text-center flex flex-col gap-3"
          sideOffset={8}
        >
          <p className="text-[14px] font-semibold text-[#1c1c1c]">Sign in to save spots</p>
          <p className="text-[13px] text-[#5f5f5d]">
            Create a free account to save your favourite places.
          </p>
          <a
            href={loginHref}
            className="inline-block w-full py-2.5 px-4 bg-[#1c1c1c] text-[#fcfbf8] text-[13px] font-semibold rounded-full hover:bg-[#3a3a3a] transition-colors"
          >
            Sign in
          </a>
          <Popover.Arrow className="fill-white stroke-passive" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
