/**
 * Colour-vision accessibility modes.
 *
 * These modes REMAP problematic colours into palettes that stay distinguishable
 * for each type of colour-vision deficiency. They intentionally do NOT simulate
 * colour blindness (no feColorMatrix filters) — simulation is for designers,
 * not for colour-blind users.
 *
 * The active mode lives on <html data-vision="..."> so plain CSS (globals.css)
 * can react to it, and is persisted in localStorage.
 */

import type { Category } from "@/types";

/* -------------------------------------------------------------------------- */
/*                                   Modes                                    */
/* -------------------------------------------------------------------------- */

export const COLOR_VISION_MODES = [
  "default",
  "deuteranomaly",
  "protanomaly",
  "deuteranopia",
  "protanopia",
  "tritanomaly",
  "tritanopia",
  "achromatopsia",
] as const;

export type ColorVisionMode = (typeof COLOR_VISION_MODES)[number];

/** Palette families — modes in the same group share a palette. */
export type VisionGroup = "default" | "red-green" | "blue-yellow" | "mono";

export interface ColorVisionOption {
  value: ColorVisionMode;
  label: string;
  description: string;
  group: VisionGroup;
}

export const COLOR_VISION_OPTIONS: readonly ColorVisionOption[] = [
  { value: "default",       label: "Default Vision", description: "Standard Cream & Charcoal",          group: "default" },
  { value: "deuteranomaly", label: "Deuteranomaly",  description: "Green-weak — most common",           group: "red-green" },
  { value: "protanomaly",   label: "Protanomaly",    description: "Red-weak",                           group: "red-green" },
  { value: "deuteranopia",  label: "Deuteranopia",   description: "Green-blind",                        group: "red-green" },
  { value: "protanopia",    label: "Protanopia",     description: "Red-blind",                          group: "red-green" },
  { value: "tritanomaly",   label: "Tritanomaly",    description: "Blue-weak",                          group: "blue-yellow" },
  { value: "tritanopia",    label: "Tritanopia",     description: "Blue-blind",                         group: "blue-yellow" },
  { value: "achromatopsia", label: "Achromatopsia",  description: "Complete grayscale / monochromacy",  group: "mono" },
];

export const VISION_GROUP: Record<ColorVisionMode, VisionGroup> = Object.fromEntries(
  COLOR_VISION_OPTIONS.map((o) => [o.value, o.group])
) as Record<ColorVisionMode, VisionGroup>;

/** Preview swatches (accent / danger / success) shown in the dropdown. */
export const VISION_GROUP_SWATCHES: Record<VisionGroup, [string, string, string]> = {
  default:       ["#2D5A4C", "#DC2626", "#16A34A"],
  "red-green":   ["#1D4ED8", "#D55E00", "#0072B2"],
  "blue-yellow": ["#0F766E", "#BE123C", "#0E7490"],
  mono:          ["#1C1C1C", "#FFFFFF", "#404040"],
};

/* -------------------------------------------------------------------------- */
/*                         Persistence + change events                        */
/* -------------------------------------------------------------------------- */

export const COLOR_VISION_STORAGE_KEY = "color-vision-mode";
export const COLOR_VISION_EVENT = "color-vision-change";
export const COLOR_VISION_ATTRIBUTE = "data-vision";

export function isColorVisionMode(value: unknown): value is ColorVisionMode {
  return typeof value === "string" && (COLOR_VISION_MODES as readonly string[]).includes(value);
}

export function getColorVisionMode(): ColorVisionMode {
  if (typeof document === "undefined") return "default";
  const attr = document.documentElement.getAttribute(COLOR_VISION_ATTRIBUTE);
  return isColorVisionMode(attr) ? attr : "default";
}

export function setColorVisionMode(mode: ColorVisionMode) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute(COLOR_VISION_ATTRIBUTE, mode);
  try {
    localStorage.setItem(COLOR_VISION_STORAGE_KEY, mode);
  } catch {
    /* storage may be unavailable (private mode) — attribute still applies */
  }
  window.dispatchEvent(new CustomEvent<ColorVisionMode>(COLOR_VISION_EVENT, { detail: mode }));
}

// The React hook lives in src/hooks/useColorVision.ts so this module stays
// importable from server components (e.g. layout.tsx uses the init script).

/**
 * Inline script for <head>: applies the saved mode before first paint so there
 * is no flash of the default palette.
 */
