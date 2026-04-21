"use client";

import { useState } from "react";
import { 
  doc, 
  writeBatch, 
  serverTimestamp, 
  collection 
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Submission, Spot } from "@/types";

export function useAdminActions() {
  const [loading, setLoading] = useState(false);

  const approveSubmission = async (submission: Submission) => {
    if (!submission.id) return;
    setLoading(true);

    try {
      const batch = writeBatch(db);

      // 1. Generate unique slug if not present or needs refresh
      const slug = submission.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      // 2. Create new Spot document
      const spotRef = doc(collection(db, "spots"));
      const newSpot: Spot = {
        name: submission.name,
        slug: slug,
        category: submission.category,
        neighbourhood: submission.neighbourhood,
        borough: submission.borough,
        postcodeDistrict: submission.postcodeDistrict,
        city: submission.city,
        location: submission.location,
        geohash: submission.geohash,
        priceTier: submission.priceTier,
        approxPriceGbp: submission.approxPriceGbp,
        tags: submission.tags,
        googlePlaceId: submission.googlePlaceId,
        photoUrl: submission.photoUrl,
        description: submission.description,
        tips: submission.tips,
        status: "live",
        submittedBy: submission.submittedBy,
        voteCount: submission.voteCount,
        createdAt: submission.createdAt,
        updatedAt: serverTimestamp() as any,
      };

      batch.set(spotRef, newSpot);

      // 3. Update Submission status
      const submissionRef = doc(db, "submissions", submission.id);
      batch.update(submissionRef, {
        status: "live", // Mark as live in submissions too for record
        updatedAt: serverTimestamp()
      });

      await batch.commit();
      return true;
    } catch (error) {
      console.error("Approval error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const rejectSubmission = async (submissionId: string) => {
    setLoading(true);
    try {
      const submissionRef = doc(db, "submissions", submissionId);
      await writeBatch(db)
        .update(submissionRef, {
          status: "rejected",
          updatedAt: serverTimestamp()
        })
        .commit();
      return true;
    } catch (error) {
      console.error("Rejection error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSubmission = async (id: string, data: Partial<Submission>) => {
    setLoading(true);
    try {
      const submissionRef = doc(db, "submissions", id);
      await writeBatch(db)
        .update(submissionRef, {
          ...data,
          updatedAt: serverTimestamp()
        })
        .commit();
      return true;
    } catch (error) {
      console.error("Update error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { approveSubmission, rejectSubmission, updateSubmission, loading };
}
