"use client";

import { useState } from "react";
import SIPMapLoader from "@/components/SIPMapLoader";
import type { MapLot } from "@/lib/lots";

interface MapFilterLayoutProps {
  initialLots: MapLot[];
  error?: string;
  defaultLote?: string;
}

export default function MapFilterLayout({
  initialLots,
  error,
  defaultLote = "134A",
}: MapFilterLayoutProps) {
  const [estado, setEstado] = useState("todos");

  if (error) {
    return (
      <section className="map-page-layout">
        <div className="map-load-error" role="alert">
          <strong>Mapa no disponible</strong>
          <span>{error}</span>
        </div>
      </section>
    );
  }

  return (
    <section className="map-page-layout">
      <aside className="filter-panel">
        <h3>Filtros territoriales</h3>
        <div className="map-territory">
          <span>Inmobiliaria</span><strong>Aquino</strong>
          <span>Proyecto</span><strong>Santa Margarita</strong>
          <span>Etapa</span><strong>Etapa 3</strong>
        </div>

        <label>
          Estado del lote
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="available">Disponible</option>
            <option value="registered">Registrado en SIP</option>
            <option value="pending">Estado pendiente</option>
          </select>
        </label>

        <div className="legend">
          <div>
            <span className="legend-swatch available" /> Disponible
          </div>
          <div>
            <span className="legend-swatch registered" /> Registrado en SIP
          </div>
          <div>
            <span className="legend-swatch pending" /> Estado pendiente
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
          selectedLotCode={defaultLote}
          filterEstado={estado}
        />
      </div>
    </section>
  );
}
