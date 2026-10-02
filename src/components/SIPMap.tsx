"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, Polygon, Popup, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import type { MapLot } from "@/lib/lots";
import "leaflet/dist/leaflet.css";

interface SIPMapProps {
  initialLots: MapLot[];
  selectedLotCode?: string;
  filterEstado?: string;
}

function MapController({ activeBounds }: { activeBounds: [[number, number], [number, number]] }) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(activeBounds, { padding: [40, 40], maxZoom: 17 });
  }, [map, activeBounds]);

  return null;
}

function MapZoomListener({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMapEvents({
    zoomend: (event) => onZoomChange(event.target.getZoom()),
  });

  useEffect(() => onZoomChange(map.getZoom()), [map, onZoomChange]);

  return null;
}

export default function SIPMap({
  initialLots,
  selectedLotCode,
  filterEstado,
}: SIPMapProps) {
  const lots = initialLots;
  const [selectedCode, setSelectedCode] = useState<string | undefined>(selectedLotCode);
  const [zoom, setZoom] = useState(17);

  // Filtrado reactivo en cliente (por estado u opciones)
  const filteredLots = useMemo(() => {
    return lots.filter((lot) => {
      if (filterEstado && filterEstado !== "todos" && lot.status !== filterEstado) {
        return false;
      }
      return true;
    });
  }, [lots, filterEstado]);

  const activeBounds = useMemo<[[number, number], [number, number]] | undefined>(() => {
    const latitudes = lots.flatMap((lot) => lot.polygon.map(([latitude]) => latitude));
    const longitudes = lots.flatMap((lot) => lot.polygon.map(([, longitude]) => longitude));
    if (latitudes.length === 0 || longitudes.length === 0) return undefined;

    return [
      [Math.min(...latitudes), Math.min(...longitudes)],
      [Math.max(...latitudes), Math.max(...longitudes)],
    ];
  }, [lots]);

  const selectedLot = filteredLots.find((l) => l.code === selectedCode);
  const center: [number, number] = activeBounds
    ? [(activeBounds[0][0] + activeBounds[1][0]) / 2, (activeBounds[0][1] + activeBounds[1][1]) / 2]
    : [0, 0];

  useEffect(() => {
    if (!filteredLots.some((lot) => lot.code === selectedCode)) {
      setSelectedCode(filteredLots[0]?.code);
    }
  }, [filteredLots, selectedCode]);

  return (
    <div className="map-shell" aria-label="Mapa territorial de lotes">
      <MapContainer
        center={center}
        zoom={17}
        maxZoom={20}
        scrollWheelZoom
        className="sip-map"
      >
        <TileLayer
          attribution="&copy; Esri, Maxar, Earthstar Geographics"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxNativeZoom={17}
          maxZoom={20}
        />
        {activeBounds && <MapController activeBounds={activeBounds} />}
        <MapZoomListener onZoomChange={setZoom} />

        {filteredLots.map((lot) => {
          const isSelected = lot.code === selectedCode;
          const showLabel = isSelected || zoom >= 19;
          const isAvailable = lot.status === "available";
          const baseColor = isAvailable ? "#39c98b" : lot.status === "registered" ? "#ec705f" : "#87939b";
          const fillColor = isSelected ? "#d4ad58" : baseColor;

          return (
            <Polygon
              key={lot.code}
              positions={lot.polygon}
              pathOptions={{
                color: isSelected ? "#fff4d7" : "#ffffff",
                fillColor: fillColor,
                fillOpacity: isSelected ? 0.5 : 0.36,
                weight: isSelected ? 4 : 2.5,
              }}
              eventHandlers={{
                click: () => {
                  setSelectedCode(lot.code);
                },
              }}
            >
              {showLabel && (
                <Tooltip
                  permanent
                  direction="center"
                  interactive
                  className={`lot-code-tooltip${isSelected ? " lot-code-tooltip-selected" : ""}`}
                  eventHandlers={{ click: () => setSelectedCode(lot.code) }}
                >
                  {lot.code}
                </Tooltip>
              )}
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
                        background: isAvailable ? "#e5f8ee" : lot.status === "registered" ? "#fdeeed" : "#f1f2ef",
                        color: isAvailable ? "#188046" : lot.status === "registered" ? "#c5221f" : "#68727a",
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

      <div className="map-code-select">
        <label htmlFor="map-lot-code">Seleccionar lote</label>
        <select
          id="map-lot-code"
          value={selectedCode ?? ""}
          onChange={(event) => setSelectedCode(event.target.value)}
        >
          {filteredLots.map((lot) => <option key={lot.code} value={lot.code}>{lot.code}</option>)}
        </select>
      </div>

      <div className="map-badge">
        <span className="live-dot" />
        PostgreSQL + PostGIS · 34 lotes
      </div>

      {selectedLot && (
        <div
          style={{
            position: "absolute",
            top: 79,
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
            <div>Estado: <strong style={{ color: selectedLot.status === "available" ? "#219d5e" : selectedLot.status === "registered" ? "#d44754" : "#786741" }}>{selectedLot.statusLabel}</strong></div>
            <div>Área: <strong>{selectedLot.area} m²</strong></div>
          </div>
        </div>
      )}
    </div>
  );
}
