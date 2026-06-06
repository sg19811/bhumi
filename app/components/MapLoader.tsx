"use client";
import dynamic from "next/dynamic";
const Map = dynamic(() => import("./Map"), { ssr: false, loading: () => <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">Loading map...</div> });
export default function MapLoader(props: React.ComponentProps<typeof Map>) { return <Map {...props} />; }
