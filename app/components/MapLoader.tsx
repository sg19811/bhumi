"use client";
import dynamic from "next/dynamic";
import MapSpinner from "./MapSpinner";
const Map = dynamic(() => import("./Map"), { ssr: false, loading: () => <MapSpinner /> });
export default function MapLoader(props: React.ComponentProps<typeof Map>) { return <Map {...props} />; }
