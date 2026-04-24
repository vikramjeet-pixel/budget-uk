import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuthContext } from "@/components/providers/AuthProvider";
import type { Spot } from "@/types";
import type { Timestamp } from "firebase/firestore";

export interface SavedSpot extends Spot {
  savedAt: Timestamp;
  note: string | null;
}

export function useFavourites() {
  const { user } = useAuthContext();
  const [spots, setSpots] = useState<SavedSpot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSpots([]);
      setLoading(false);
      return;
    }

    const itemsRef = collection(db, `favourites/${user.uid}/items`);
    const unsubscribe = onSnapshot(
      itemsRef,
      async (snap) => {
        const results = await Promise.all(
          snap.docs.map(async (itemDoc) => {
            const { savedAt, note } = itemDoc.data();
            const spotSnap = await getDoc(doc(db, "spots", itemDoc.id));
            if (!spotSnap.exists()) return null;
            return {
              id: spotSnap.id,
              ...spotSnap.data(),
              savedAt,
              note: note ?? null,
            } as SavedSpot;
          })
        );
        setSpots(results.filter((s): s is SavedSpot => s !== null));
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsubscribe();
  }, [user]);

  const updateNote = async (spotId: string, note: string) => {
    if (!user) return;
    await updateDoc(doc(db, `favourites/${user.uid}/items/${spotId}`), { note });
  };

  const removeFavourite = async (spotId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, `favourites/${user.uid}/items/${spotId}`));
  };

  return { spots, loading, updateNote, removeFavourite };
}
