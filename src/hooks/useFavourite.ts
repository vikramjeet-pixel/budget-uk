import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuthContext } from "@/components/providers/AuthProvider";

export function useFavourite(spotId: string | undefined) {
  const { user } = useAuthContext();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sync strictly tracking Native document boundaries securely polling initial hook variables
  useEffect(() => {
    if (!user || !spotId) {
      setIsSaved(false);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const checkStatus = async () => {
      setLoading(true);
      try {
        const ref = doc(db, `favourites/${user.uid}/items/${spotId}`);
        const snapshot = await getDoc(ref);
        if (isMounted) setIsSaved(snapshot.exists());
      } catch (err) {
         console.warn("Failed retrieving dynamic save statuses properly:", err);
      } finally {
         if (isMounted) setLoading(false);
      }
    };

    checkStatus();

    return () => {
       isMounted = false;
    };
  }, [user, spotId]);

  const toggleSave = async () => {
    if (!user || !spotId) {
      return false; // Handled structurally wrapping component routers tracking cleanly
    }

    const previousState = isSaved;
    // Execute Native Optimistic Bindings dynamically flipping states!
    setIsSaved(!previousState);

    const ref = doc(db, `favourites/${user.uid}/items/${spotId}`);
    try {
      if (previousState) {
         await deleteDoc(ref);
      } else {
         await setDoc(ref, {
           savedAt: serverTimestamp(),
           note: null,
         });
      }
      return true;
    } catch (err) {
      console.error("Save state transaction failed structurally reversing DOM explicitly:", err);
      setIsSaved(previousState);
      return false;
    }
  };

  return { isSaved, toggleSave, loading };
}
