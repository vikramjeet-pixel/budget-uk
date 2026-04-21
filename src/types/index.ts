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

export type SpotStatus = "live" | "pending" | "rejected";

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
}

export interface User {
  uid?: string;
  displayName: string;
  photoUrl?: string;
  role: UserRole;
  createdAt: Timestamp;
  reputation: number;
  homeBorough: string | null;
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
