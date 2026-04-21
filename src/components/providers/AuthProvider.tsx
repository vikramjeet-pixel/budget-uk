"use client";

import React, { createContext, useContext } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { User as FirebaseUser } from "firebase/auth";
import type { UserRole } from "@/types";

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  role: UserRole | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const authState = useAuth();

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
