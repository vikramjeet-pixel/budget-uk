import type { Spot } from "@/types";

/**
 * Generates a Google Maps directions URL for a given spot.
 * Logic:
 * 1. If googlePlaceId is available, uses the place_id specific query.
 * 2. Otherwise, constructs a full address search query.
 */
export function getDirectionsUrl(spot: Spot): string {
  if (spot.googlePlaceId) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name)}&query_place_id=${spot.googlePlaceId}`;
  }

  // Fallback: Construct address string
  // Franco Manca Brixton London SW9
  const address = `${spot.name} ${spot.neighbourhood} London ${spot.postcodeDistrict || ""}`.trim();
  
  // URL-encode and replace %20 with + for readability as requested
  const encodedAddress = encodeURIComponent(address).replace(/%20/g, "+");
  
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
}
