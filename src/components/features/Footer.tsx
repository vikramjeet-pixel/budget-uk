"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { getCityBySlug } from "@/data/cities";

export function Footer() {
  const pathname = usePathname();
  const pathParts = pathname.split("/").filter(Boolean);
  const citySlug = pathParts[0];
  const city = getCityBySlug(citySlug);
  const cityName = city?.name || "London";

  return (
    <footer className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-auto">
      <div 
        className={cn(
          "rounded-[16px] border border-[var(--border-passive)] px-6 py-12 md:px-12",
          "bg-[#f7f4ed] bg-gradient-to-b from-pink-500/5 via-orange-400/5 to-blue-500/10"
        )}
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h4 className="font-semibold text-[#1c1c1c] text-[16px] mb-4">About</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-[#5f5f5d] text-[14px] hover:text-[#1c1c1c] hover:underline underline-offset-4 transition-colors">Our Mission</Link>
              </li>
              <li>
                <Link href="/team" className="text-[#5f5f5d] text-[14px] hover:text-[#1c1c1c] hover:underline underline-offset-4 transition-colors">Team</Link>
              </li>
              <li>
                <Link href="/contact" className="text-[#5f5f5d] text-[14px] hover:text-[#1c1c1c] hover:underline underline-offset-4 transition-colors">Contact</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-[#1c1c1c] text-[16px] mb-4">Cities</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/london" className="text-[#5f5f5d] text-[14px] hover:text-[#1c1c1c] hover:underline underline-offset-4 transition-colors">London</Link>
              </li>
              <li>
                <Link href="/manchester" className="text-[#5f5f5d] text-[14px] hover:text-[#1c1c1c] hover:underline underline-offset-4 transition-colors">Manchester</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#1c1c1c] text-[16px] mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="text-[#5f5f5d] text-[14px] hover:text-[#1c1c1c] hover:underline underline-offset-4 transition-colors">Blog</Link>
              </li>
              <li>
                <Link href="/guides" className="text-[#5f5f5d] text-[14px] hover:text-[#1c1c1c] hover:underline underline-offset-4 transition-colors">Guides</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#1c1c1c] text-[16px] mb-4">Legal</h4>
            <ul className="space-y-2">
               <li>
                <Link href="/privacy" className="text-[#5f5f5d] text-[14px] hover:text-[#1c1c1c] hover:underline underline-offset-4 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="text-[#5f5f5d] text-[14px] hover:text-[#1c1c1c] hover:underline underline-offset-4 transition-colors">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start md:flex-row md:items-center justify-between border-t border-[var(--border-passive)] pt-8">
          <span className="text-[20px] font-semibold text-[#1c1c1c]">BudgetUK</span>
          <span className="mt-4 md:mt-0 text-[#5f5f5d] text-[14px]">Made in {cityName}</span>
        </div>
      </div>
    </footer>
  );
}
