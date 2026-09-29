import fs from 'fs';
import path from 'path';

// Argumentos: node scripts/prepare-postgis-import.mjs [inmobiliaria] [proyecto] [nombreVisibleProyecto]
const args = process.argv.slice(2);
const inmobiliariaSlug = args[0] || 'aquino';
const proyectoSlug = args[1] || 'santa-margarita';
const proyectoNombre = args[2] || 'Santa Margarita';
const inmobiliariaNombre = 'Inmobiliaria Aquino';

const projectDir = path.resolve(process.cwd(), 'datos-privados', 'kml', inmobiliariaSlug, proyectoSlug);
const outputSqlDir = path.resolve(process.cwd(), 'datos-privados', 'sql', inmobiliariaSlug);
const outputSqlPath = path.join(outputSqlDir, `${proyectoSlug}_import.sql`);

if (!fs.existsSync(projectDir)) {
  console.log(`[Error] Directorio no encontrado: ${projectDir}`);
  process.exit(1);
}

const kmlFiles = fs.readdirSync(projectDir).filter(f => f.toLowerCase().endsWith('.kml'));
if (kmlFiles.length === 0) {
  console.log(`[Aviso] No se encontró ningún archivo .kml en: ${projectDir}`);
  console.log(`Coloca el archivo KML de ${proyectoNombre} allí para preparar la importación a PostGIS.`);
  process.exit(0);
}

const targetFile = path.join(projectDir, kmlFiles[0]);
console.log(`Procesando KML para generación SQL: ${targetFile}`);

const content = fs.readFileSync(targetFile, 'utf-8');
const placemarkRegex = /<Placemark[\s\S]*?<\/Placemark>/gi;
const placemarks = content.match(placemarkRegex) || [];

const sqlLines = [];
sqlLines.push(`-- ====================================================================`);
sqlLines.push(`-- SCRIPT DE IMPORTACIÓN AISLADA A POSTGIS (SIN PUBLICAR A WEB)`);
sqlLines.push(`-- Inmobiliaria : ${inmobiliariaNombre} (${inmobiliariaSlug})`);
sqlLines.push(`-- Proyecto     : ${proyectoNombre} (${proyectoSlug})`);
sqlLines.push(`-- Archivo KML  : ${path.basename(targetFile)}`);
sqlLines.push(`-- ====================================================================\n`);
sqlLines.push(`BEGIN;\n`);

sqlLines.push(`-- 1. Asegurar registro de Inmobiliaria`);
sqlLines.push(`INSERT INTO inmobiliarias (nombre, slug)`);
sqlLines.push(`VALUES ('${inmobiliariaNombre}', '${inmobiliariaSlug}')`);
sqlLines.push(`ON CONFLICT (slug) DO UPDATE SET nombre = EXCLUDED.nombre;\n`);

sqlLines.push(`-- 2. Asegurar registro del Proyecto específico vinculado a la Inmobiliaria`);
sqlLines.push(`INSERT INTO proyectos (inmobiliaria_id, nombre, slug)`);
sqlLines.push(`VALUES (`);
sqlLines.push(`  (SELECT id FROM inmobiliarias WHERE slug = '${inmobiliariaSlug}'),`);
sqlLines.push(`  '${proyectoNombre}',`);
sqlLines.push(`  '${proyectoSlug}'`);
sqlLines.push(`)`);
sqlLines.push(`ON CONFLICT (inmobiliaria_id, slug) DO UPDATE SET nombre = EXCLUDED.nombre;\n`);

let lotesCount = 0;

