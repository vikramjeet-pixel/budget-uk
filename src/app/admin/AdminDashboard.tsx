"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { Header } from "@/components/features/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Check, X, Edit3, Trash2, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Submission, Spot, Report } from "@/types";

type Tab = "queue" | "live" | "reports";

// ─── Shared helpers ────────────────────────────────────────────────────────────

function Spinner({ size = "sm" }: { size?: "sm" | "lg" }) {
  return (
    <div
      className={cn(
        "border-2 border-passive border-t-[#1c1c1c] rounded-full animate-spin",
        size === "lg" ? "w-8 h-8" : "w-4 h-4"
      )}
    />
  );
}

function TableEmpty({ children }: { children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={10} className="px-6 py-20 text-center text-[#5f5f5d]">
        {children}
      </td>
    </tr>
  );
}

// ─── Queue tab ─────────────────────────────────────────────────────────────────

function QueueTab({ getToken }: { getToken: () => Promise<string> }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "submissions"),
      where("status", "==", "pending"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setSubmissions(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Submission)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const callApi = useCallback(
    async (path: string, body: Record<string, unknown>) => {
      const token = await getToken();
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
      }
    },
    [getToken]
  );

  const approve = async (id: string) => {
    if (!confirm("Force-approve this submission? It will go live immediately.")) return;
    setBusy(id);
    setError(null);
    try {
      await callApi("/api/admin/approve", { submissionId: id });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const reject = async (id: string) => {
    if (!rejectReason.trim()) return;
    setBusy(id);
    setError(null);
    try {
      await callApi("/api/admin/reject", { submissionId: id, reason: rejectReason });
      setRejectingId(null);
      setRejectReason("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-passive overflow-hidden shadow-sm">
      {error && (
        <div className="flex items-center gap-2 px-6 py-3 bg-red-50 border-b border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f7f4ed] border-b border-passive">
              {["Spot", "Area", "Category", "Votes", "Actions"].map((h) => (
                <th key={h} className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-[#5f5f5d]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-passive">
            {loading ? (
              <TableEmpty><Spinner size="sm" /></TableEmpty>
            ) : submissions.length === 0 ? (
              <TableEmpty>Queue is empty — nothing pending review.</TableEmpty>
            ) : (
              submissions.map((s) => (
                <React.Fragment key={s.id}>
                  <tr className="hover:bg-[#fafaf7] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-0.5 max-w-55">
                        <span className="font-bold text-[#1c1c1c] text-sm">{s.name}</span>
                        <span className="text-[12px] text-[#5f5f5d] truncate">{s.description}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#1c1c1c]">{s.neighbourhood}<br /><span className="text-[#5f5f5d] text-[12px]">{s.borough}</span></td>
                    <td className="px-5 py-4"><Badge variant="category" className="text-[11px]">{s.category}</Badge></td>
                    <td className="px-5 py-4 font-bold text-[#1c1c1c]">{s.voteCount}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          disabled={busy === s.id}
                          onClick={() => approve(s.id!)}
                          className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg"
                        >
                          {busy === s.id ? <Spinner /> : <Check className="w-3.5 h-3.5" />}
                          <span className="ml-1">Approve</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busy === s.id}
                          onClick={() => {
                            setRejectingId(rejectingId === s.id ? null : s.id!);
                            setRejectReason("");
                          }}
                          className="h-8 px-3 text-red-500 hover:text-red-600 hover:bg-red-50 text-xs rounded-lg"
                        >
                          <X className="w-3.5 h-3.5 mr-1" />Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {rejectingId === s.id && (
                    <tr className="bg-red-50">
                      <td colSpan={5} className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <input
                            autoFocus
                            className="flex-1 h-9 px-3 text-sm border border-passive rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1c1c1c]/20"
                            placeholder="Rejection reason (sent to submitter)…"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") reject(s.id!);
                              if (e.key === "Escape") setRejectingId(null);
                            }}
                          />
                          <Button
                            size="sm"
                            disabled={!rejectReason.trim() || busy === s.id}
                            onClick={() => reject(s.id!)}
                            className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg"
                          >
                            {busy === s.id ? <Spinner /> : "Confirm reject"}
                          </Button>
                          <button
                            onClick={() => setRejectingId(null)}
                            className="text-[#5f5f5d] hover:text-[#1c1c1c] text-xl leading-none"
                          >
                            &times;
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Live spots tab ────────────────────────────────────────────────────────────

interface EditState {
  description: string;
  tagsRaw: string;
}

function LiveSpotsTab({ getToken }: { getToken: () => Promise<string> }) {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ description: "", tagsRaw: "" });
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "spots"), where("status", "==", "live"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setSpots(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Spot)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const startEdit = (spot: Spot) => {
    setEditingId(spot.id!);
    setEditState({ description: spot.description, tagsRaw: spot.tags.join(", ") });
    setError(null);
  };

  const saveEdit = async (spotId: string) => {
    setBusy(spotId);
    setError(null);
    const tags = editState.tagsRaw
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/spots/${spotId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ description: editState.description, tags }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      setEditingId(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const removeSpot = async (spotId: string, name: string) => {
    if (!confirm(`Remove "${name}" from the live map? This is a soft-delete.`)) return;
    setBusy(spotId);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/spots/${spotId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { error?: string }).error ?? `HTTP ${res.status}`);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-passive overflow-hidden shadow-sm">
      {error && (
        <div className="flex items-center gap-2 px-6 py-3 bg-red-50 border-b border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f7f4ed] border-b border-passive">
              {["Spot", "Area", "Tags", "Price", "Actions"].map((h) => (
                <th key={h} className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-[#5f5f5d]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-passive">
            {loading ? (
              <TableEmpty><Spinner /></TableEmpty>
            ) : spots.length === 0 ? (
              <TableEmpty>No live spots found.</TableEmpty>
            ) : (
              spots.map((spot) => (
                <React.Fragment key={spot.id}>
                  <tr className="hover:bg-[#fafaf7] transition-colors">
                    <td className="px-5 py-4 max-w-55">
                      <span className="font-bold text-[#1c1c1c] text-sm">{spot.name}</span>
                      <p className="text-[12px] text-[#5f5f5d] line-clamp-1 mt-0.5">{spot.description}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#1c1c1c]">{spot.neighbourhood}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-50">
                        {spot.tags.slice(0, 3).map((t) => (
                          <Badge key={t} variant="default" className="text-[10px] py-0.5 px-2">{t}</Badge>
                        ))}
                        {spot.tags.length > 3 && (
                          <span className="text-[11px] text-[#5f5f5d]">+{spot.tags.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant="tier" className="text-[12px]">
                        {spot.priceTier === "free" ? "Free" : spot.priceTier}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busy === spot.id}
                          onClick={() => editingId === spot.id ? setEditingId(null) : startEdit(spot)}
                          className="h-8 px-3 border border-passive text-xs rounded-lg"
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-1" />
                          {editingId === spot.id ? "Cancel" : "Edit"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busy === spot.id}
                          onClick={() => removeSpot(spot.id!, spot.name)}
                          className="h-8 px-3 text-red-500 hover:text-red-600 hover:bg-red-50 text-xs rounded-lg"
                        >
                          {busy === spot.id ? <Spinner /> : <Trash2 className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {editingId === spot.id && (
                    <tr className="bg-[#fafaf7]">
                      <td colSpan={5} className="px-5 py-4">
                        <div className="flex flex-col gap-3 max-w-2xl">
                          <div>
                            <label className="block text-[11px] font-semibold text-[#5f5f5d] mb-1 uppercase tracking-wider">Description</label>
                            <textarea
                              rows={3}
                              className="w-full px-3 py-2 text-sm border border-passive rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1c1c1c]/20 resize-none"
                              value={editState.description}
                              onChange={(e) => setEditState((s) => ({ ...s, description: e.target.value }))}
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-[#5f5f5d] mb-1 uppercase tracking-wider">Tags (comma-separated)</label>
                            <input
                              className="w-full h-9 px-3 text-sm border border-passive rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1c1c1c]/20"
                              value={editState.tagsRaw}
                              onChange={(e) => setEditState((s) => ({ ...s, tagsRaw: e.target.value }))}
                            />
                          </div>
                          <Button
                            size="sm"
                            disabled={busy === spot.id}
                            onClick={() => saveEdit(spot.id!)}
                            className="self-start h-9 px-5 bg-[#1c1c1c] hover:bg-[#3a3a3a] text-white text-sm rounded-lg"
                          >
                            {busy === spot.id ? <Spinner /> : "Save changes"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Reports tab ───────────────────────────────────────────────────────────────

function ReportsTab({ getToken }: { getToken: () => Promise<string> }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setReports(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Report)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const dismiss = async (reportId: string) => {
    setBusy(reportId);
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const removeSpot = async (spotId: string, reportId: string) => {
    if (!confirm("Remove this spot from the live map?")) return;
    setBusy(reportId);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/spots/${spotId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Also dismiss the report
      await fetch(`/api/admin/reports/${reportId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-passive overflow-hidden shadow-sm">
      {error && (
        <div className="flex items-center gap-2 px-6 py-3 bg-red-50 border-b border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f7f4ed] border-b border-passive">
              {["Spot", "Reason", "Reporter", "Date", "Actions"].map((h) => (
                <th key={h} className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-[#5f5f5d]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-passive">
            {loading ? (
              <TableEmpty><Spinner /></TableEmpty>
            ) : reports.length === 0 ? (
              <TableEmpty>No reports — all clear.</TableEmpty>
            ) : (
              reports.map((r) => (
                <tr key={r.id} className="hover:bg-[#fafaf7] transition-colors">
                  <td className="px-5 py-4 font-semibold text-sm text-[#1c1c1c]">{r.spotName || r.spotId}</td>
                  <td className="px-5 py-4 text-sm text-[#5f5f5d] max-w-60">{r.reason}</td>
                  <td className="px-5 py-4 text-[12px] text-[#5f5f5d] font-mono">{r.reportedBy.slice(0, 8)}…</td>
                  <td className="px-5 py-4 text-[12px] text-[#5f5f5d]">
                    {r.createdAt?.toDate?.().toLocaleDateString("en-GB") ?? "—"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busy === r.id}
                        onClick={() => dismiss(r.id!)}
                        className="h-8 px-3 border border-passive text-xs rounded-lg"
                      >
                        {busy === r.id ? <Spinner /> : "Dismiss"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busy === r.id}
                        onClick={() => removeSpot(r.spotId, r.id!)}
                        className="h-8 px-3 text-red-500 hover:text-red-600 hover:bg-red-50 text-xs rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />Remove spot
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Dashboard shell ───────────────────────────────────────────────────────────

const TABS: { key: Tab; label: string }[] = [
  { key: "queue", label: "Queue" },
  { key: "live", label: "Live Spots" },
  { key: "reports", label: "Reports" },
];

export default function AdminDashboard() {
  const { user } = useAuthContext();
  const [tab, setTab] = useState<Tab>("queue");

  const getToken = useCallback(async (): Promise<string> => {
    if (!user) throw new Error("Not authenticated");
    return user.getIdToken();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#fcfbf8]">
      <Header />
      <main className="max-w-300 mx-auto px-4 py-28">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="t-h1 text-[#1c1c1c] tracking-tighter">Admin</h1>
          <p className="t-body text-[#5f5f5d]">Manage submissions, live spots, and community reports.</p>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 mb-6 border-b border-passive">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "px-5 py-2.5 text-sm font-semibold -mb-px border-b-2 transition-colors",
                tab === key
                  ? "border-[#1c1c1c] text-[#1c1c1c]"
                  : "border-transparent text-[#5f5f5d] hover:text-[#1c1c1c]"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "queue" && <QueueTab getToken={getToken} />}
        {tab === "live" && <LiveSpotsTab getToken={getToken} />}
        {tab === "reports" && <ReportsTab getToken={getToken} />}
      </main>
    </div>
  );
}