export const COLOR_VISION_INIT_SCRIPT = `(function(){try{var m=localStorage.getItem(${JSON.stringify(
  COLOR_VISION_STORAGE_KEY
)});var ok=${JSON.stringify(COLOR_VISION_MODES)};document.documentElement.setAttribute(${JSON.stringify(
  COLOR_VISION_ATTRIBUTE
)},ok.indexOf(m)>-1?m:"default");}catch(e){}})();`;

/* -------------------------------------------------------------------------- */
/*                               Map pin themes                               */
/* -------------------------------------------------------------------------- */

/** All map pin categories (spot categories + the "free" price-tier pin). */
export type PinCategory = Category | "free";

export const PIN_CATEGORIES: readonly PinCategory[] = [
  "food", "housing", "student-housing", "workspace", "coffee", "accelerator", "vc",
  "gym", "bars", "grocery", "entertainment", "vintage", "services", "free",
];

export const PIN_CATEGORY_LABELS: Record<PinCategory, string> = {
  food: "Food",
  housing: "Housing",
  "student-housing": "Student Housing",
  workspace: "Work Spaces",
  coffee: "Coffee",
  accelerator: "Accelerators",
  vc: "VCs",
  gym: "Gym",
  bars: "Bars",
  grocery: "Grocery",
  entertainment: "Entertainment",
  vintage: "Vintage",
  services: "Services",
  free: "Free",
};

export interface PinStyle {
  /** Marker fill. */
  bg: string;
  /** Marker border colour. */
  border: string;
  /** Icon colour — chosen for contrast against `bg`. */
  fg: string;
  /** Extra non-colour cue for modes where shades repeat. */
  borderStyle?: "solid" | "dashed";
}

const DARK = "#1C1C1C";
const LIGHT = "#FFFFFF";

