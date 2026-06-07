"use client";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

const pinIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// India-ish default center (Karnataka) when no pin yet.
const DEFAULT_CENTER: [number, number] = [15.3, 75.7];

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onPick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

function Recenter({ center, tick }: { center?: [number, number]; tick?: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 14);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);
  return null;
}

// Keeps the map sized correctly even when it mounts hidden (e.g. inside a
// wizard step with display:none) and becomes visible later.
function ResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const invalidate = () => map.invalidateSize();
    const raf = requestAnimationFrame(invalidate);
    const ro = new ResizeObserver(invalidate);
    ro.observe(map.getContainer());
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [map]);
  return null;
}

export default function PickerMap({
  lat,
  lng,
  onPick,
  center,
  recenterTick,
}: {
  lat: number | null;
  lng: number | null;
  onPick: (lat: number, lng: number) => void;
  center?: [number, number];
  recenterTick?: number;
}) {
  const hasPin = lat != null && lng != null;
  const initial: [number, number] = hasPin ? [lat!, lng!] : DEFAULT_CENTER;
  return (
    <MapContainer center={initial} zoom={hasPin ? 14 : 6} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
      <ClickHandler onPick={onPick} />
      <Recenter center={center} tick={recenterTick} />
      <ResizeHandler />
      {hasPin && <Marker position={[lat!, lng!]} icon={pinIcon} />}
    </MapContainer>
  );
}
