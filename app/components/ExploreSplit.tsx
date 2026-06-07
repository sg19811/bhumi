"use client";

import { useState } from "react";
import MapLoader from "@/app/components/MapLoader";
import ListingCard from "@/app/components/ListingCard";
import type { MarkerData } from "@/app/components/Map";

export default function ExploreSplit({ listings, markers }: { listings: any[]; markers: MarkerData[] }) {
  const [focusId, setFocusId] = useState<string | undefined>();
  const [tick, setTick] = useState(0);

  function focus(id: string) {
    setFocusId(id);
    setTick((t) => t + 1);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      document.getElementById("explore-map")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div className="gap-6 lg:grid lg:grid-cols-5">
      {/* Map: on top on mobile, sticky right column on desktop */}
      <div id="explore-map" className="mb-6 scroll-mt-20 lg:order-2 lg:col-span-2 lg:mb-0">
        <div className="h-[50vh] overflow-hidden rounded-2xl border border-gray-200 lg:sticky lg:top-20 lg:h-[calc(100vh-104px)]">
          <MapLoader markers={markers} zoom={9} height="100%" focusId={focusId} focusTick={tick} />
        </div>
      </div>
      {/* List */}
      <div className="lg:order-1 lg:col-span-3">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {listings.map((l) => (
            <div key={l.id}>
              <ListingCard listing={l} />
              <button
                onClick={() => focus(l.id)}
                className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-gray-500 transition-colors hover:text-green-800"
              >
                📍 View on map
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
