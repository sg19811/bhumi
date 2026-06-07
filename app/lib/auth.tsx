"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";

type AuthCtx = { user: User | null; role: string | null; loading: boolean; signOut: () => Promise<void> };
const AuthContext = createContext<AuthCtx>({ user: null, role: null, loading: true, signOut: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null); setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load the signed-in user's role (used to gate the admin dashboard).
  useEffect(() => {
    if (!user) { setRole(null); return; }
    let active = true;
    supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { if (active) setRole(data?.role ?? null); });
    return () => { active = false; };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut: async () => { await supabase.auth.signOut(); setUser(null); setRole(null); } }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
