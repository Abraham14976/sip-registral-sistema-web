"use client";

import { useState } from "react";
import SIPMapLoader from "@/components/SIPMapLoader";
import type { MapLot } from "@/lib/lots";

interface MapFilterLayoutProps {
  initialLots: MapLot[];
  initialSource: "postgis" | "fallback";
  defaultInmobiliaria?: string;
  defaultProyecto?: string;
  defaultLote?: string;
}

export default function MapFilterLayout({
  initialLots,
  initialSource,
  defaultInmobiliaria = "aquino",
  defaultProyecto = "polloc",
  defaultLote = "POLLOC-01",
}: MapFilterLayoutProps) {
  const [inmobiliaria, setInmobiliaria] = useState(defaultInmobiliaria);
  const [proyecto, setProyecto] = useState(defaultProyecto);
  const [estado, setEstado] = useState("todos");

  return (
    <section className="map-page-layout">
      <aside className="filter-panel">
        <h3>Filtros territoriales</h3>

        <label>
          Inmobiliaria
          <select
            value={inmobiliaria}
            onChange={(e) => {
              setInmobiliaria(e.target.value);
              if (e.target.value === "aquino") {
                setProyecto("polloc");
              } else if (e.target.value === "todas") {
                setProyecto("todos");
              }
            }}
          >
            <option value="todas">Todas las inmobiliarias</option>
            <option value="aquino">Inmobiliaria Aquino (Verificada)</option>
            <option value="demo">Inmobiliarias DEMO</option>
          </select>
        </label>

        <label>
          Proyecto
          <select
            value={proyecto}
            onChange={(e) => setProyecto(e.target.value)}
          >
            <option value="todos">Todos los proyectos</option>
            <option value="polloc">Polloc (Inmobiliaria Aquino)</option>
            <option value="los-sauces">Proyecto DEMO Los Sauces</option>
          </select>
        </label>

        <label>
          Estado del lote
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="available">Disponible</option>
            <option value="registered">Registrado en SIP</option>
          </select>
        </label>

        <div className="legend">
          <div>
            <span className="legend-swatch available" /> Disponible
          </div>
          <div>
            <span className="legend-swatch registered" /> Registrado en SIP
          </div>
        </div>

        <div style={{ marginTop: 15, padding: 12, background: "#f2f8fb", borderRadius: 6, fontSize: 11, color: "#546e7a", lineHeight: 1.5 }}>
          <strong>Criterio de privacidad:</strong>
          <br />
          Solo se muestra código territorial y estado. Las identidades y escrituras privadas no se exponen al público.
        </div>
      </aside>

      <div>
        <SIPMapLoader
          initialLots={initialLots}
          initialSource={initialSource}
          selectedLotCode={defaultLote}
          filterInmobiliaria={inmobiliaria}
          filterProyecto={proyecto}
          filterEstado={estado}
        />
      </div>
    </section>
  );
}
