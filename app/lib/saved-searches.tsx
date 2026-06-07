"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabase";

const STORAGE_KEY = "bhumi:saved-searches";
const MAX = 12;

export type SavedSearch = {
  id: string; // the query string itself, used as a stable key
  label: string; // human-readable summary
  query: string; // e.g. "land_type=orchard&max_price=5000000"
};

type SavedSearchesCtx = {
  searches: SavedSearch[];
  save: (s: SavedSearch) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
};

const Ctx = createContext<SavedSearchesCtx>({
  searches: [],
  save: () => {},
  remove: () => {},
  has: () => false,
});

/**
 * Saved searches persist to the `saved_searches` table when signed in
 * (cross-device + enables future alerts), and fall back to localStorage for
 * guests. The query string is the stable identity in both stores.
 */
export function SavedSearchesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [ready, setReady] = useState(false);

  // Load: from DB when signed in, else from localStorage.
  useEffect(() => {
    let active = true;
    setReady(false);
    (async () => {
      if (user) {
        const { data } = await supabase
          .from("saved_searches")
          .select("label, query")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (active) {
          setSearches((data ?? []).map((r: { label: string | null; query: string }) => ({
            id: r.query,
            label: r.label ?? r.query,
            query: r.query,
          })));
        }
      } else {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (active) setSearches(raw ? JSON.parse(raw) : []);
        } catch {
          /* ignore */
        }
      }
      if (active) setReady(true);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  // Persist to localStorage for guests only (signed-in state lives in the DB).
  useEffect(() => {
    if (!ready || user) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
    } catch {
      /* ignore */
    }
  }, [searches, ready, user]);

  const has = (id: string) => searches.some((s) => s.id === id);

  const save = (s: SavedSearch) => {
    if (searches.some((x) => x.id === s.id)) return;
    setSearches((cur) => [s, ...cur].slice(0, MAX));
    if (user) {
      supabase.from("saved_searches").insert({ user_id: user.id, label: s.label, query: s.query }).then(() => {});
    }
  };

  const remove = (id: string) => {
    setSearches((cur) => cur.filter((s) => s.id !== id));
    if (user) {
      supabase.from("saved_searches").delete().eq("user_id", user.id).eq("query", id).then(() => {});
    }
  };

  return <Ctx.Provider value={{ searches, save, remove, has }}>{children}</Ctx.Provider>;
}

export const useSavedSearches = () => useContext(Ctx);
