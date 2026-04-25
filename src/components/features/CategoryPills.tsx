"use client";

import React, { useCallback, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { trackFilterApplied } from "@/lib/analytics";

const CATEGORY_MAP = [
  { id: "near_me", icon: "📍", label: "Near me" },
  { id: "food", icon: "🍽️", label: "Food" },
  { id: "housing", icon: "🏠", label: "Housing" },
  { id: "workspace", icon: "💻", label: "Workspaces" },
  { id: "coffee", icon: "☕", label: "Coffee" },
  { id: "accelerator", icon: "🚀", label: "Accelerators" },
  { id: "vc", icon: "💰", label: "VCs" },
  { id: "gym", icon: "💪", label: "Gym" },
  { id: "bars", icon: "🍺", label: "Bars" },
  { id: "grocery", icon: "🛒", label: "Grocery" },
  { id: "entertainment", icon: "🎭", label: "Entertainment" },
  { id: "services", icon: "✂️", label: "Services" },
  { id: "free", icon: "🎟️", label: "Free" }
];

function CategoryPillsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Extract variables locally evaluating from URL bindings smoothly
  const currentCats = searchParams.get("cat")?.split(",").filter(Boolean) || [];
  const isNearMe = searchParams.get("nearby") === "true";

  const toggleCategory = useCallback((id: string, isShift: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (id === "all") {
      params.delete("cat");
      params.delete("nearby");
    } else if (id === "near_me") {
      if (isNearMe) {
        params.delete("nearby");
      } else {
        params.set("nearby", "true");
        // We decouple 'near me' heavily natively avoiding boundary wipes globally unless explicitly needed
      }
    } else {
      let newCats = [...currentCats];
      
      // Mobile logic implicitly targets multiple toggles heavily explicitly. Desktop utilizes physical ShiftKey natively!
      if (isShift || typeof window !== 'undefined' && window.innerWidth < 768) { 
        if (newCats.includes(id)) {
           newCats = newCats.filter(c => c !== id);
        } else {
           newCats.push(id);
        }
      } else {
        // Desktop single-tap exclusive select logic natively overriding loops!
        if (newCats.length === 1 && newCats[0] === id) {
           newCats = []; // Toggle totally off
        } else {
           newCats = [id]; // Exclusive lock
        }
      }
      
      if (newCats.length > 0) {
        params.set("cat", newCats.join(","));
      } else {
        params.delete("cat");
      }
    }

    // Replace the URL instantly silently triggering hook dependencies organically overlapping states!
    router.push(pathname + "?" + params.toString(), { scroll: false });

    // Track filter event for non-clear actions
    if (id !== "all") {
      trackFilterApplied({ type: "category", value: id });
    }
  }, [currentCats, isNearMe, pathname, router, searchParams]);

  // Derive explicit ALL state locally cleanly ensuring 'nearby' or standard category elements toggle states naturally!
  const isAllSelected = !isNearMe && currentCats.length === 0;

  return (
    <div className="flex space-x-2 overflow-x-auto pb-4 pt-2 px-2 scrollbar-none snap-x w-full">
      <button
        onClick={(e) => toggleCategory("all", e.shiftKey)}
        className={cn(
          "snap-start flex-none whitespace-nowrap px-4 py-[6px] rounded-[9999px] text-[14px] font-medium transition-all shadow-[var(--inset-dark)] duration-200 border border-[var(--border-interactive)]",
          isAllSelected
            ? "bg-[#1c1c1c] text-[#fcfbf8] opacity-100 border-[#1c1c1c]"
            : "bg-[#f7f4ed] text-[#1c1c1c] opacity-50 hover:opacity-80"
        )}
      >
        All
      </button>

      {CATEGORY_MAP.map((cat) => {
        const isSelected = cat.id === "near_me" ? isNearMe : currentCats.includes(cat.id);
        return (
          <button
            key={cat.id}
            onClick={(e) => toggleCategory(cat.id, e.shiftKey)}
            className={cn(
              "snap-start flex-none whitespace-nowrap px-4 py-[6px] rounded-[9999px] text-[14px] font-medium transition-all shadow-[var(--inset-dark)] duration-200 flex items-center gap-1.5 border border-[var(--border-interactive)]",
              isSelected
                ? "bg-[#1c1c1c] text-[#fcfbf8] opacity-100 border-[#1c1c1c]"
                : "bg-[#f7f4ed] text-[#1c1c1c] opacity-50 hover:opacity-80"
            )}
          >
            <span className="text-[16px] w-[20px] text-center">{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        )
      })}
    </div>
  );
}

export function CategoryPills() {
  return (
    <Suspense fallback={<div className="h-10 w-full animate-pulse bg-[var(--border-passive)] rounded-full" />}>
      <CategoryPillsContent />
    </Suspense>
  )
}
