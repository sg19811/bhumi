"use client";
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { formatINRShort } from "@/app/lib/format";

// Keeps Leaflet's canvas in sync when its container is resized (responsive
// layout, sticky column, or first paint), preventing gray/clipped tiles.
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

// Zillow-style price pill marker, centered on the coordinate.
function priceIcon(price: number) {
  return L.divIcon({
    className: "",
    html: `<div style="transform:translate(-50%,-50%);display:inline-block;background:#445626;color:#fdfcf9;padding:3px 9px;border-radius:9999px;font-size:12px;font-weight:600;white-space:nowrap;box-shadow:0 1px 4px rgba(40,33,15,.35);border:1.5px solid #fdfcf9;">${formatINRShort(price)}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -12],
  });
}

export type MarkerData = { id: string; latitude: number; longitude: number; title: string; price: number; area_value: number; area_unit: string };

// Flies to and opens the popup of a focused marker (driven from the listing list).
function Focuser({ focusId, focusTick, markers, markerRefs }: { focusId?: string; focusTick?: number; markers: MarkerData[]; markerRefs: React.RefObject<Record<string, L.Marker>> }) {
  const map = useMap();
  useEffect(() => {
    if (!focusId) return;
    const m = markers.find((x) => x.id === focusId);
    if (!m) return;
    map.flyTo([m.latitude, m.longitude], Math.max(map.getZoom(), 14), { duration: 0.8 });
    const mk = markerRefs.current?.[focusId];
    if (mk) setTimeout(() => mk.openPopup(), 350);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId, focusTick]);
  return null;
}

export default function Map({ markers, center, zoom = 11, height = "400px", focusId, focusTick }: { markers: MarkerData[]; center?: [number, number]; zoom?: number; height?: string; focusId?: string; focusTick?: number }) {
  const c: [number, number] = center ?? (markers.length > 0 ? [markers[0].latitude, markers[0].longitude] : [12.97, 77.59]);
  const markerRefs = useRef<Record<string, L.Marker>>({});
  return (
    <MapContainer center={c} zoom={zoom} style={{ height, width: "100%" }}>
      <ResizeHandler />
      <Focuser focusId={focusId} focusTick={focusTick} markers={markers} markerRefs={markerRefs} />
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Street">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Satellite">
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution='&copy; Esri' />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Terrain">
          <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" attribution='&copy; OpenTopoMap (CC-BY-SA)' maxZoom={17} />
        </LayersControl.BaseLayer>
      </LayersControl>
      {markers.map((m) => (
        <Marker key={m.id} position={[m.latitude, m.longitude]} icon={priceIcon(m.price)} ref={(inst) => { if (inst) markerRefs.current[m.id] = inst; }}>
          <Popup>
            <Link href={`/listing/${m.id}`} className="font-semibold text-green-800 hover:underline">{m.title}</Link><br />
            ₹{Number(m.price).toLocaleString("en-IN")} · {m.area_value} {m.area_unit}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
