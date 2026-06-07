"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const PickerMap = dynamic(() => import("./PickerMap"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center bg-gray-100 text-sm text-gray-400">Loading map…</div>,
});

const fieldCls = "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15";

export default function LocationField({
  defaultLat,
  defaultLng,
  defaultDistrict = "",
  defaultTaluka = "",
  defaultVillage = "",
}: {
  defaultLat?: number | null;
  defaultLng?: number | null;
  defaultDistrict?: string;
  defaultTaluka?: string;
  defaultVillage?: string;
}) {
  const [lat, setLat] = useState<number | null>(defaultLat ?? null);
  const [lng, setLng] = useState<number | null>(defaultLng ?? null);
  const [district, setDistrict] = useState(defaultDistrict ?? "");
  const [taluka, setTaluka] = useState(defaultTaluka ?? "");
  const [village, setVillage] = useState(defaultVillage ?? "");
  const [center, setCenter] = useState<[number, number] | undefined>(undefined);
  const [tick, setTick] = useState(0);
  const [msg, setMsg] = useState("");

  async function reverseGeocode(la: number, lo: number) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${la}&lon=${lo}&zoom=10&addressdetails=1`,
        { headers: { Accept: "application/json" } }
      );
      if (!res.ok) return;
      const data = await res.json();
      const a = data?.address ?? {};
      const d = a.state_district || a.county || a.district || "";
      const t = a.city_district || a.municipality || a.county || a.suburb || "";
      const v = a.village || a.hamlet || a.town || a.suburb || "";
      if (d) setDistrict(d);
      if (t && t !== d) setTaluka(t);
      if (v) setVillage(v);
    } catch {
      /* don't block the form if geocoding fails */
    }
  }

  function pick(la: number, lo: number) {
    setLat(la);
    setLng(lo);
    reverseGeocode(la, lo);
  }

  function useMyLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setMsg("Geolocation isn't available in this browser — tap the map instead.");
      return;
    }
    setMsg("Locating…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCenter([latitude, longitude]);
        setTick((x) => x + 1);
        pick(latitude, longitude);
        setMsg("");
      },
      () => setMsg("Couldn't get your location — tap the map to set it."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-gray-500">Tap the map to drop a pin on your land.</p>
        <button
          type="button"
          onClick={useMyLocation}
          className="shrink-0 rounded-full border border-gray-300 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-green-600 hover:text-green-800"
        >
          📍 Use my current location
        </button>
      </div>

      <div className="h-[300px] overflow-hidden rounded-2xl border border-gray-200">
        <PickerMap lat={lat} lng={lng} onPick={pick} center={center} recenterTick={tick} />
      </div>

      {msg && <p className="text-xs text-gray-500">{msg}</p>}
      {lat != null && lng != null ? (
        <p className="text-xs text-gray-400">Pin set at {lat.toFixed(5)}, {lng.toFixed(5)}</p>
      ) : (
        <p className="text-xs text-amber-700">No pin yet — tap the map to set the location.</p>
      )}

      {/* Submitted with the form (existing FormData logic reads these names). */}
      <input type="hidden" name="latitude" value={lat ?? ""} readOnly />
      <input type="hidden" name="longitude" value={lng ?? ""} readOnly />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">District *</label>
          <input name="district" required value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Mysuru" className={fieldCls} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Taluka</label>
          <input name="taluka" value={taluka} onChange={(e) => setTaluka(e.target.value)} placeholder="Hunsur" className={fieldCls} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Village</label>
          <input name="village" value={village} onChange={(e) => setVillage(e.target.value)} placeholder="Kallahalli" className={fieldCls} />
        </div>
      </div>
    </div>
  );
}
