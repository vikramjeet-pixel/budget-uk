"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { ChevronUp, Check, Clock, PlusCircle, TrendingUp } from "lucide-react";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { useSubmissions } from "@/hooks/useSubmissions";
import { auth, db } from "@/lib/firebase/client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import type { Submission } from "@/types";

const VOTE_THRESHOLD = 25;

const CATEGORY_EMOJI: Record<string, string> = {
  food: "🍽️", coffee: "☕", housing: "🏠", workspace: "💻",
  gym: "💪", bars: "🍺", grocery: "🛒", accelerator: "🚀",
  vc: "💰", entertainment: "🎭", services: "✂️",
};

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  submission: Submission;
  submitterName: string;
  isOwnSubmission: boolean;
  hasVoted: boolean;
  isSubmitting: boolean;
  isLoggedIn: boolean;
  onUpvote: () => void;
}

function SubmissionCard({
  submission,
  submitterName,
  isOwnSubmission,
  hasVoted,
  isSubmitting,
  isLoggedIn,
  onUpvote,
}: CardProps) {
  const router = useRouter();
  const progress = Math.min((submission.voteCount / VOTE_THRESHOLD) * 100, 100);
  const createdDate =
    submission.createdAt?.toDate?.() ?? new Date();

  const handleVoteClick = () => {
    if (!isLoggedIn) {
      router.push("/login?redirect=/community");
      return;
    }
    onUpvote();
  };

  return (
    <Card className="overflow-hidden bg-[#f7f4ed] border-passive shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {/* Body */}
      <div className="flex gap-4 p-5">
        {/* Thumbnail */}
        <div className="h-24 w-24 shrink-0 rounded-lg overflow-hidden relative bg-passive">
          {submission.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={submission.photoUrl}
              alt={submission.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              {CATEGORY_EMOJI[submission.category] ?? "📍"}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg leading-none">{CATEGORY_EMOJI[submission.category] ?? "📍"}</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5f5f5d]">
              {submission.category}
            </span>
            <Badge variant="tier" className="ml-auto">
              {submission.priceTier}
            </Badge>
          </div>
          <h2 className="text-[17px] font-bold text-[#1c1c1c] leading-tight truncate">
            {submission.name}
          </h2>
          <p className="text-[13px] text-[#5f5f5d] truncate">
            {submission.neighbourhood}
            {submission.borough ? ` · ${submission.borough}` : ""}
          </p>
          <p className="text-[13px] text-[#1c1c1c] line-clamp-2 leading-relaxed">
            {submission.description}
          </p>
        </div>
      </div>

      {/* Thin progress bar */}
      <div className="h-1 bg-[#e8e4db] mx-5 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#1c1c1c] transition-all duration-700 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 px-5 py-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[12px] text-[#5f5f5d] truncate flex items-center gap-1">
            <Clock className="w-3 h-3 shrink-0" />
            {submitterName} · {timeAgo(createdDate)}
          </span>
          <span className="text-[13px] font-semibold text-[#1c1c1c]">
            {submission.voteCount}/{VOTE_THRESHOLD} votes
            {progress >= 100 && (
              <span className="ml-2 inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-700">
                <TrendingUp className="w-3 h-3" /> Threshold reached!
              </span>
            )}
          </span>
        </div>

        {/* Upvote button */}
        {isOwnSubmission ? (
          <button
            disabled
            className="shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold border border-passive text-[#5f5f5d] cursor-not-allowed opacity-60"
          >
            Your spot
          </button>
        ) : hasVoted ? (
          <button
            disabled
            className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-semibold bg-[#1c1c1c] text-[#fcfbf8] cursor-default"
          >
            <Check className="w-3.5 h-3.5" />
            Voted
          </button>
        ) : (
          <Button
            variant="primary"
            disabled={isSubmitting}
            onClick={handleVoteClick}
            className="shrink-0 px-3 py-1.5 h-auto text-[12px] font-semibold rounded-full flex items-center gap-1"
          >
            {isSubmitting ? (
              "Voting…"
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                Upvote
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

type SortKey = "newest" | "almost-there";

export default function CommunityPage() {
  const { user } = useAuthContext();
  const { submissions, loading } = useSubmissions();

  const [sort, setSort] = useState<SortKey>("newest");
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [submittingIds, setSubmittingIds] = useState<Set<string>>(new Set());
  const [userNames, setUserNames] = useState<Map<string, string>>(new Map());

  // Fetch this user's existing votes once on auth change.
  // When user is null, we simply don't populate votedIds; isLoggedIn guards the UI.
  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(db, "votes"), where("uid", "==", user.uid)))
      .then((snap) => {
        setVotedIds(
          new Set(snap.docs.map((d) => d.data().submissionId as string))
        );
      })
      .catch(console.error);
  }, [user]);

  // Fetch display names for submitters not yet loaded
  const fetchedUids = useRef(new Set<string>());
  useEffect(() => {
    const newUids = [
      ...new Set(submissions.map((s) => s.submittedBy)),
    ].filter((uid) => !fetchedUids.current.has(uid));

    if (newUids.length === 0) return;
    newUids.forEach((uid) => fetchedUids.current.add(uid));

    Promise.all(newUids.map((uid) => getDoc(doc(db, "users", uid)))).then(
      (docs) => {
        setUserNames((prev) => {
          const next = new Map(prev);
          docs.forEach((d, i) => {
            next.set(
              newUids[i],
              d.exists() ? (d.data()?.displayName as string) || "Anonymous" : "Anonymous"
            );
          });
          return next;
        });
      }
    );
  }, [submissions]);

  const sortedSubmissions = useMemo(() => {
    if (sort === "newest") return submissions;
    return [...submissions].sort((a, b) => b.voteCount - a.voteCount);
  }, [submissions, sort]);

  const handleUpvote = async (submissionId: string) => {
    if (!user) return;
    setSubmittingIds((prev) => new Set(prev).add(submissionId));
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/community/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ submissionId }),
      });
      if (res.ok) {
        setVotedIds((prev) => new Set(prev).add(submissionId));
      } else {
        const data = await res.json();
        console.error("Vote failed:", data.error);
      }
    } catch (err) {
      console.error("Vote error:", err);
    } finally {
      setSubmittingIds((prev) => {
        const s = new Set(prev);
        s.delete(submissionId);
        return s;
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbf8]">
      <main className="max-w-[800px] mx-auto px-4 py-12 md:py-20 mt-16">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="flex flex-col gap-2">
            <h1 className="t-h1 text-[#1c1c1c] tracking-tighter">Community Review</h1>
            <p className="t-body text-[#5f5f5d] max-w-[520px]">
              Help verify new budget spots. Spots with {VOTE_THRESHOLD}+ community votes are promoted
              to the main map.
            </p>
          </div>
          <Link href="/community/add">
            <Button variant="primary" className="py-4 h-auto px-6 shrink-0">
              <PlusCircle className="w-5 h-5 mr-2" />
              Submit a Spot
            </Button>
          </Link>
        </div>

        {/* Login nudge */}
        {!user && !loading && submissions.length > 0 && (
          <div className="mb-8 p-5 bg-[#1c1c1c] rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-white shadow-xl">
            <div className="flex flex-col gap-0.5">
              <span className="text-[16px] font-bold">Sign in to vote</span>
              <span className="text-[13px] text-white/70">
                Join the community to help map the best value spots in London.
              </span>
            </div>
            <Link href="/login?redirect=/community">
              <Button className="bg-white text-[#1c1c1c] hover:bg-[#f7f4ed] shrink-0">
                Log in
              </Button>
            </Link>
          </div>
        )}

        {/* Sort toggle */}
        {submissions.length > 0 && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-[13px] text-[#5f5f5d] font-medium mr-1">Sort:</span>
            {(["newest", "almost-there"] as SortKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setSort(key)}
                className={`px-4 py-1.5 rounded-full text-[12px] font-semibold border transition-colors ${
                  sort === key
                    ? "bg-[#1c1c1c] text-[#fcfbf8] border-[#1c1c1c]"
                    : "bg-white text-[#1c1c1c] border-passive hover:border-[#1c1c1c]/40"
                }`}
              >
                {key === "newest" ? "Newest first" : "Almost there"}
              </button>
            ))}
          </div>
        )}

        {/* Feed */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-[#f7f4ed] animate-pulse border border-passive" />
            ))}
          </div>
        ) : sortedSubmissions.length === 0 ? (
          <div className="flex flex-col items-center py-32 text-center bg-[#f7f4ed] rounded-3xl border border-dashed border-passive">
            <p className="text-xl font-bold text-[#1c1c1c]">No pending reviews</p>
            <p className="text-[#5f5f5d] mt-1 text-[14px]">
              Be the first to submit a budget spot in your area.
            </p>
            <Link href="/community/add" className="mt-6">
              <Button variant="primary">Submit a Spot</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {sortedSubmissions.map((sub) => (
              <SubmissionCard
                key={sub.id}
                submission={sub}
                submitterName={userNames.get(sub.submittedBy) ?? "…"}
                isOwnSubmission={user?.uid === sub.submittedBy}
                hasVoted={votedIds.has(sub.id!)}
                isSubmitting={submittingIds.has(sub.id!)}
                isLoggedIn={!!user}
                onUpvote={() => handleUpvote(sub.id!)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