for (let i = 0; i < placemarks.length; i++) {
  const pm = placemarks[i];
  if (!/<Polygon[\s\S]*?<\/Polygon>/i.test(pm)) continue; // Solo procesar geometrías de polígono

  const nameMatch = pm.match(/<name>([\s\S]*?)<\/name>/i);
  const name = nameMatch ? nameMatch[1].trim() : `LOTE-${i + 1}`;

  // Intentar extraer datos de manzana / número si existen en el nombre (ej. "MzA Lote 05" o "L-01")
  let manzana = null;
  let numLote = null;
  const mzMatch = name.match(/MZ[.\s-]*([A-Z0-9]+)/i);
  if (mzMatch) manzana = mzMatch[1];
  const lotMatch = name.match(/LOTE[.\s-]*([0-9]+)/i);
  if (lotMatch) numLote = lotMatch[1];

  const coordMatch = pm.match(/<coordinates>([\s\S]*?)<\/coordinates>/i);
  if (!coordMatch) continue;

  const rawCoords = coordMatch[1].trim().split(/\s+/);
  const ring = [];
  for (const c of rawCoords) {
    const parts = c.split(',');
    if (parts.length >= 2) {
      const lng = parseFloat(parts[0]);
      const lat = parseFloat(parts[1]);
      if (!isNaN(lng) && !isNaN(lat)) {
        ring.push(`${lng} ${lat}`);
      }
    }
  }

  if (ring.length >= 3) {
    // Asegurar que el anillo esté cerrado (primer punto = último punto)
    if (ring[0] !== ring[ring.length - 1]) {
      ring.push(ring[0]);
    }
    const wkt = `POLYGON((${ring.join(', ')}))`;
    const escapedName = name.replace(/'/g, "''");
    const mzVal = manzana ? `'${manzana}'` : 'NULL';
    const numVal = numLote ? `'${numLote}'` : 'NULL';

    sqlLines.push(
      `INSERT INTO lotes (proyecto_id, codigo, manzana, numero_lote, estado, area_m2, geom)` +
      ` VALUES (` +
      `  (SELECT id FROM proyectos WHERE slug = '${proyectoSlug}' AND inmobiliaria_id = (SELECT id FROM inmobiliarias WHERE slug = '${inmobiliariaSlug}')),` +
      `  '${escapedName}',` +
      `  ${mzVal},` +
      `  ${numVal},` +
      `  'disponible',` +
      `  ROUND(ST_Area(ST_GeomFromText('${wkt}', 4326)::geography)::numeric, 2),` +
      `  ST_GeomFromText('${wkt}', 4326)` +
      ` )` +
      ` ON CONFLICT (proyecto_id, codigo) DO UPDATE SET` +
      `  geom = EXCLUDED.geom,` +
      `  area_m2 = EXCLUDED.area_m2;`
    );
    lotesCount++;
  }
}

// 3. Actualizar la geometría envolvente del proyecto basada en sus lotes
sqlLines.push(`\n-- 3. Calcular y actualizar el polígono envolvente general del proyecto`);
sqlLines.push(`UPDATE proyectos SET geom = sub.envolvente FROM (`);
sqlLines.push(`  SELECT ST_ConvexHull(ST_Collect(geom)) AS envolvente FROM lotes`);
sqlLines.push(`  WHERE proyecto_id = (SELECT id FROM proyectos WHERE slug = '${proyectoSlug}' AND inmobiliaria_id = (SELECT id FROM inmobiliarias WHERE slug = '${inmobiliariaSlug}'))`);
sqlLines.push(`) sub WHERE slug = '${proyectoSlug}' AND inmobiliaria_id = (SELECT id FROM inmobiliarias WHERE slug = '${inmobiliariaSlug}');`);

sqlLines.push(`\nCOMMIT;\n`);

if (!fs.existsSync(outputSqlDir)) {
  fs.mkdirSync(outputSqlDir, { recursive: true });
}

fs.writeFileSync(outputSqlPath, sqlLines.join('\n'), 'utf-8');

if (lotesCount === 0) {
  console.log(`\n[Atención] Se encontraron elementos en el KML pero NINGUNO es un polígono cerrado (<Polygon>).`);
  console.log(`Para registrar lotes en PostGIS se requieren geometrías de polígono cerrado.`);
  console.log(`Si el archivo contiene líneas sueltas (LineStrings de AutoCAD), se debe exportar asegurando polígonos cerrados.`);
} else {
  console.log(`\n[Éxito] Se generó el script SQL preparado para PostGIS:`);
  console.log(`--> ${outputSqlPath}`);
  console.log(`Total de lotes poligonales preparados: ${lotesCount}`);
}
console.log(`\n[Nota de seguridad] No se ha ejecutado el archivo en la base de datos ni publicado en la web.`);
