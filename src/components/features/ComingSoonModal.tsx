"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { City } from "@/data/cities";

interface ComingSoonModalProps {
  city: City | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ComingSoonModal({ 
  city, 
  open, 
  onOpenChange 
}: ComingSoonModalProps) {
  if (!city) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#1c1c1c]/40 backdrop-blur-sm animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-passive bg-[#fcfbf8] p-8 shadow-2xl animate-in zoom-in-95 fade-in duration-200">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 rounded-full bg-[#f7f4ed] border border-passive flex items-center justify-center text-3xl">
              📍
            </div>
            <div className="flex flex-col gap-2">
              <Dialog.Title className="t-h2 text-[#1c1c1c]">
                {city.name} is coming soon
              </Dialog.Title>
              <p className="t-body text-[#5f5f5d]">
                We&apos;re currently mapping the best value food, coffee, and workspaces in {city.name}. 
                Join 5,000+ members to get notified when we launch.
              </p>
            </div>
            <div className="w-full flex flex-col gap-3">
              <Input placeholder="your@email.com" className="text-center" />
              <Button variant="primary" className="w-full" onClick={() => onOpenChange(false)}>
                Notify me
              </Button>
            </div>
            <button 
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 p-2 text-[#5f5f5d] hover:text-[#1c1c1c] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
