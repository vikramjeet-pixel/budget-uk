import type { GeoPoint, Timestamp } from "firebase/firestore";

export type Category = 
  | "food"
  | "housing"
  | "coffee"
  | "workspace"
  | "gym"
  | "bars"
  | "grocery"
  | "accelerator"
  | "vc"
  | "entertainment"
  | "services";

export type PriceTier = "free" | "£" | "££" | "£££" | "££££";

export type SpotStatus = "live" | "pending" | "rejected" | "removed";

export type UserRole = "user" | "moderator" | "admin";

export interface Spot {
  id?: string;
  name: string;
  slug: string;
  category: Category;
  neighbourhood: string;
  borough: string;
  postcodeDistrict: string;
  city: "london";
  location: GeoPoint;
  geohash: string;
  priceTier: PriceTier;
  approxPriceGbp?: number;
  tags: string[];
  googlePlaceId: string | null;
  photoUrl?: string;
  description: string;
  tips: string[];
  status: SpotStatus;
  submittedBy: string;
  voteCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  /** Populated from Google Places weekday_text when synced (e.g. "Monday: 10:00 AM – 5:30 PM") */
  openingHoursText?: string[];
}

export interface User {
  uid?: string;
  displayName: string;
  photoUrl?: string;
  role: UserRole;
  createdAt: Timestamp;
  reputation: number;
  homeBorough: string | null;
  favouritesPublic?: boolean;
}

export interface Submission {
  id?: string;
  name: string;
  slug: string;
  category: Category;
  neighbourhood: string;
  borough: string;
  postcodeDistrict: string;
  city: "london";
  location: GeoPoint;
  geohash: string;
  priceTier: PriceTier;
  approxPriceGbp?: number;
  tags: string[];
  googlePlaceId: string | null;
  photoUrl?: string;
  description: string;
  tips: string[];
  status: SpotStatus;
  submittedBy: string;
  voters: string[];
  voteCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Favourite {
  savedAt: Timestamp;
  note?: string;
}

export interface Vote {
  createdAt: Timestamp;
}

export interface Report {
  id?: string;
  spotId: string;
  spotName: string;
  reportedBy: string;
  reason: string;
  createdAt: Timestamp;
}