/** WCAG relative luminance of a #RRGGBB colour. */
function luminance(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

/** Pick whichever of charcoal/white has the higher contrast with `bg`. */
function contrastFg(bg: string) {
  const L = luminance(bg);
  const vsDark = (L + 0.05) / (luminance(DARK) + 0.05);
  const vsLight = (luminance(LIGHT) + 0.05) / (L + 0.05);
  return vsDark >= vsLight ? DARK : LIGHT;
}

const pin = (bg: string, border = LIGHT, opts: Partial<PinStyle> = {}): PinStyle => ({
  bg,
  border,
  fg: opts.fg ?? contrastFg(bg),
  borderStyle: opts.borderStyle ?? "solid",
});

type PinTheme = Record<PinCategory, PinStyle>;

const DEFAULT_PINS: PinTheme = {
  food:              pin("#EF4444"),
  housing:           pin("#10B981"),
  "student-housing": pin("#6366F1"),
  workspace:         pin("#0EA5E9"),
  coffee:            pin("#7C2D12"),
  accelerator:       pin("#F59E0B"),
  vc:                pin("#8B5CF6"),
  gym:               pin("#1C1C1C"),
  bars:              pin("#F43F5E"),
  grocery:           pin("#0D9488"),
  entertainment:     pin("#D946EF"),
  vintage:           pin("#78350F"),
  services:          pin("#64748B"),
  free:              pin("#22C55E"),
};

/** Okabe-Ito based, high luminance variance — safe for protan & deutan vision. */
const RED_GREEN_PINS: PinTheme = {
  food:              pin("#D55E00"),
  housing:           pin("#0072B2"),
  "student-housing": pin("#56B4E9"),
  workspace:         pin("#1E3A8A"),
  coffee:            pin("#6B3E26"),
  accelerator:       pin("#E69F00"),
  vc:                pin("#7C3AED"),
  gym:               pin("#1C1C1C"),
  bars:              pin("#CC79A7"),
  grocery:           pin("#009E73"),
  entertainment:     pin("#F0E442", DARK),
  vintage:           pin("#92400E"),
  services:          pin("#475569"),
  free:              pin("#FFFFFF", DARK),
};

/**
 * Tritan-safe: reds, roses, teals, cyans, charcoals and white "outline" pins.
 * Avoids yellow, indigo and purple which collapse together for tritan vision.
 */
const BLUE_YELLOW_PINS: PinTheme = {
  food:              pin("#DC2626"),
  housing:           pin("#0F766E"),
  "student-housing": pin("#F9A8D4"),
  workspace:         pin("#155E75"),
  coffee:            pin("#57261A"),
  accelerator:       pin("#67E8F9"),
  vc:                pin("#881337"),
  gym:               pin("#1C1C1C"),
  bars:              pin("#FFFFFF", "#E11D48", { fg: "#BE123C" }),
  grocery:           pin("#2DD4BF"),
  entertainment:     pin("#FFFFFF", "#0E7490", { fg: "#0E7490" }),
  vintage:           pin("#A8A29E"),
  services:          pin("#52525B"),
  free:              pin("#FFFFFF", DARK),
};

/**
 * Monochrome: distinct luminance steps + black/white borders. Where a shade
 * repeats, the border style (dashed) and the category icon disambiguate.
 */
const MONO_PINS: PinTheme = {
  food:              pin("#000000", LIGHT),
  housing:           pin("#262626", LIGHT),
  "student-housing": pin("#404040", LIGHT),
  workspace:         pin("#595959", LIGHT),
  coffee:            pin("#737373", "#000000"),
  accelerator:       pin("#8C8C8C", "#000000"),
  vc:                pin("#A6A6A6", "#000000"),
  gym:               pin("#000000", LIGHT, { borderStyle: "dashed" }),
  bars:              pin("#BFBFBF", "#000000"),
  grocery:           pin("#D9D9D9", "#000000"),
  entertainment:     pin("#FFFFFF", "#000000"),
  vintage:           pin("#404040", LIGHT, { borderStyle: "dashed" }),
  services:          pin("#8C8C8C", "#000000", { borderStyle: "dashed" }),
  free:              pin("#FFFFFF", "#000000", { borderStyle: "dashed" }),
};

export const MAP_PIN_THEMES: Record<ColorVisionMode, PinTheme> = {
  default:       DEFAULT_PINS,
  deuteranomaly: RED_GREEN_PINS,
  protanomaly:   RED_GREEN_PINS,
  deuteranopia:  RED_GREEN_PINS,
  protanopia:    RED_GREEN_PINS,
  tritanomaly:   BLUE_YELLOW_PINS,
  tritanopia:    BLUE_YELLOW_PINS,
  achromatopsia: MONO_PINS,
};

export function getPinStyle(mode: ColorVisionMode, category: string): PinStyle {
  const theme = MAP_PIN_THEMES[mode];
  return theme[category as PinCategory] ?? theme.gym;
}

/* -------------------------------------------------------------------------- */
/*                               Map base themes                              */
/* -------------------------------------------------------------------------- */

export interface MapBasePalette {
  land: string;
  landAlt: string;
  park: string;
  water: string;
  waterLine: string;
  building: string;
  roadMajor: string;
  roadMajorCasing: string;
  roadSecondary: string;
  roadMinor: string;
  roadMinorCasing: string;
  rail: string;
  boundary: string;
  label: string;
  labelHalo: string;
  waterLabel: string;
  waterHalo: string;
}

export const MAP_BASE_THEMES: Record<VisionGroup, MapBasePalette> = {
  default: {
    land: "#F7F4ED",
    landAlt: "#EFECE4",
    park: "#D6E5C6",
    water: "#A3CDE8",
    waterLine: "#7FB5D9",
    building: "#E5E0D5",
    roadMajor: "#F3C969",
    roadMajorCasing: "#D9A74A",
    roadSecondary: "#FAE5A8",
    roadMinor: "#FCFBF8",
    roadMinorCasing: "#DEDAD0",
    rail: "#B8B3A8",
    boundary: "#9E9A90",
    label: "#1C1C1C",
    labelHalo: "#FCFBF8",
    waterLabel: "#2B5B7A",
    waterHalo: "#E6F2FA",
  },
  "red-green": {
    land: "#F7F4ED",
    landAlt: "#EDE9DF",
    park: "#EAE0C0",
    water: "#89C4F4",
    waterLine: "#4B9CD3",
    building: "#E2DDD2",
    roadMajor: "#F5B041",
    roadMajorCasing: "#C87D12",
    roadSecondary: "#FDE2B0",
    roadMinor: "#FCFBF8",
    roadMinorCasing: "#D5D0C5",
    rail: "#8E8A80",
    boundary: "#78746C",
    label: "#1C1C1C",
    labelHalo: "#FCFBF8",
    waterLabel: "#0B4F7C",
    waterHalo: "#EBF5FB",
  },
  "blue-yellow": {
    land: "#F7F4ED",
    landAlt: "#EFEAE4",
    park: "#CBECE5",
    water: "#76D7EA",
    waterLine: "#26A6B5",
    building: "#E4DFD7",
    roadMajor: "#F7A1B0",
    roadMajorCasing: "#C95B72",
    roadSecondary: "#FCD5DC",
    roadMinor: "#FCFBF8",
    roadMinorCasing: "#D6D1C8",
    rail: "#8F888A",
    boundary: "#7A7274",
    label: "#1C1C1C",
    labelHalo: "#FCFBF8",
    waterLabel: "#0E5A66",
    waterHalo: "#E6FAFC",
  },
  mono: {
    land: "#F5F5F5",
    landAlt: "#EBEBEB",
    park: "#DDDDDD",
    water: "#B0B0B0",
    waterLine: "#808080",
    building: "#E2E2E2",
    roadMajor: "#FFFFFF",
    roadMajorCasing: "#404040",
    roadSecondary: "#FAFAFA",
    roadMinor: "#FFFFFF",
    roadMinorCasing: "#999999",
    rail: "#737373",
    boundary: "#595959",
    label: "#141414",
    labelHalo: "#FFFFFF",
    waterLabel: "#1C1C1C",
    waterHalo: "#E5E5E5",
  },
};

export interface MapLibreStyleLayer {
  id: string;
  type: string;
  layout?: unknown;
}

export interface MapLibreLike {
  getStyle?: () => { layers?: MapLibreStyleLayer[] } | undefined;
  setPaintProperty?: (layerId: string, name: string, value: unknown) => void;
}

export function applyMapBaseTheme(
  map: MapLibreLike | null | undefined,
  mode: ColorVisionMode,
  isSatellite = false
) {
  if (!map || typeof map.getStyle !== "function" || typeof map.setPaintProperty !== "function") return;
  try {
    const style = map.getStyle();
    if (!style?.layers) return;

    const p = MAP_BASE_THEMES[VISION_GROUP[mode]];
    const setPaint = (id: string, prop: string, val: string) => {
      try {
        map.setPaintProperty?.(id, prop, val);
      } catch {
        /* ignore layers whose paint schema differs (e.g. pattern-only fills) */
      }
    };

    for (const layer of style.layers) {
      const id = layer.id;
      const lid = id.toLowerCase();

      if (layer.type === "background") {
        setPaint(id, "background-color", p.land);
      } else if (layer.type === "fill") {
        if (/water|ocean|river|lake|basin|swimming|reservoir/.test(lid)) {
          setPaint(id, "fill-color", p.water);
        } else if (/park|grass|wood|forest|nature|green|vegetation|cemetery|golf|pitch|playground|garden|meadow|scrub/.test(lid)) {
          setPaint(id, "fill-color", p.park);
        } else if (/building/.test(lid)) {
          setPaint(id, "fill-color", p.building);
        } else if (/landuse|landcover|residential|commercial|industrial|retail|hospital|school|university|stadium|sand|beach|glacier|ice/.test(lid)) {
          setPaint(id, "fill-color", p.landAlt);
        }
      } else if (layer.type === "fill-extrusion") {
        if (/building/.test(lid)) {
          setPaint(id, "fill-extrusion-color", p.building);
        }
      } else if (layer.type === "line") {
        const isCasing = /casing|outline/.test(lid);
        if (/water|river|stream|canal|drain|ditch/.test(lid)) {
          setPaint(id, "line-color", p.waterLine);
        } else if (/boundary|border|admin/.test(lid)) {
          setPaint(id, "line-color", p.boundary);
        } else if (/rail|transit|ferry|aeroway/.test(lid)) {
          setPaint(id, "line-color", p.rail);
        } else if (/motorway|trunk|primary|highway/.test(lid)) {
          setPaint(id, "line-color", isCasing ? p.roadMajorCasing : p.roadMajor);
        } else if (/secondary|tertiary/.test(lid)) {
          setPaint(id, "line-color", isCasing ? p.roadMinorCasing : p.roadSecondary);
        } else if (/road|street|service|path|track|pedestrian|footway|cycleway|bridge|tunnel|link/.test(lid)) {
          setPaint(id, "line-color", isCasing ? p.roadMinorCasing : p.roadMinor);
        }
      } else if (layer.type === "symbol") {
        const hasTextField =
          typeof layer.layout === "object" &&
          layer.layout !== null &&
          "text-field" in layer.layout &&
          Boolean((layer.layout as Record<string, unknown>)["text-field"]);
        if (hasTextField) {
          if (isSatellite) {
            setPaint(id, "text-color", "#FFFFFF");
            setPaint(id, "text-halo-color", "#1C1C1C");
          } else if (/water|ocean|sea|river|lake/.test(lid)) {
            setPaint(id, "text-color", p.waterLabel);
            setPaint(id, "text-halo-color", p.waterHalo);
          } else {
            setPaint(id, "text-color", p.label);
            setPaint(id, "text-halo-color", p.labelHalo);
          }
        }
      }
    }
  } catch {
    /* ignore style updates while map is tearing down */
  }
}
