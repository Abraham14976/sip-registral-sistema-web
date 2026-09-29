"use client";

import dynamic from "next/dynamic";
import type { SantaMargaritaEtapa3Lot } from "@/lib/santa-margarita-etapa3";

const SantaMargaritaEtapa3Map = dynamic(() => import("./SantaMargaritaEtapa3Map"), { ssr: false });

export default function SantaMargaritaEtapa3MapLoader({ lots }: { lots: SantaMargaritaEtapa3Lot[] }) {
  return <SantaMargaritaEtapa3Map lots={lots} />;
}