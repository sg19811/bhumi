"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";
import { useCompare } from "@/app/lib/compare";
import { computeTrust, trustTierBadgeStyle } from "@/app/lib/trust";
import { formatINR, formatINRShort, pricePerAcre } from "@/app/lib/format";
import { ListingCardSkeletonGrid } from "@/app/components/ListingCardSkeleton";

function priceBasisLabel(basis?: string) {
  return basis === "per_acre"
    ? "/ acre"
    : basis === "per_guntha"
      ? "/ guntha"
      : basis === "per_sqft"
        ? "/ sq ft"
        : "total";
}

const rows: { label: string; render: (l: any) => React.ReactNode }[] = [
  {
    label: "Price",
    render: (l) => (
      <span className="font-semibold text-green-800" title={formatINR(l.price)}>
        {formatINRShort(l.price)}{" "}
        <span className="font-normal text-gray-500">{priceBasisLabel(l.price_basis)}</span>
      </span>
    ),
  },
  {
    label: "Price / acre",
    render: (l) => {
      const ppa = pricePerAcre(l);
      return ppa ? <span className="text-gray-700">≈ {formatINRShort(ppa)}</span> : <span className="text-gray-400">—</span>;
    },
  },
  { label: "Area", render: (l) => `${l.area_value} ${l.area_unit}` },
  { label: "Land type", render: (l) => <span className="capitalize">{l.land_type?.replace(/_/g, " ") || "—"}</span> },
  {
    label: "Trust Score",
    render: (l) => {
      const { score, tier } = computeTrust(l);
      return (
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${trustTierBadgeStyle[tier]}`}>
          {tier} · {score}
        </span>
      );
    },
  },
  { label: "Water", render: (l) => <span className="capitalize">{l.water_source || "—"}</span> },
  { label: "Road", render: (l) => <span className="capitalize">{l.road_access || "—"}</span> },
  { label: "Electricity", render: (l) => (l.electricity ? "Yes" : "—") },
  {
    label: "Location",
    render: (l) => [l.village, l.taluka, l.district].filter(Boolean).join(", ") || "—",
  },
];

export default function ComparePage() {
  const { ids, remove, clear } = useCompare();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) {
      setListings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("listings")
      .select("*")
      .in("id", ids)
      .then(({ data }) => {
        const order = new Map(ids.map((id, i) => [id, i]));
        setListings((data ?? []).sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)));
        setLoading(false);
      });
  }, [ids]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main className="mx-auto max-w-5xl px-5 py-10 pb-28 sm:px-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Compare land</h1>
            <p className="mt-0.5 text-sm text-gray-500">{ids.length} selected</p>
          </div>
          {ids.length > 0 && (
            <button onClick={clear} className="shrink-0 text-sm font-medium text-red-600 hover:underline">
              Clear all
            </button>
          )}
        </div>

        {loading && ids.length > 0 && <ListingCardSkeletonGrid count={Math.min(ids.length, 4)} />}

        {!loading && ids.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center">
            <p className="mb-4 text-gray-500">No listings selected yet. Tap &quot;+ Compare&quot; on any listing card.</p>
            <Link href="/explore" className="inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-green-800">
              Browse listings
            </Link>
          </div>
        )}

        {!loading && listings.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="sticky left-0 z-10 bg-gray-50 p-3 text-left align-bottom" />
                  {listings.map((l) => (
                    <th key={l.id} className="min-w-[200px] border-l border-gray-200 p-3 text-left align-top">
                      <Link href={`/listing/${l.id}`} className="group block">
                        <div className="relative mb-2 aspect-[4/3] w-full overflow-hidden rounded-lg bg-green-50">
                          {l.photos?.[0] ? (
                            <Image src={l.photos[0]} alt={l.title} fill sizes="200px" className="object-cover transition-transform group-hover:scale-105" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-green-700/40">No photo</div>
                          )}
                        </div>
                        <span className="line-clamp-2 font-semibold leading-snug group-hover:text-green-800">{l.title}</span>
                      </Link>
                      <button
                        onClick={() => remove(l.id)}
                        className="mt-1.5 text-xs font-medium text-gray-400 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={row.label} className={ri % 2 ? "bg-gray-50/60" : ""}>
                    <th scope="row" className="sticky left-0 z-10 whitespace-nowrap bg-gray-50 p-3 text-left font-medium text-gray-500">
                      {row.label}
                    </th>
                    {listings.map((l) => (
                      <td key={l.id} className="min-w-[200px] border-l border-gray-200 p-3 align-top">
                        {row.render(l)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
