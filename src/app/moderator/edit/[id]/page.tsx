"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Header } from "@/components/features/Header";
import { SpotForm, SubmissionFormData } from "@/components/features/SpotForm";
import { useAdminActions } from "@/hooks/useAdminActions";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { Submission } from "@/types";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditSubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const { user, loading: authLoading } = useAuthContext();
  const { updateSubmission, loading: actionLoading } = useAdminActions();
  const [submission, setSubmission] = React.useState<Submission | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Role Protection
  React.useEffect(() => {
    if (!authLoading && (!user || (user.role !== "admin" && user.role !== "moderator"))) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // Fetch Data
  React.useEffect(() => {
    async function fetchData() {
      if (!id) return;
      const snap = await getDoc(doc(db, "submissions", id));
      if (snap.exists()) {
        setSubmission({ id: snap.id, ...snap.data() } as Submission);
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  const onSubmit = async (data: SubmissionFormData) => {
    if (!id) return;
    try {
      // Map form tip objects back to string array
      const submissionData = {
        ...data,
        tips: data.tips.map(t => t.value)
      };
      
      const success = await updateSubmission(id, submissionData as any);
      if (success) {
        router.push("/moderator");
      }
    } catch (err: any) {
      alert(err.message || "Failed to update submission");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfbf8]">
        <div className="w-8 h-8 border-4 border-[var(--border-passive)] border-t-[#1c1c1c] rounded-full animate-spin" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfbf8] gap-4">
        <p className="text-[#5f5f5d]">Submission not found.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  // Pre-process tips for the form (needs objects with .value)
  const initialFormValues = {
    ...submission,
    tips: submission.tips.map(t => ({ value: t }))
  };

  return (
    <div className="min-h-screen bg-[#fcfbf8] pb-12 md:pb-20">
      <Header />
      <main className="max-w-[640px] mx-auto px-4 pt-32">
        <div className="mb-10 flex flex-col items-center text-center">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-1 text-[13px] text-[#5f5f5d] hover:text-[#1c1c1c] mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Queue
          </button>
          <h1 className="t-h2 text-[#1c1c1c] tracking-tight mb-2">Edit Submission</h1>
          <p className="t-body text-[#5f5f5d]">Refine the spot details before final approval.</p>
        </div>

        <SpotForm 
          initialData={initialFormValues as any}
          onSubmit={onSubmit} 
          isLoading={actionLoading} 
          buttonText="Save Changes"
        />
      </main>
    </div>
  );
}
