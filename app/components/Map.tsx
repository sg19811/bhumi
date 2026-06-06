"use client";
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

export type MarkerData = { id: string; latitude: number; longitude: number; title: string; price: number; area_value: number; area_unit: string };

export default function Map({ markers, center, zoom = 11, height = "400px" }: { markers: MarkerData[]; center?: [number, number]; zoom?: number; height?: string }) {
  const c: [number, number] = center ?? (markers.length > 0 ? [markers[0].latitude, markers[0].longitude] : [12.97, 77.59]);
  return (
    <MapContainer center={c} zoom={zoom} style={{ height, width: "100%" }}>
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Street">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Satellite">
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution='&copy; Esri' />
        </LayersControl.BaseLayer>
      </LayersControl>
      {markers.map((m) => (
        <Marker key={m.id} position={[m.latitude, m.longitude]} icon={markerIcon}>
          <Popup>
            <Link href={`/listing/${m.id}`} className="font-semibold text-green-800 hover:underline">{m.title}</Link><br />
            ₹{Number(m.price).toLocaleString("en-IN")} · {m.area_value} {m.area_unit}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
