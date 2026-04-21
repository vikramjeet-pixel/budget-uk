"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/features/Header";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useAdminActions } from "@/hooks/useAdminActions";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { 
  Check, 
  X, 
  Edit3, 
  Eye, 
  Search, 
  AlertCircle,
  MoreVertical
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ModeratorPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();
  const { submissions, loading: dataLoading } = useSubmissions("pending");
  const { approveSubmission, rejectSubmission, loading: actionLoading } = useAdminActions();
  const [searchTerm, setSearchTerm] = React.useState("");

  // Role Protection
  React.useEffect(() => {
    if (!authLoading && (!user || (user.role !== "admin" && user.role !== "moderator"))) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const filteredSubmissions = submissions.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.borough.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || (!user || (user.role !== "admin" && user.role !== "moderator"))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfbf8]">
        <div className="w-8 h-8 border-4 border-[var(--border-passive)] border-t-[#1c1c1c] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfbf8]">
      <Header />
      
      <main className="max-w-[1200px] mx-auto px-4 py-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="flex flex-col gap-2">
            <h1 className="t-h1 text-[#1c1c1c] tracking-tighter">Moderator Queue</h1>
            <p className="t-body text-[#5f5f5d]">Review and manage community-submitted budget spots.</p>
          </div>
          
          <div className="relative w-full md:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5f5f5d]" />
            <Input 
              placeholder="Search submissions..."
              className="pl-9 bg-white border-[var(--border-passive)] rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[var(--border-passive)] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f7f4ed] border-b border-[var(--border-passive)]">
                  <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider text-[#5f5f5d]">Spot Name</th>
                  <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider text-[#5f5f5d]">Area</th>
                  <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider text-[#5f5f5d]">Category</th>
                  <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider text-[#5f5f5d]">Votes</th>
                  <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider text-[#5f5f5d]">Status</th>
                  <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider text-[#5f5f5d] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-passive)]">
                {dataLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-[#5f5f5d]">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-6 h-6 border-2 border-[var(--border-passive)] border-t-[#1c1c1c] rounded-full animate-spin" />
                        <span>Loading queue...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-[#5f5f5d]">
                      {searchTerm ? "No submissions match your search." : "Queve is currently empty!"}
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((s) => (
                    <tr key={s.id} className="hover:bg-[#fcfbf8]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#1c1c1c]">{s.name}</span>
                          <span className="text-[12px] text-[#5f5f5d] truncate max-w-[200px]">{s.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-[14px] text-[#1c1c1c]">{s.neighbourhood}</span>
                          <span className="text-[12px] text-[#5f5f5d]">{s.borough}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="category" className="bg-[#f7f4ed] border-[var(--border-passive)]">{s.category}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <span className={cn(
                             "font-bold",
                             s.voteCount >= 50 ? "text-green-600" : "text-[#1c1c1c]"
                           )}>{s.voteCount}</span>
                           <span className="text-[12px] text-[#5f5f5d]">/ 50</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 uppercase text-[10px]">{s.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="primary" 
                            size="sm"
                            disabled={actionLoading}
                            onClick={() => {
                              if(confirm(`Approve "${s.name}"? This will make it live on the map.`)) {
                                approveSubmission(s);
                              }
                            }}
                            className="bg-green-600 hover:bg-green-700 h-9 px-3"
                          >
                            <Check className="w-4 h-4 mr-1" /> Approve
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            disabled={actionLoading}
                            onClick={() => {
                              if(confirm(`Reject "${s.name}"?`)) {
                                rejectSubmission(s.id!);
                              }
                            }}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-9 px-3"
                          >
                            <X className="w-4 h-4 mr-1" /> Reject
                          </Button>

                          <Link href={`/moderator/edit/${s.id}`}>
                            <Button variant="ghost" size="icon" className="h-9 w-9 border border-[var(--border-passive)]">
                              <Edit3 className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

// Minimal Input wrapper for simplicity in this file
function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input 
      className={cn(
        "flex h-10 w-full rounded-md border border-[var(--border-interactive)] bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#5f5f5d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
