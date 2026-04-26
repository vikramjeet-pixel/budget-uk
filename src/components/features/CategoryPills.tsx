"use client";

import React, { useCallback, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { trackFilterApplied } from "@/lib/analytics";

const CATEGORY_MAP = [
  { id: "food", icon: "🍽️", label: "Food" },
  { id: "housing", icon: "🏠", label: "Housing" },
  { id: "workspace", icon: "💻", label: "Work Spots" },
  { id: "coffee", icon: "☕", label: "Coffee" },
  { id: "student-housing", icon: "🎓", label: "Student Housing" },
  { id: "accelerator", icon: "🚀", label: "Accelerators" },
  { id: "vc", icon: "💰", label: "VCs" },
  { id: "gym", icon: "💪", label: "Gym" },
  { id: "bars", icon: "🍺", label: "Bars" },
  { id: "grocery", icon: "🛒", label: "Grocery" },
  { id: "entertainment", icon: "🎭", label: "Entertainment" },
  { id: "vintage", icon: "🧥", label: "Vintage" },
  { id: "services", icon: "✂️", label: "Services" },
  { id: "free", icon: "🎟️", label: "Free" }
];

function CategoryPillsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCats = searchParams.get("cat")?.split(",").filter(Boolean) || [];
  const isNearMe = searchParams.get("nearby") === "true";

  const toggleCategory = useCallback((id: string, isShift: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (id === "all") {
      params.delete("cat");
    } else {
      let newCats = [...currentCats];
      
      if (isShift || typeof window !== 'undefined' && window.innerWidth < 768) { 
        if (newCats.includes(id)) {
           newCats = newCats.filter(c => c !== id);
        } else {
           newCats.push(id);
        }
      } else {
        if (newCats.length === 1 && newCats[0] === id) {
           newCats = []; 
        } else {
           newCats = [id]; 
        }
      }
      
      if (newCats.length > 0) {
        params.set("cat", newCats.join(","));
      } else {
        params.delete("cat");
      }
    }

    router.push(pathname + "?" + params.toString(), { scroll: false });

    if (id !== "all") {
      trackFilterApplied({ type: "category", value: id });
    }
  }, [currentCats, pathname, router, searchParams]);

  const isAllSelected = currentCats.length === 0;

  return (
    <div className="flex space-x-2 overflow-x-auto pb-4 pt-2 px-2 no-scrollbar snap-x w-full">
      <button
        onClick={(e) => toggleCategory("all", e.shiftKey)}
        className={cn(
          "snap-start flex-none whitespace-nowrap px-4 py-2 md:px-6 md:py-3 rounded-2xl text-[13px] md:text-[14px] font-bold transition-all shadow-xl border duration-200",
          isAllSelected
            ? "bg-[#1c1c1c] text-[#fcfbf8] border-[#1c1c1c]"
            : "bg-[#fcfbf8]/95 backdrop-blur-md text-[#1c1c1c] border-white hover:bg-[#f7f4ed]"
        )}
      >
        All
      </button>

      {CATEGORY_MAP.map((cat) => {
        const isSelected = currentCats.includes(cat.id);
        return (
          <button
            key={cat.id}
            onClick={(e) => toggleCategory(cat.id, e.shiftKey)}
            className={cn(
              "snap-start flex-none whitespace-nowrap px-4 py-2 md:px-6 md:py-3 rounded-2xl text-[13px] md:text-[14px] font-bold transition-all shadow-xl border duration-200 flex items-center gap-2",
              isSelected
                ? "bg-[#1c1c1c] text-[#fcfbf8] border-[#1c1c1c]"
                : "bg-[#fcfbf8]/95 backdrop-blur-md text-[#1c1c1c] border-white hover:bg-[#f7f4ed]"
            )}
          >
            <span className="text-[16px] md:text-[18px]">{cat.icon}</span>
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
