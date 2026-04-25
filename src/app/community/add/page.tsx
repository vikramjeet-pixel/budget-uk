"use client";

import React, { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
const LocationPickerMap = dynamic(() => import("@/components/features/LocationPickerMap"), { ssr: false });
import { z } from "zod";
import { collection, query, where, getDocs } from "firebase/firestore";
import { MapPin, Plus, X, Upload, ChevronLeft } from "lucide-react";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { auth, db } from "@/lib/firebase/client";
import { uploadSubmissionPhoto } from "@/lib/firebase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import type { Category, PriceTier } from "@/types";
import { trackSpotSubmitted } from "@/lib/analytics";

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS: { value: Category; emoji: string; label: string }[] = [
  { value: "food", emoji: "🍽️", label: "Food" },
  { value: "coffee", emoji: "☕", label: "Coffee" },
  { value: "workspace", emoji: "💻", label: "Workspace" },
  { value: "gym", emoji: "💪", label: "Gym" },
  { value: "bars", emoji: "🍺", label: "Bars" },
  { value: "grocery", emoji: "🛒", label: "Grocery" },
  { value: "entertainment", emoji: "🎭", label: "Entertainment" },
  { value: "services", emoji: "✂️", label: "Services" },
  { value: "student-housing", emoji: "🏠", label: "Student Housing" },
  { value: "vintage", emoji: "🏷️", label: "Secondhand & Vintage" },
  { value: "accelerator", emoji: "🚀", label: "Accelerator" },
  { value: "vc", emoji: "💰", label: "VC / Funding" },
];

const PRICE_TIERS: { value: PriceTier; label: string; sub: string }[] = [
  { value: "free", label: "Free", sub: "Always £0" },
  { value: "£", label: "£", sub: "Under £5" },
  { value: "££", label: "££", sub: "£5–£15" },
  { value: "£££", label: "£££", sub: "£15–£30" },
  { value: "££££", label: "££££", sub: "£30+" },
];

const SPOT_TAGS = [
  "vegetarian", "vegan", "halal", "kosher", "gluten-free",
  "dairy-free", "student-discount", "cash-only", "outdoor-seating",
  "wifi", "quiet", "dog-friendly",
];

const LONDON_CENTER = { longitude: -0.1276, latitude: 51.5074, zoom: 11 };
const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const LONDON_BOUNDS: [[number, number], [number, number]] = [
  [-0.510375, 51.28676],
  [0.334015, 51.691874],
];

// ─── Zod schemas ─────────────────────────────────────────────────────────────

const step1Schema = z.object({
  category: z.string().min(1, "Select a category"),
  name: z.string().min(2, "At least 2 characters").max(80, "Too long"),
  neighbourhood: z.string().min(2, "At least 2 characters").max(60, "Too long"),
  priceTier: z.string().min(1, "Select a price tier"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

const step2Schema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  borough: z.string().min(1, "Enter the borough"),
  postcodeDistrict: z.string().min(1, "Enter the postcode district (e.g. E8)"),
});

const step4Schema = z.object({
  description: z
    .string()
    .min(20, "At least 20 characters")
    .max(500, "Max 500 characters"),
});

// ─── Form state ──────────────────────────────────────────────────────────────

interface FormState {
  category: string;
  name: string;
  neighbourhood: string;
  priceTier: string;
  approxPriceGbp: string;
  latitude: number | null;
  longitude: number | null;
  borough: string;
  postcodeDistrict: string;
  photoFile: File | null;
  photoPreview: string | null;
  description: string;
  tips: string[];
  tags: string[];
  website: string;
}

const INITIAL: FormState = {
  category: "",
  name: "",
  neighbourhood: "",
  priceTier: "",
  approxPriceGbp: "",
  latitude: null,
  longitude: null,
  borough: "",
  postcodeDistrict: "",
  photoFile: null,
  photoPreview: null,
  description: "",
  tips: [],
  tags: [],
  website: "",
};

// ─── Step indicator ──────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  const labels = ["Basics", "Location", "Photo", "Details", "Review"];
  return (
    <div className="flex items-center gap-0 mb-8">
      {labels.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <React.Fragment key={n}>
            <div className="flex flex-col items-center gap-1 min-w-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-colors ${
                  done
                    ? "bg-[#1c1c1c] text-[#fcfbf8]"
                    : active
                    ? "bg-[#1c1c1c] text-[#fcfbf8] ring-4 ring-[#1c1c1c]/10"
                    : "bg-[#f7f4ed] border border-passive text-[#5f5f5d]"
                }`}
              >
                {done ? "✓" : n}
              </div>
              <span
                className={`text-[10px] font-medium uppercase tracking-wider hidden sm:block ${
                  active ? "text-[#1c1c1c]" : "text-[#5f5f5d]"
                }`}
              >
                {label}
              </span>
            </div>
            {i < total - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 mb-4 transition-colors ${
                  done ? "bg-[#1c1c1c]" : "bg-[#e8e4db]"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Step 1: Category + Basics ───────────────────────────────────────────────

function Step1({
  form,
  update,
  errors,
}: {
  form: FormState;
  update: (p: Partial<FormState>) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="t-h3 font-semibold text-[#1c1c1c] mb-1">What kind of spot is it?</h2>
        <p className="t-body text-[#5f5f5d]">Choose the category that fits best.</p>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {CATEGORY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => update({ category: opt.value })}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-colors ${
              form.category === opt.value
                ? "border-[#1c1c1c] bg-[#1c1c1c]/5"
                : "border-passive hover:border-[#1c1c1c]/30"
            }`}
          >
            <span className="text-2xl leading-none">{opt.emoji}</span>
            <span className="text-[10px] font-medium text-[#1c1c1c] leading-tight text-center">{opt.label}</span>
          </button>
        ))}
      </div>
      {errors.category && <p className="text-[12px] text-red-500">{errors.category}</p>}

      <div className="flex flex-col gap-1">
        <label className="text-[14px] font-medium text-[#1c1c1c]">Name</label>
        <Input
          value={form.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="e.g. E. Pellicci"
        />
        {errors.name && <p className="text-[12px] text-red-500">{errors.name}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[14px] font-medium text-[#1c1c1c]">Neighbourhood</label>
        <Input
          value={form.neighbourhood}
          onChange={(e) => update({ neighbourhood: e.target.value })}
          placeholder="e.g. Bethnal Green"
        />
        {errors.neighbourhood && (
          <p className="text-[12px] text-red-500">{errors.neighbourhood}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-medium text-[#1c1c1c]">Price tier</label>
        <div className="flex flex-wrap gap-2">
          {PRICE_TIERS.map((pt) => (
            <button
              key={pt.value}
              type="button"
              onClick={() => update({ priceTier: pt.value })}
              className={`flex flex-col items-center px-4 py-2 rounded-xl border transition-colors ${
                form.priceTier === pt.value
                  ? "border-[#1c1c1c] bg-[#1c1c1c] text-[#fcfbf8]"
                  : "border-passive hover:border-[#1c1c1c]/30 text-[#1c1c1c]"
              }`}
            >
              <span className="text-[15px] font-bold">{pt.label}</span>
              <span className="text-[10px] opacity-70">{pt.sub}</span>
            </button>
          ))}
        </div>
        {errors.priceTier && <p className="text-[12px] text-red-500">{errors.priceTier}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[14px] font-medium text-[#1c1c1c]">
          Approx. price (£){" "}
          <span className="font-normal text-[#5f5f5d]">— optional</span>
        </label>
        <Input
          type="number"
          min="0"
          value={form.approxPriceGbp}
          onChange={(e) => update({ approxPriceGbp: e.target.value })}
          placeholder="e.g. 8"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[14px] font-medium text-[#1c1c1c]">
          Website <span className="font-normal text-[#5f5f5d]">— optional</span>
        </label>
        <Input
          type="url"
          value={form.website}
          onChange={(e) => update({ website: e.target.value })}
          placeholder="https://..."
        />
        {errors.website && <p className="text-[12px] text-red-500">{errors.website}</p>}
      </div>
    </div>
  );
}

// ─── Step 2: Location ────────────────────────────────────────────────────────

function Step2({
  form,
  update,
  errors,
}: {
  form: FormState;
  update: (p: Partial<FormState>) => void;
  errors: Record<string, string>;
}) {
  const mapRef = React.useRef<any>(null);
  const [postcode, setPostcode] = useState("");
  const [postcodeError, setPostcodeError] = useState("");
  const [geocoding, setGeocoding] = useState(false);

  const reverseGeocode = useCallback(
    async (lat: number, lon: number) => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
          { headers: { "User-Agent": "BudgetUK/1.0" } }
        );
        const data = await res.json();
        const a = data.address || {};
        const raw = a.borough || a.city_district || a.suburb || a.county || "";
        const borough = raw.replace(/^London Borough of /i, "").replace(/ London$/i, "");
        const pc = (a.postcode || "").split(" ")[0];
        update({ borough, postcodeDistrict: pc });
      } catch {
        // allow manual entry
      }
    },
    [update]
  );

  const handleMapClick = useCallback(
    (e: { lngLat: { lat: number; lng: number } }) => {
      const { lat, lng } = e.lngLat;
      update({ latitude: lat, longitude: lng });
      reverseGeocode(lat, lng);
    },
    [update, reverseGeocode]
  );

  const handlePostcodeLookup = async () => {
    const pc = postcode.trim().toUpperCase();
    if (!pc) return;
    setPostcodeError("");
    setGeocoding(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(pc)}`);
      if (!res.ok) throw new Error("not found");
      const data = await res.json();
      const { lat, lng } = data;
      update({
        latitude: lat,
        longitude: lng,
      });
      mapRef.current?.flyTo({ center: [lng, lat], zoom: 16 });
      reverseGeocode(lat, lng);
    } catch {
      setPostcodeError("Postcode not found — try clicking the map instead.");
    } finally {
      setGeocoding(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="t-h3 font-semibold text-[#1c1c1c] mb-1">Where is it?</h2>
        <p className="t-body text-[#5f5f5d]">
          Enter a postcode or click the map to drop a pin. Drag to fine-tune.
        </p>
      </div>

      {/* Postcode search */}
      <div className="flex gap-2">
        <Input
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handlePostcodeLookup()}
          placeholder="e.g. E8 1EY"
          className="flex-1"
        />
        <Button
          type="button"
          variant="ghost"
          onClick={handlePostcodeLookup}
          disabled={geocoding}
          className="shrink-0"
        >
          {geocoding ? "..." : "Find"}
        </Button>
      </div>
      {postcodeError && <p className="text-[12px] text-red-500">{postcodeError}</p>}

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-passive" style={{ height: 340 }}>
        <LocationPickerMap 
          latitude={form.latitude}
          longitude={form.longitude}
          onMapClick={handleMapClick}
          onDragEnd={(e: any) => {
            const { lat, lng } = e.lngLat;
            update({ latitude: lat, longitude: lng });
            reverseGeocode(lat, lng);
          }}
          mapRef={mapRef}
          londonCenter={LONDON_CENTER}
          mapStyle={MAP_STYLE}
          londonBounds={LONDON_BOUNDS}
        />
      </div>
      {errors.latitude && (
        <p className="text-[12px] text-red-500">{errors.latitude}</p>
      )}

      {/* Borough + postcode district (auto-filled, editable) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[13px] font-medium text-[#1c1c1c]">Borough</label>
          <Input
            value={form.borough}
            onChange={(e) => update({ borough: e.target.value })}
            placeholder="e.g. Hackney"
          />
          {errors.borough && <p className="text-[12px] text-red-500">{errors.borough}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[13px] font-medium text-[#1c1c1c]">Postcode district</label>
          <Input
            value={form.postcodeDistrict}
            onChange={(e) => update({ postcodeDistrict: e.target.value.toUpperCase() })}
            placeholder="e.g. E8"
          />
          {errors.postcodeDistrict && (
            <p className="text-[12px] text-red-500">{errors.postcodeDistrict}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Photo ───────────────────────────────────────────────────────────

function Step3({
  form,
  update,
  onSkip,
}: {
  form: FormState;
  update: (p: Partial<FormState>) => void;
  onSkip: () => void;
}) {
  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const preview = URL.createObjectURL(file);
    update({ photoFile: file, photoPreview: preview });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="t-h3 font-semibold text-[#1c1c1c] mb-1">Add a photo</h2>
        <p className="t-body text-[#5f5f5d]">A good photo dramatically increases votes. JPEG or PNG, max 10 MB.</p>
      </div>

      <label
        className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-passive cursor-pointer hover:border-[#1c1c1c]/40 transition-colors overflow-hidden"
        style={{ minHeight: 220 }}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {form.photoPreview ? (
          <>
            <img
              src={form.photoPreview}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-[13px] font-medium">Change photo</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-12 px-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[#f7f4ed] flex items-center justify-center">
              <Upload className="w-5 h-5 text-[#5f5f5d]" />
            </div>
            <p className="text-[14px] font-medium text-[#1c1c1c]">
              Drag & drop or click to upload
            </p>
            <p className="text-[12px] text-[#5f5f5d]">JPEG, PNG — max 10 MB</p>
          </div>
        )}
      </label>

      {form.photoPreview && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => update({ photoFile: null, photoPreview: null })}
          className="text-[13px] text-red-500 underline underline-offset-4 self-start hover:bg-red-50"
        >
          Remove photo
        </Button>
      )}

      {!form.photoPreview && (
        <Button
          type="button"
          variant="ghost"
          onClick={onSkip}
          className="text-[13px] text-[#5f5f5d] underline underline-offset-4 self-start hover:bg-[#f7f4ed]"
        >
          Skip for now
        </Button>
      )}
    </div>
  );
}

// ─── Step 4: Description + Tips + Tags ───────────────────────────────────────

function Step4({
  form,
  update,
  errors,
}: {
  form: FormState;
  update: (p: Partial<FormState>) => void;
  errors: Record<string, string>;
}) {
  const [tipInput, setTipInput] = useState("");

  const addTip = () => {
    const t = tipInput.trim();
    if (!t || form.tips.length >= 5) return;
    update({ tips: [...form.tips, t] });
    setTipInput("");
  };

  const removeTip = (i: number) =>
    update({ tips: form.tips.filter((_, idx) => idx !== i) });

  const toggleTag = (tag: string) =>
    update({
      tags: form.tags.includes(tag)
        ? form.tags.filter((t) => t !== tag)
        : [...form.tags, tag],
    });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="t-h3 font-semibold text-[#1c1c1c] mb-1">Tell the community about it</h2>
        <p className="t-body text-[#5f5f5d]">The more detail you give, the better the votes.</p>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-baseline">
          <label className="text-[14px] font-medium text-[#1c1c1c]">Description</label>
          <span className="text-[12px] text-[#5f5f5d]">{form.description.length}/500</span>
        </div>
        <textarea
          value={form.description}
          onChange={(e) => update({ description: e.target.value })}
          rows={5}
          maxLength={500}
          placeholder="What makes this spot special? Be specific about prices, vibes, best days to visit…"
          className="w-full text-[14px] text-[#1c1c1c] placeholder:text-[#5f5f5d] border border-passive rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-[#1c1c1c] transition-colors bg-white"
        />
        {errors.description && (
          <p className="text-[12px] text-red-500">{errors.description}</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-[14px] font-medium text-[#1c1c1c]">
          Local tips <span className="font-normal text-[#5f5f5d]">— up to 5, optional</span>
        </label>
        <div className="flex gap-2">
          <Input
            value={tipInput}
            onChange={(e) => setTipInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTip())}
            placeholder="e.g. Go before 12pm to avoid queues"
            disabled={form.tips.length >= 5}
          />
          <Button
            type="button"
            variant="ghost"
            onClick={addTip}
            disabled={!tipInput.trim() || form.tips.length >= 5}
            className="shrink-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {form.tips.length > 0 && (
          <ul className="flex flex-col gap-1.5">
            {form.tips.map((tip, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-3 px-3 py-2 bg-[#f7f4ed] rounded-lg text-[13px] text-[#1c1c1c]"
              >
                <span className="flex-1">{tip}</span>
                <button
                  type="button"
                  onClick={() => removeTip(i)}
                  className="shrink-0 text-[#5f5f5d] hover:text-[#dc2626] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-[14px] font-medium text-[#1c1c1c]">
          Tags <span className="font-normal text-[#5f5f5d]">— optional</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {SPOT_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-[12px] font-medium border transition-colors ${
                form.tags.includes(tag)
                  ? "bg-[#1c1c1c] text-[#fcfbf8] border-[#1c1c1c]"
                  : "bg-white text-[#1c1c1c] border-passive hover:border-[#1c1c1c]/40"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 5: Review ──────────────────────────────────────────────────────────

function Step5({
  form,
  submitError,
}: {
  form: FormState;
  submitError: string;
}) {
  const cat = CATEGORY_OPTIONS.find((c) => c.value === form.category);
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="t-h3 font-semibold text-[#1c1c1c] mb-1">Review your submission</h2>
        <p className="t-body text-[#5f5f5d]">
          Once submitted, your spot enters the community queue and needs 25 votes to go live.
        </p>
      </div>

      <div className="bg-[#f7f4ed] rounded-xl border border-passive p-5 flex flex-col gap-4">
        {form.photoPreview && (
          <img
            src={form.photoPreview}
            alt="Preview"
            className="w-full h-40 object-cover rounded-lg"
          />
        )}

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{cat?.emoji}</span>
            <span className="text-[12px] uppercase tracking-wider font-bold text-[#5f5f5d]">
              {cat?.label}
            </span>
          </div>
          <h3 className="text-[18px] font-bold text-[#1c1c1c]">{form.name}</h3>
          <p className="text-[13px] text-[#5f5f5d]">
            {form.neighbourhood} ·{" "}
            {form.borough || form.postcodeDistrict} · {form.priceTier}
            {form.approxPriceGbp && ` (~£${form.approxPriceGbp})`}
          </p>
          {form.website && (
            <p className="text-[12px] text-[#5f5f5d] break-all underline decoration-passive">
              {form.website}
            </p>
          )}
        </div>

        <p className="text-[14px] text-[#1c1c1c] leading-relaxed">{form.description}</p>

        {form.tips.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] font-bold text-[#5f5f5d] uppercase tracking-wider">Tips</span>
            {form.tips.map((t, i) => (
              <p key={i} className="text-[13px] text-[#1c1c1c]">• {t}</p>
            ))}
          </div>
        )}

        {form.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {form.tags.map((t) => (
              <span
                key={t}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white border border-passive text-[#1c1c1c]"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {form.latitude && (
          <p className="text-[12px] text-[#5f5f5d]">
            📍 {form.latitude.toFixed(5)}, {form.longitude?.toFixed(5)} · {form.postcodeDistrict}
          </p>
        )}
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[13px] text-red-700">
          {submitError}
        </div>
      )}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function AddSpotPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const update = useCallback(
    (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch })),
    []
  );

  // Redirect unauthenticated users
  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/community/add");
    }
  }, [user, authLoading, router]);

  const validateStep = (s: typeof step): boolean => {
    const applyResult = (r: { success: boolean; error?: z.ZodError }): boolean => {
      if (!r.success) {
        const errs: Record<string, string> = {};
        for (const issue of r.error!.issues) {
          errs[String(issue.path[0])] = issue.message;
        }
        setErrors(errs);
        return false;
      }
      setErrors({});
      return true;
    };

    if (s === 1) {
      return applyResult(
        step1Schema.safeParse({
          category: form.category,
          name: form.name,
          neighbourhood: form.neighbourhood,
          priceTier: form.priceTier,
          website: form.website,
        })
      );
    }
    if (s === 2) {
      if (form.latitude === null) {
        setErrors({ latitude: "Drop a pin on the map" });
        return false;
      }
      return applyResult(
        step2Schema.safeParse({
          latitude: form.latitude,
          longitude: form.longitude!,
          borough: form.borough,
          postcodeDistrict: form.postcodeDistrict,
        })
      );
    }
    if (s === 4) {
      return applyResult(step4Schema.safeParse({ description: form.description }));
    }
    return true;
  };

  const goNext = () => {
    if (validateStep(step)) setStep((s) => (s + 1) as typeof step);
  };

  const goBack = () => {
    setErrors({});
    setStep((s) => (s - 1) as typeof step);
  };

  const handleSubmit = async () => {
    if (!user || !validateStep(4)) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      // Client-side cooldown check
      const q = query(
        collection(db, "submissions"),
        where("submittedBy", "==", user.uid),
        where("status", "==", "pending")
      );
      const snap = await getDocs(q);
      if (snap.size >= 3) {
        setSubmitError(
          "You already have 3 pending submissions. Wait for them to be reviewed."
        );
        setSubmitting(false);
        return;
      }

      // Upload photo if selected (using a temp ID for the storage path)
      let photoUrl: string | null = null;
      if (form.photoFile) {
        const tempId = crypto.randomUUID();
        photoUrl = await uploadSubmissionPhoto(form.photoFile, tempId);
      }

      // Get auth token for API route
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");

      // Submit via API (server enforces cooldown atomically)
      const res = await fetch("/api/community/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          neighbourhood: form.neighbourhood,
          priceTier: form.priceTier,
          approxPriceGbp: form.approxPriceGbp || null,
          latitude: form.latitude,
          longitude: form.longitude,
          borough: form.borough,
          postcodeDistrict: form.postcodeDistrict,
          photoUrl,
          description: form.description,
          tips: form.tips,
          tags: form.tags,
          website: form.website || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Submission failed. Please try again.");
        setSubmitting(false);
        return;
      }

      if (data.submissionId) {
        trackSpotSubmitted({ spotId: data.submissionId });
      }

      router.push("/community/thanks");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Submission failed. Please try again."
      );
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-4 border-passive border-t-[#1c1c1c] rounded-full animate-spin" />
        <span className="text-[#5f5f5d] text-sm animate-pulse">Loading identity...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <span className="text-[#5f5f5d] text-sm">Redirecting to login...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfbf8] pb-16">
      <main className="max-w-2xl mx-auto px-4 pt-10 pb-8">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-[#f7f4ed] transition-colors text-[#5f5f5d]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="t-h2 text-[#1c1c1c] tracking-tight">Submit a spot</h1>
        </div>

        <StepIndicator current={step} total={5} />

        <div className="bg-white rounded-2xl border border-passive p-6 shadow-sm">
          {step === 1 && <Step1 form={form} update={update} errors={errors} />}
          {step === 2 && <Step2 form={form} update={update} errors={errors} />}
          {step === 3 && (
            <Step3 form={form} update={update} onSkip={() => setStep(4)} />
          )}
          {step === 4 && <Step4 form={form} update={update} errors={errors} />}
          {step === 5 && <Step5 form={form} submitError={submitError} />}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex justify-between items-center gap-4">
          {step > 1 ? (
            <Button variant="ghost" onClick={goBack} className="flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <Button variant="primary" onClick={goNext}>
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={submitting}
              className="min-w-32"
            >
              {submitting ? "Submitting…" : "Submit spot"}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
