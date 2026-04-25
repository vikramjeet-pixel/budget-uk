"use client";

import React from "react";
import { Sparkles, Info, X } from "lucide-react";

interface EditorialCalloutProps {
  title: string;
  content: string;
  category?: string;
  onClose?: () => void;
}

export function EditorialCallout({ title, content, onClose }: EditorialCalloutProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#1c1c1c] p-5 text-[#fcfbf8] shadow-xl animate-in fade-in zoom-in-95 duration-500 mb-6">
      {/* Decorative gradient background */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#ef4444] rounded-full blur-[60px] opacity-20" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#3b82f6] rounded-full blur-[60px] opacity-20" />
      
      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-2 py-1 bg-white/10 rounded-full border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">Budget Hack</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-4 h-4 text-white/50" />
            </button>
          )}
        </div>
        
        <div>
          <h3 className="text-[17px] font-bold leading-tight mb-1 text-white">{title}</h3>
          <p className="text-[13px] text-white/80 leading-relaxed font-medium">
            {content}
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-[11px] text-white/40 italic">
          <Info className="w-3 h-3" />
          <span>Pro-tip for London founders & students</span>
        </div>
      </div>
    </div>
  );
}
