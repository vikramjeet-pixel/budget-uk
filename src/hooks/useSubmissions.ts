"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Submission } from "@/types";

export function useSubmissions(status: string = "pending") {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    const q = query(
      collection(db, "submissions"),
      where("status", "==", status),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Submission[];
      
      setSubmissions(data);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("useSubmissions error:", err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [status]);

  return { submissions, loading, error };
}
