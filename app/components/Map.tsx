"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

type MarkerData = {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  price: number;
  area_value: number;
  area_unit: string;
};

export default function Map({
  markers,
  center,
  zoom = 11,
  height = "400px",
}: {
  markers: MarkerData[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}) {
  const mapCenter: [number, number] = center ??
    (markers.length > 0
      ? [markers[0].latitude, markers[0].longitude]
      : [12.97, 77.59]);

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoom}
      style={{ height, width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {markers.map((m) => (
        <Marker key={m.id} position={[m.latitude, m.longitude]} icon={markerIcon}>
          <Popup>
            <Link href={`/listing/${m.id}`} className="font-semibold text-green-800 hover:underline">
              {m.title}
            </Link>
            <br />
            ₹{Number(m.price).toLocaleString("en-IN")} · {m.area_value} {m.area_unit}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
