"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

interface LocationToastProps {
  onLocationFound: (loc: [number, number]) => void;
  onClose: () => void;
}

export function LocationToast({ onLocationFound, onClose }: LocationToastProps) {
  const [postcode, setPostcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postcode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(postcode)}`);
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not map that location vector.');
      
      onLocationFound([data.lat, data.lng]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-[#f7f4ed] border border-[var(--border-passive)] p-4 rounded-[8px] drop-shadow-md w-[90%] max-w-[340px] animate-in fade-in slide-in-from-top-10">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-[16px] font-semibold text-[#1c1c1c]">Location Bounds Required</h4>
        <button onClick={onClose} className="text-[#5f5f5d] hover:text-[#1c1c1c] text-xl font-medium leading-none">&times;</button>
      </div>
      <p className="text-[14px] text-[#5f5f5d] mb-4">
        We explicitly couldn't map your precise location automatically over browser parameters. Please enter your postcode instead locally.
      </p>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input 
          type="text" 
          placeholder="e.g. SW1A 1AA" 
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          className="flex-1 bg-[#fcfbf8] border border-[var(--border-interactive)] rounded-[6px] px-3 py-[6px] text-[14px] outline-none focus:border-[#1c1c1c] uppercase shadow-sm"
        />
        <Button type="submit" variant="primary" size="sm" disabled={loading}>
          {loading ? '...' : 'Locate'}
        </Button>
      </form>
      {error && <p className="text-[#dc2626] text-[12px] mt-2 font-medium">{error}</p>}
    </div>
  );
}
