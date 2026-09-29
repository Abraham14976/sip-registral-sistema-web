"use client";

import dynamic from "next/dynamic";
import type { MapLot } from "@/lib/lots";

const SIPMap = dynamic(() => import("./SIPMap"), { ssr: false });

interface SIPMapLoaderProps {
  initialLots?: MapLot[];
  initialSource?: "postgis" | "fallback";
  selectedLotCode?: string;
  filterInmobiliaria?: string;
  filterProyecto?: string;
  filterEstado?: string;
}

export default function SIPMapLoader(props: SIPMapLoaderProps) {
  return <SIPMap {...props} />;
}