"use client";

import { useState } from "react";
import { 
  doc, 
  runTransaction, 
  increment, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuthContext } from "@/components/providers/AuthProvider";

export type VoteType = "yes" | "no" | "spam";

export function useVote() {
  const { user } = useAuthContext();
  const [votingIds, setVotingIds] = useState<Set<string>>(new Set());

  const castVote = async (submissionId: string, type: VoteType) => {
    if (!user) throw new Error("Must be logged in to vote");
    if (votingIds.has(submissionId)) return;

    setVotingIds(prev => new Set(prev).add(submissionId));

    try {
      const voteRef = doc(db, "votes", submissionId, "voters", user.uid);
      const submissionRef = doc(db, "submissions", submissionId);

      await runTransaction(db, async (transaction) => {
        const voteSnap = await transaction.get(voteRef);
        
        if (voteSnap.exists()) {
          throw new Error("You have already voted on this spot.");
        }

        // Record the vote
        transaction.set(voteRef, {
          type,
          uid: user.uid,
          createdAt: serverTimestamp()
        });

        // Increment total yes votes if applicable
        if (type === "yes") {
          transaction.update(submissionRef, {
            voteCount: increment(1),
            updatedAt: serverTimestamp()
          });
        }
      });

      return true;
    } catch (error: any) {
      console.error("Voting error:", error);
      throw error;
    } finally {
      // Note: We don't remove from votingIds immediately to prevent rapid double-voting 
      // until the next page refresh or local state update, or we can remove it.
      // For now, let's keep it until the next render cycle.
    }
  };

  return { castVote, isVoting: (id: string) => votingIds.has(id) };
}
