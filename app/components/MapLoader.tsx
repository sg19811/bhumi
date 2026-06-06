"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("./Map"), { ssr: false });

export default function MapLoader(props: React.ComponentProps<typeof Map>) {
  return <Map {...props} />;
}