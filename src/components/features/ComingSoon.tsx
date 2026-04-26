"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { MapPin, Mail, CheckCircle2, Loader2 } from "lucide-react";

interface ComingSoonProps {
  cityName: string;
  citySlug: string;
}

export function ComingSoon({ cityName, citySlug }: ComingSoonProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/notify-launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, citySlug }),
      });

      if (res.ok) setStatus("success");
      else setStatus("error");
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 rounded-3xl bg-[#f7f4ed] border border-passive flex items-center justify-center text-[#1c1c1c] shadow-sm">
            <MapPin className="w-8 h-8" />
          </div>
        </div>
        
        <Badge variant="outline" className="mb-4 bg-[#ede9e1] border-passive text-[#5f5f5d] font-bold">
          COMING SOON
        </Badge>
        
        <h1 className="t-h1 text-[#1c1c1c] mb-6 tracking-tight">
          BudgetUK is coming to {cityName}
        </h1>
        
        <p className="t-body text-[#5f5f5d] mb-10 text-lg leading-relaxed px-4">
          We&apos;re curating the best budget-friendly food, coffee, and hidden gems in {cityName}. 
          Our local scouts are verifying every spot for quality and value. 
          <span className="block mt-2 font-semibold">Opening in Q2 2025.</span>
        </p>

        {status === "success" ? (
          <div className="bg-[#1c1c1c] text-white p-6 rounded-2xl flex items-center gap-4 text-left animate-in fade-in slide-in-from-bottom-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold">You&apos;re on the list!</div>
              <div className="text-white/60 text-sm">We&apos;ll email you the moment {cityName} goes live.</div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5f5f5d]" />
              <Input
                type="email"
                placeholder="Enter your email"
                className="pl-11 h-14 rounded-xl border-passive bg-[#f7f4ed] focus:border-[#1c1c1c] transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === "loading"}
              />
            </div>
            <Button 
              type="submit" 
              className="h-14 px-8 rounded-xl bg-[#1c1c1c] text-white hover:bg-[#1c1c1c]/90 font-bold shrink-0"
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Get notified"
              )}
            </Button>
          </form>
        )}
        
        {status === "error" && (
          <p className="mt-4 text-red-500 text-sm font-medium">
            Something went wrong. Please try again.
          </p>
        )}

        <div className="mt-12 text-[12px] text-[#5f5f5d] uppercase tracking-widest font-bold">
          Exploring UK&apos;s best value since 2024
        </div>
      </div>
    </div>
  );
}
