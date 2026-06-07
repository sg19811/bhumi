"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

const MAX = 4;
const STORAGE_KEY = "bhumi:compare";

type CompareCtx = {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  max: number;
};

const CompareContext = createContext<CompareCtx>({
  ids: [],
  has: () => false,
  toggle: () => {},
  remove: () => {},
  clear: () => {},
  max: MAX,
});

export function CompareProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  // Hydrate from localStorage so a selection survives navigation/reloads.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setIds(JSON.parse(raw));
    } catch {
      /* ignore malformed storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      /* ignore quota errors */
    }
  }, [ids, ready]);

  const has = (id: string) => ids.includes(id);
  const toggle = (id: string) =>
    setIds((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= MAX ? cur : [...cur, id]
    );
  const remove = (id: string) => setIds((cur) => cur.filter((x) => x !== id));
  const clear = () => setIds([]);

  return (
    <CompareContext.Provider value={{ ids, has, toggle, remove, clear, max: MAX }}>
      {children}
    </CompareContext.Provider>
  );
}

export const useCompare = () => useContext(CompareContext);
