"use client";

import dynamic from "next/dynamic";
import type { MapLot } from "@/lib/lots";

const SIPMap = dynamic(() => import("./SIPMap"), { ssr: false });

interface SIPMapLoaderProps {
  initialLots: MapLot[];
  selectedLotCode?: string;
  filterEstado?: string;
}

export default function SIPMapLoader(props: SIPMapLoaderProps) {
  return <SIPMap {...props} />;
}