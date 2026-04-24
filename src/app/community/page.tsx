"use client";

import * as React from "react";
import Link from "next/link";
import { Header } from "@/components/features/Header";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useVote, VoteType } from "@/hooks/useVote";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import { 
  Check, 
  X, 
  AlertTriangle, 
  PlusCircle, 
  ChevronRight,
  TrendingUp,
  MessageSquare,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_EMOJIS: Record<string, string> = {
  food: "🍽️",
  coffee: "☕",
  housing: "🏠",
  workspace: "💻",
  gym: "💪",
  bars: "🍺",
  grocery: "🛒",
  accelerator: "🚀",
  vc: "💰",
  entertainment: "🎭",
  services: "✂️",
  free: "🎟️"
};

const VOTE_THRESHOLD = 50;

function SubmissionCard({ submission, onVote, isVoting, hasVoted }: { 
  submission: any, 
  onVote: (id: string, type: VoteType) => void,
  isVoting: boolean,
  hasVoted: boolean
}) {
  const progress = Math.min((submission.voteCount / VOTE_THRESHOLD) * 100, 100);

  return (
    <Card className="flex flex-col overflow-hidden bg-[#f7f4ed] border-[var(--border-passive)] shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6 md:p-8 flex flex-col gap-6">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{CATEGORY_EMOJIS[submission.category] || "📍"}</span>
              <Badge variant="category" className="bg-white/50">{submission.category}</Badge>
            </div>
            <h2 className="t-h2 text-[#1c1c1c] tracking-tight">{submission.name}</h2>
            <div className="flex items-center gap-2 text-[14px] text-[#5f5f5d]">
              <span className="font-medium text-[#1c1c1c]">{submission.neighbourhood}</span>
              <span>•</span>
              <span>{submission.borough}</span>
              <span>•</span>
              <Badge variant="tier" className="px-1 py-0 h-auto text-[10px]">{submission.priceTier}</Badge>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <span className="text-[12px] text-[#5f5f5d] flex items-center gap-1 uppercase tracking-wider font-bold">
              <Clock className="w-3 h-3" /> Submitted {new Date(submission.createdAt?.toDate?.() || Date.now()).toLocaleDateString('en-GB')}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="t-body text-[#1c1c1c] line-clamp-3 leading-relaxed">
          {submission.description}
        </p>

        {/* Voting Progress */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-baseline">
            <span className="text-[13px] font-bold text-[#1c1c1c]">Community Verification</span>
            <span className="text-[13px] font-medium text-[#5f5f5d]">{submission.voteCount} / {VOTE_THRESHOLD} votes</span>
          </div>
          <div className="w-full h-3 bg-white rounded-full border border-[var(--border-passive)] overflow-hidden shadow-inner">
            <div 
              className="h-full bg-[#1c1c1c] transition-all duration-1000 ease-out" 
              style={{ width: `${progress}%` }} 
            />
          </div>
          {progress >= 100 && (
            <span className="text-[11px] text-[#1c1c1c] font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Threshold reached! Awaiting moderator final check.
            </span>
          )}
        </div>

        <hr className="border-[var(--border-passive)]" />

        {/* Voting Actions */}
        <div className="flex flex-col gap-4">
          <span className="text-[14px] font-bold text-[#1c1c1c]">Is this a real budget spot?</span>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="ghost"
              onClick={() => onVote(submission.id, "yes")}
              disabled={isVoting || hasVoted}
              className={cn(
                "flex-grow md:flex-grow-0 justify-center py-5 h-auto rounded-xl border border-[var(--border-interactive)]",
                hasVoted && "opacity-50 grayscale"
              )}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-xl">💰</span>
                <span className="text-[11px] font-bold uppercase">Yes, budget</span>
              </div>
            </Button>

            <Button 
              variant="ghost"
              onClick={() => onVote(submission.id, "no")}
              disabled={isVoting || hasVoted}
              className={cn(
                "flex-grow md:flex-grow-0 justify-center py-5 h-auto rounded-xl border border-[var(--border-passive)] hover:bg-red-50 hover:text-red-700 hover:border-red-200",
                hasVoted && "opacity-50 grayscale"
              )}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-xl">❌</span>
                <span className="text-[11px] font-bold uppercase">No, expensive</span>
              </div>
            </Button>

            <Button 
              variant="ghost"
              onClick={() => onVote(submission.id, "spam")}
              disabled={isVoting || hasVoted}
              className={cn(
                "flex-grow md:flex-grow-0 justify-center py-5 h-auto rounded-xl border border-[var(--border-passive)] hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200",
                hasVoted && "opacity-50 grayscale"
              )}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-xl">🛑</span>
                <span className="text-[11px] font-bold uppercase">Spam/Fake</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function CommunityPage() {
  const { user } = useAuthContext();
  const { submissions, loading } = useSubmissions();
  const { castVote, isVoting } = useVote();
  const [localVotedIds, setLocalVotedIds] = React.useState<Set<string>>(new Set());

  const handleVote = async (id: string, type: VoteType) => {
    if (!user) return;
    try {
      await castVote(id, type);
      setLocalVotedIds(prev => new Set(prev).add(id));
    } catch (err: any) {
      alert(err.message || "Failed to cast vote");
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbf8]">
      <Header />
      
      <main className="max-w-[800px] mx-auto px-4 py-12 md:py-20 mt-16">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex flex-col gap-3">
            <h1 className="t-h1 text-[#1c1c1c] tracking-tighter">Community Review</h1>
            <p className="t-body text-[#5f5f5d] max-w-[500px]">
              You have the final say. Help us verify new budget spots or flag the imposters. 
              Spots with 50+ community votes are promoted to the main map.
            </p>
          </div>

          <Link href="/community/add">
            <Button variant="primary" className="py-4 h-auto px-6">
              <PlusCircle className="w-5 h-5 mr-2" />
              Submit a Spot
            </Button>
          </Link>
        </div>

        {/* Logged in Check */}
        {!user && (
          <div className="mb-12 p-6 bg-[#1c1c1c] rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 text-white shadow-xl">
            <div className="flex flex-col gap-1">
              <span className="text-lg font-bold">You need to be logged in to vote</span>
              <span className="text-[14px] text-white/70">Join the community to help us map the best value spots in London.</span>
            </div>
            <Link href="/login?redirect=/community">
              <Button className="bg-white text-[#1c1c1c] hover:bg-[#f7f4ed]">Log in to Vote <ChevronRight className="w-4 h-4 ml-2" /></Button>
            </Link>
          </div>
        )}

        {/* Feed */}
        <div className="flex flex-col gap-8">
          {loading ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-[var(--border-passive)] border-t-[#1c1c1c] rounded-full animate-spin" />
              <span className="text-[#5f5f5d] font-medium">Scanning community signals...</span>
            </div>
          ) : submissions.length === 0 ? (
            <div className="flex flex-col items-center py-32 text-center bg-[#f7f4ed] rounded-3xl border border-dashed border-[var(--border-interactive)]">
              <MessageSquare className="w-12 h-12 text-[#5f5f5d] mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-[#1c1c1c]">No pending reviews</h3>
              <p className="text-[#5f5f5d] mt-1">Be the first to submit a budget favorite in your area.</p>
              <Link href="/community/add" className="mt-6">
                <Button variant="primary">Submit a Spot</Button>
              </Link>
            </div>
          ) : (
            submissions.map((submission) => (
              <SubmissionCard 
                key={submission.id} 
                submission={submission}
                onVote={handleVote}
                isVoting={isVoting(submission.id!)}
                hasVoted={localVotedIds.has(submission.id!)}
              />
            ))
          )}
        </div>

      </main>
    </div>
  );
}
