import { useState, useEffect } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import type { UserRole } from "@/types";

interface AuthState {
  user: FirebaseUser | null;
  loading: boolean;
  role: UserRole | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    role: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const role = userDoc.exists() ? (userDoc.data().role as UserRole) : "user";
          setAuthState({ user, loading: false, role });
        } catch (error) {
          console.error("Error fetching user role:", error);
          setAuthState({ user, loading: false, role: "user" });
        }
      } else {
        setAuthState({ user: null, loading: false, role: null });
      }
    });

    return () => unsubscribe();
  }, []);

  return authState;
}
