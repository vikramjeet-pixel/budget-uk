"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X, Search } from "lucide-react";
import { Button, IconButton } from "@/components/ui/button";
import { useScroll } from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { signOutUser } from "@/lib/firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";

import { CitySelector } from "./CitySelector";

const STATIC_PAGES = ["about", "privacy", "terms", "login", "signup", "account"];

export function Header() {
  const scrolled = useScroll(10);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  const [searchInput, setSearchInput] = React.useState("");
  const debouncedSearch = useDebounce(searchInput, 250);

  // Extract city slug from pathname
  const pathParts = pathname.split("/").filter(Boolean);
  const citySlug = pathParts[0];
  const isCityPage = citySlug && !STATIC_PAGES.includes(citySlug);
  const currentCity = isCityPage ? citySlug : "london";

  const isOnSpots = pathname.includes("/spots");

  const navLinks = [
    { name: "Map", href: `/${currentCity}` },
    { name: "Spots", href: `/${currentCity}/spots` },
    { name: "Free", href: `/${currentCity}/free` },
    { name: "Transport", href: `/${currentCity}/transport` },
    { name: "Events", href: `/${currentCity}/events` },
    { name: "Community", href: `/${currentCity}/community` },
    { name: "About", href: "/about" },
  ];

  React.useEffect(() => {
    if (!debouncedSearch.trim()) return;
    router.push(`/${currentCity}/spots?q=${encodeURIComponent(debouncedSearch)}`);
  }, [debouncedSearch, router, currentCity]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-colors duration-200",
        "bg-[#f7f4ed]",
        scrolled ? "border-b border-[var(--border-passive)]" : "border-b border-transparent"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[#2d5a4c] rounded-full flex items-center justify-center text-white font-bold text-[15px] shadow-sm transition-transform group-hover:scale-105">
              UK
            </div>
            <span className="font-sans font-bold text-[19px] text-[#1c1c1c] tracking-tight hidden xs:inline">
              BudgetUK
            </span>
          </Link>

          <div className="hidden md:block">
            <CitySelector />
          </div>

          <nav className="hidden lg:block">
            <ul className="flex items-center space-x-6">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-[#1c1c1c] text-[14px] font-normal underline-offset-4 hover:underline",
                      pathname === link.href && "font-bold underline"
                    )}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {!isOnSpots && pathname !== "/" && (
          <div className="hidden md:flex flex-1 max-w-[280px] mx-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5f5f5d]" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search spots..."
              className="w-full bg-[#ede9e1] border border-passive rounded-full pl-8 pr-3 py-1.5 text-[13px] outline-none focus:border-[#1c1c1c] focus:bg-[#f7f4ed] transition-all text-[#1c1c1c] placeholder:text-[#5f5f5d]"
            />
          </div>
        )}

        <div className="hidden md:flex items-center space-x-4">
          {loading ? (
             <div className="h-9 w-[120px] bg-[var(--border-passive)] animate-pulse rounded-[6px]" />
          ) : user ? (
            <>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] rounded-[9999px] p-1 pr-3 bg-[var(--hover-tint)] hover:bg-[var(--border-passive)] transition-colors border border-[var(--border-passive)]">
                    <img 
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'U'}&background=1c1c1c&color=fcfbf8`} 
                      alt="Avatar" 
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span className="text-[14px] text-[#1c1c1c] font-medium">{user.displayName || "Account"}</span>
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content 
                    align="end"
                    sideOffset={8}
                    className="z-50 w-48 rounded-[8px] border border-[var(--border-passive)] bg-[#f7f4ed] p-1 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
                  >
                    <DropdownMenu.Item asChild className="cursor-pointer focus:bg-[var(--border-passive)] focus:outline-none rounded-[4px] px-3 py-2 text-[14px] text-[#1c1c1c]">
                      <Link href="/account">Account</Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild className="cursor-pointer focus:bg-[var(--border-passive)] focus:outline-none rounded-[4px] px-3 py-2 text-[14px] text-[#1c1c1c]">
                      <Link href="/account?tab=favourites">My favourites</Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="my-1 h-px bg-[var(--border-passive)]" />
                    <DropdownMenu.Item 
                      onSelect={(e) => {
                        e.preventDefault();
                        signOutUser();
                      }}
                      className="cursor-pointer focus:bg-[var(--border-passive)] focus:outline-none rounded-[4px] px-3 py-2 text-[14px] text-[#1c1c1c]"
                    >
                      Sign out
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
              <Link href={`/${currentCity}/community/add`}>
                <Button variant="primary">Add a Spot</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" passHref>
                <Button variant="ghost">Log In</Button>
              </Link>
              <Link href={`/${currentCity}/community/add`}>
                <Button variant="primary">Add a Spot</Button>
              </Link>
            </>
          )}
        </div>

        <div className="md:hidden flex items-center gap-3">
          <CitySelector />
          <IconButton
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5 text-[#1c1c1c]" /> : <Menu className="h-5 w-5 text-[#1c1c1c]" />}
          </IconButton>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--border-passive)] shadow-sm rounded-b-[6px] overflow-hidden">
          <div className="bg-[#f7f4ed] px-4 pb-6 pt-2">
            <ul className="space-y-4">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "block text-[#1c1c1c] text-[14px] font-normal underline-offset-4 hover:underline",
                      pathname === link.href && "font-bold underline"
                    )}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li className="flex flex-col space-y-3 pt-4 border-t border-[var(--border-passive)]">
                {user ? (
                  <>
                    <Link href="/account" className="w-full">
                      <Button variant="ghost" className="w-full justify-center">Account</Button>
                    </Link>
                    <Button variant="ghost" className="w-full justify-center" onClick={() => signOutUser()}>Sign Out</Button>
                    <Link href={`/${currentCity}/community/add`} className="w-full">
                      <Button variant="primary" className="w-full justify-center">Add a Spot</Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="w-full">
                      <Button variant="ghost" className="w-full justify-center">Log In</Button>
                    </Link>
                    <Link href={`/${currentCity}/community/add`} className="w-full">
                      <Button variant="primary" className="w-full justify-center">Add a Spot</Button>
                    </Link>
                  </>
                )}
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}

