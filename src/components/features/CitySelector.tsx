"use client";

import React from "react";
import Link from "next/link";
import { ChevronDown, MapPin } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import { CITIES, getCityBySlug } from "@/data/cities";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/Badge";

export function CitySelector() {
  const pathname = usePathname();
  
  // Extract city slug from pathname (e.g., /london/spots -> london)
  const pathParts = pathname.split("/").filter(Boolean);
  const currentCitySlug = pathParts[0];
  const currentCity = getCityBySlug(currentCitySlug);

  // If we're not on a city-specific page, don't show the selector or show a default
  if (!currentCity && pathname !== "/") return null;

  const displayCityName = currentCity?.name || "Select City";

  // When switching cities, we want to stay on the same sub-page if possible
  // e.g., /london/spots -> /manchester/spots
  const getCityLink = (newSlug: string) => {
    if (pathname === "/") return `/${newSlug}`;
    
    const knownSubPages = ["spots", "free", "transport", "events", "community", "student", "student-nights"];
    const subPage = pathParts[1];
    
    if (!subPage) return `/${newSlug}`; // On /[city] map
    
    if (knownSubPages.includes(subPage)) {
      return `/${newSlug}/${subPage}`;
    }
    
    // Default to /spots if on a detail page or unknown subpage
    return `/${newSlug}/spots`;
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 px-3 h-9 rounded-full bg-[#ede9e1] border-passive hover:bg-[#ede9e1]/80 text-[#1c1c1c] font-bold text-[14px]"
        >
          <MapPin className="w-4 h-4 text-[#5f5f5d]" />
          {displayCityName}
          <ChevronDown className="w-4 h-4 text-[#5f5f5d]" />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          align="start" 
          sideOffset={8}
          className="z-[60] min-w-[220px] max-h-[400px] overflow-y-auto rounded-xl border border-passive bg-[#f7f4ed] p-2 shadow-xl animate-in fade-in zoom-in-95"
        >
          <div className="px-2 py-1.5 text-[12px] font-bold text-[#5f5f5d] uppercase tracking-wider">
            Available Cities
          </div>
          {CITIES.map((city) => (
            <DropdownMenu.Item 
              key={city.slug} 
              asChild
              className="outline-none"
            >
              <Link 
                href={getCityLink(city.slug)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-[14px] transition-colors cursor-pointer ${
                  currentCitySlug === city.slug 
                    ? "bg-[#1c1c1c] text-white" 
                    : "text-[#1c1c1c] hover:bg-[#ede9e1]"
                }`}
              >
                <span className="font-medium">{city.name}</span>
                {city.comingSoon && (
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-passive text-[#5f5f5d] bg-white/50">
                    SOON
                  </Badge>
                )}
              </Link>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
