import pool from "@/lib/db";

export interface SantaMargaritaEtapa3Lot {
  code: string;
  area: number | null;
  polygon: [number, number][];
}

export async function getSantaMargaritaEtapa3FromPostGIS(): Promise<{
  lots: SantaMargaritaEtapa3Lot[];
  error?: string;
}> {
  try {
    const result = await pool.query(
      `
      SELECT l.codigo, l.area_m2, ST_AsGeoJSON(l.geom) AS geojson, ST_IsValid(l.geom) AS geometry_valid
      FROM lotes l
      JOIN proyectos p ON p.id = l.proyecto_id
      JOIN inmobiliarias i ON i.id = p.inmobiliaria_id
      WHERE i.slug = 'aquino'
        AND p.slug = 'santa-margarita'
      ORDER BY l.codigo;
      `,
    );

    if (result.rows.length !== 34 || result.rows.some((row) => !row.geometry_valid)) {
      return {
        lots: [],
        error: `PostGIS debe contener 34 lotes con geometría válida de Etapa 3; contiene ${result.rows.length}.`,
      };
    }

    const lots = result.rows.map((row) => {
      const geometry = JSON.parse(row.geojson);
      if (geometry.type !== "Polygon" || !Array.isArray(geometry.coordinates?.[0])) {
        throw new Error("PostGIS devolvió una geometría inesperada.");
      }
      return {
        code: row.codigo,
        area: row.area_m2 === null ? null : Number(row.area_m2),
        polygon: geometry.coordinates[0].map(([longitude, latitude]: [number, number]) => [latitude, longitude] as [number, number]),
      };
    });

    return { lots };
  } catch {
    return { lots: [], error: "No se pudo cargar Santa Margarita Etapa 3 desde PostgreSQL/PostGIS. Revisa la configuración local de la base de datos." };
  }
}