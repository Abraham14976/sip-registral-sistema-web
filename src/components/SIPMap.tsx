"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, Polygon, Popup, TileLayer, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import type { MapLot } from "@/lib/lots";
import "leaflet/dist/leaflet.css";

interface SIPMapProps {
  initialLots?: MapLot[];
  initialSource?: "postgis" | "fallback";
  selectedLotCode?: string;
  filterInmobiliaria?: string;
  filterProyecto?: string;
  filterEstado?: string;
}

function MapController({
  activeLot,
  activeBounds,
}: {
  activeLot?: MapLot;
  activeBounds?: [[number, number], [number, number]];
}) {
  const map = useMap();

  useEffect(() => {
    if (activeBounds) {
      map.fitBounds(activeBounds, { padding: [50, 50], maxZoom: 19 });
    }
  }, [map, activeBounds]);

  return null;
}

export default function SIPMap({
  initialLots = [],
  initialSource = "postgis",
  selectedLotCode,
  filterInmobiliaria,
  filterProyecto,
  filterEstado,
}: SIPMapProps) {
  const [lots, setLots] = useState<MapLot[]>(initialLots);
  const [selectedCode, setSelectedCode] = useState<string | undefined>(selectedLotCode);
  const [source, setSource] = useState<"postgis" | "fallback">(initialSource);

  // Consultar lotes en vivo desde la API de PostGIS
  useEffect(() => {
    let isMounted = true;
    async function fetchLots() {
      try {
        const params = new URLSearchParams();
        if (filterInmobiliaria && filterInmobiliaria !== "todas") {
          params.set("inmobiliaria", filterInmobiliaria);
        }
        if (filterProyecto && filterProyecto !== "todos") {
          params.set("proyecto", filterProyecto);
        }
        const res = await fetch(`/api/lotes?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.lots) {
            setLots(data.lots);
            setSource(data.source);
          }
        }
      } catch (err) {
        console.error("Error al consultar API de lotes:", err);
      }
    }

    fetchLots();
    return () => {
      isMounted = false;
    };
  }, [filterInmobiliaria, filterProyecto]);

  // Filtrado reactivo en cliente (por estado u opciones)
  const filteredLots = useMemo(() => {
    return lots.filter((lot) => {
      if (filterEstado && filterEstado !== "todos" && lot.status !== filterEstado) {
        return false;
      }
      return true;
    });
  }, [lots, filterEstado]);

  // Determinar bounds: si hay lote de Polloc, enfocar en Cajamarca
  const activeBounds = useMemo<[[number, number], [number, number]] | undefined>(() => {
    const polloc = filteredLots.find((l) => l.proyectoSlug === "polloc" || l.code.startsWith("POLLOC"));
    if (polloc && polloc.polygon.length > 0) {
      const lats = polloc.polygon.map((p) => p[0]);
      const lngs = polloc.polygon.map((p) => p[1]);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      return [
        [minLat - 0.0003, minLng - 0.0003],
        [maxLat + 0.0003, maxLng + 0.0003],
      ];
    }

    if (filteredLots.length > 0) {
      const allLats = filteredLots.flatMap((l) => l.polygon.map((p) => p[0]));
      const allLngs = filteredLots.flatMap((l) => l.polygon.map((p) => p[1]));
      return [
        [Math.min(...allLats) - 0.01, Math.min(...allLngs) - 0.01],
        [Math.max(...allLats) + 0.01, Math.max(...allLngs) + 0.01],
      ];
    }

    return [[-7.13, -78.32], [-7.11, -78.30]];
  }, [filteredLots]);

  const selectedLot = filteredLots.find((l) => l.code === selectedCode);

  return (
    <div className="map-shell" aria-label="Mapa territorial de lotes">
      <MapContainer
        center={[-7.1237, -78.3123]}
        zoom={18}
        scrollWheelZoom
        className="sip-map"
      >
        <TileLayer
          attribution="&copy; Esri, Maxar, Earthstar Geographics"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={20}
        />
        <MapController activeBounds={activeBounds} activeLot={selectedLot} />

        {filteredLots.map((lot) => {
          const isSelected = lot.code === selectedCode;
          const isAvailable = lot.status === "available";
          const baseColor = isAvailable ? "#44d483" : "#f45d68";
          const fillColor = isSelected ? "#ffd15c" : baseColor;

          return (
            <Polygon
              key={lot.code}
              positions={lot.polygon}
              pathOptions={{
                color: isSelected ? "#ffffff" : baseColor,
                fillColor: fillColor,
                fillOpacity: isSelected ? 0.85 : 0.65,
                weight: isSelected ? 3 : 2,
              }}
              eventHandlers={{
                click: () => {
                  setSelectedCode(lot.code);
                },
              }}
            >
              <Popup>
                <div style={{ minWidth: 190, padding: "4px 2px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <strong style={{ fontSize: 15, color: "#08243d" }}>{lot.code}</strong>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: 3,
                        background: isAvailable ? "#e5f8ee" : "#fdeeed",
                        color: isAvailable ? "#188046" : "#c5221f",
                      }}
                    >
                      {lot.statusLabel}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#546e7a", lineHeight: 1.6 }}>
                    <div><strong>Inmobiliaria:</strong> {lot.inmobiliaria}</div>
                    <div><strong>Proyecto:</strong> {lot.proyecto}</div>
                    <div><strong>Área:</strong> {lot.area} m²</div>
                    {lot.isReal && (
                      <div style={{ marginTop: 4, color: "#0c63a8", fontWeight: 600, fontSize: 11 }}>
                        ✓ Polígono georreferenciado
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Polygon>
          );
        })}
      </MapContainer>

      <div className="map-badge">
        <span
          className="live-dot"
          style={{ background: source === "postgis" ? "#44d483" : "#e5a832" }}
        />
        {source === "postgis"
          ? "Fuente en vivo: PostgreSQL + PostGIS"
          : "Modo DEMO de respaldo"}
      </div>

      {selectedLot && (
        <div
          style={{
            position: "absolute",
            top: 15,
            right: 15,
            zIndex: 1000,
            background: "#fff",
            padding: "12px 16px",
            borderRadius: 6,
            boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
            border: "1px solid #dce6ed",
            maxWidth: 240,
          }}
        >
          <div style={{ fontSize: 11, color: "#6d7e8d", textTransform: "uppercase", fontWeight: 700 }}>
            Lote Seleccionado
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#08243d", margin: "4px 0" }}>
            {selectedLot.code}
          </div>
          <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
            <div>Proyecto: <strong>{selectedLot.proyecto}</strong></div>
            <div>Estado: <strong style={{ color: selectedLot.status === "available" ? "#219d5e" : "#d44754" }}>{selectedLot.statusLabel}</strong></div>
            <div>Área: <strong>{selectedLot.area} m²</strong></div>
          </div>
        </div>
      )}
    </div>
  );
}
