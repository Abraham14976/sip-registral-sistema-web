"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, Polygon, Popup, TileLayer, useMap } from "react-leaflet";
import type { SantaMargaritaEtapa3Lot } from "@/lib/santa-margarita-etapa3";
import styles from "./SantaMargaritaEtapa3Map.module.css";
import "leaflet/dist/leaflet.css";

function FitStageBounds({ bounds }: { bounds: [[number, number], [number, number]] }) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(bounds, { padding: [32, 32], maxZoom: 17 });
  }, [bounds, map]);

  return null;
}

export default function SantaMargaritaEtapa3Map({ lots }: { lots: SantaMargaritaEtapa3Lot[] }) {
  const bounds = useMemo<[[number, number], [number, number]]>(() => {
    const positions = lots.flatMap((lot) => lot.polygon);
    const latitudes = positions.map(([latitude]) => latitude);
    const longitudes = positions.map(([, longitude]) => longitude);

    return [
      [Math.min(...latitudes), Math.min(...longitudes)],
      [Math.max(...latitudes), Math.max(...longitudes)],
    ];
  }, [lots]);

  const center: [number, number] = [
    (bounds[0][0] + bounds[1][0]) / 2,
    (bounds[0][1] + bounds[1][1]) / 2,
  ];

  return (
    <div className={styles.mapShell} aria-label="Mapa de lotes de Santa Margarita Etapa 3">
      <MapContainer center={center} zoom={17} maxZoom={20} scrollWheelZoom className={styles.map}>
        <TileLayer
          attribution="&copy; Esri, Maxar, Earthstar Geographics"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxNativeZoom={17}
          maxZoom={20}
        />
        <FitStageBounds bounds={bounds} />
        {lots.map((lot) => (
          <Polygon
            key={lot.code}
            positions={lot.polygon}
            pathOptions={{ color: "#ffe16a", fillColor: "#e5b934", fillOpacity: 0.35, weight: 8 }}
          >
            <Popup>
              <div className={styles.popup}>
                <strong>{lot.code}</strong>
                {lot.area !== null && <span>Área: {lot.area} m²</span>}
              </div>
            </Popup>
          </Polygon>
        ))}
      </MapContainer>
      <div className={styles.mapBadge}>Lotes importados desde PostgreSQL + PostGIS</div>
    </div>
  );
}