import { useState, useEffect } from "react";
import { onIdTokenChanged, User as FirebaseUser } from "firebase/auth";
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
    // onIdTokenChanged fires on sign-in/out and whenever the token is refreshed,
    // allowing server components to read a fresh token from the cookie.
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          document.cookie = `__fb_token=${token}; path=/; max-age=3600; SameSite=Strict`;

          const userDoc = await getDoc(doc(db, "users", user.uid));
          const role = userDoc.exists() ? (userDoc.data().role as UserRole) : "user";
          setAuthState({ user, loading: false, role });
        } catch (error) {
          console.error("Error fetching user role:", error);
          setAuthState({ user, loading: false, role: "user" });
        }
      } else {
        document.cookie = "__fb_token=; path=/; max-age=0";
        setAuthState({ user: null, loading: false, role: null });
      }
    });

    return () => unsubscribe();
  }, []);

  return authState;
}
