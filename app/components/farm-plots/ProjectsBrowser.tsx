"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ListingCard from "@/app/components/ListingCard";

type Project = Record<string, unknown>;
type CorridorOpt = { slug: string; label: string };

const STAGES: { value: string; label: string }[] = [
  { value: "pre_launch", label: "Pre-launch" },
  { value: "launched", label: "Launched" },
  { value: "partial_inventory", label: "Partial inventory" },
  { value: "completed", label: "Completed" },
];

const SORTS: { value: string; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

const selCls = "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600";

// Client-side filter/sort over a city's projects. Data is fetched server-side
// (ISR), so this stays fast and keeps the page cacheable.
export default function ProjectsBrowser({ projects, corridors }: { projects: Project[]; corridors: CorridorOpt[] }) {
  const [corridor, setCorridor] = useState("");
  const [stage, setStage] = useState("");
  const [sort, setSort] = useState("newest");

  const filtered = useMemo(() => {
    let list = projects.slice();
    if (corridor) list = list.filter((p) => p.corridor === corridor);
    if (stage) list = list.filter((p) => p.project_stage === stage);
    list.sort((a, b) => {
      if (sort === "price_asc") return Number(a.price || 0) - Number(b.price || 0);
      if (sort === "price_desc") return Number(b.price || 0) - Number(a.price || 0);
      return String(b.created_at || "").localeCompare(String(a.created_at || "")); // newest
    });
    return list;
  }, [projects, corridor, stage, sort]);

  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 py-12 text-center text-gray-500">
        No projects listed here yet.{" "}
        <Link href="/buy" className="font-medium text-green-800 hover:underline">Post what you&apos;re looking for →</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {corridors.length > 0 && (
          <select value={corridor} onChange={(e) => setCorridor(e.target.value)} className={selCls} aria-label="Filter by corridor">
            <option value="">All corridors</option>
            {corridors.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
          </select>
        )}
        <select value={stage} onChange={(e) => setStage(e.target.value)} className={selCls} aria-label="Filter by stage">
          <option value="">Any stage</option>
          {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className={selCls} aria-label="Sort">
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <span className="ml-auto text-sm text-gray-500">{filtered.length} project{filtered.length === 1 ? "" : "s"}</span>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => <ListingCard key={String(l.id)} listing={l} />)}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-gray-300 py-10 text-center text-gray-500">No projects match these filters.</p>
      )}
    </div>
  );
}
