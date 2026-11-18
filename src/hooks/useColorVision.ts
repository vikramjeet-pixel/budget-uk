"use client";

import { useSyncExternalStore } from "react";
import {
  COLOR_VISION_ATTRIBUTE,
  COLOR_VISION_EVENT,
  COLOR_VISION_STORAGE_KEY,
  getColorVisionMode,
  isColorVisionMode,
  type ColorVisionMode,
} from "@/lib/colorVision";

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    // Keep other open tabs in sync.
    if (e.key !== COLOR_VISION_STORAGE_KEY) return;
    const next = isColorVisionMode(e.newValue) ? e.newValue : "default";
    document.documentElement.setAttribute(COLOR_VISION_ATTRIBUTE, next);
    onChange();
  };
  window.addEventListener(COLOR_VISION_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(COLOR_VISION_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** Re-renders whenever the colour-vision mode changes (this tab or another). */
export function useColorVision(): ColorVisionMode {
  return useSyncExternalStore(subscribe, getColorVisionMode, () => "default");
}
