"use client";

import React from "react";
import Link from "next/link";
import { WifiOff, Bookmark, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#f7f4ed] flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full flex flex-col items-center gap-8 text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-[#fcfbf8] border border-[var(--border-passive)] flex items-center justify-center shadow-sm">
          <WifiOff className="w-9 h-9 text-[#5f5f5d]" />
        </div>

        {/* Message */}
        <div className="flex flex-col gap-2">
          <h1 className="text-[24px] font-bold text-[#1c1c1c] tracking-tight">
            You&apos;re offline
          </h1>
          <p className="text-[14px] text-[#5f5f5d] leading-relaxed">
            It looks like you&apos;ve lost your internet connection.
            Pages you&apos;ve recently visited are still available, and you can
            always browse your saved spots.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full">
          <Link href="/account/favourites">
            <Button variant="primary" className="w-full py-5 justify-center text-[15px]">
              <Bookmark className="w-4 h-4 mr-2" />
              View saved spots
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full py-4 justify-center text-[14px]"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go back
          </Button>
        </div>

        {/* Retry hint */}
        <p className="text-[12px] text-[#5f5f5d]">
          Your connection will reconnect automatically when available.
        </p>
      </div>
    </div>
  );
}
