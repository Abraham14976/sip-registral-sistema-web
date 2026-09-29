import fs from 'fs';
import path from 'path';

// Permite pasar argumentos: node scripts/inspect-kml.mjs [inmobiliaria] [proyecto]
// Por defecto: inmobiliaria='aquino', proyecto='santa-margarita'
const args = process.argv.slice(2);
const inmobiliariaSlug = args[0] || 'aquino';
const proyectoSlug = args[1] || 'santa-margarita';

const projectDir = path.resolve(process.cwd(), 'datos-privados', 'kml', inmobiliariaSlug, proyectoSlug);

console.log(`\n======================================================`);
console.log(`  SIP REGISTRAL - INSPECCIÓN KML POR PROYECTO`);
console.log(`  Inmobiliaria : ${inmobiliariaSlug}`);
console.log(`  Proyecto     : ${proyectoSlug}`);
console.log(`  Directorio   : ${projectDir}`);
console.log(`======================================================\n`);

if (!fs.existsSync(projectDir)) {
  fs.mkdirSync(projectDir, { recursive: true });
}

// Buscar archivos .kml única y exclusivamente en la carpeta asignada a este proyecto
const kmlFiles = fs.readdirSync(projectDir).filter(f => f.toLowerCase().endsWith('.kml'));

if (kmlFiles.length === 0) {
  console.log(`[ESTADO: ESPERANDO ARCHIVO]`);
  console.log(`No se encontró ningún archivo KML en la carpeta del proyecto.`);
  console.log(`\nRuta requerida:`);
  console.log(`--> ${projectDir}\\<archivo>.kml`);
  console.log(`\nEjemplo sugerido: santa-margarita.kml`);
  console.log(`\nPor favor, coloca el archivo KML de Santa Margarita en esa carpeta y vuelve a ejecutar.`);
  process.exit(0);
}

const targetFile = path.join(projectDir, kmlFiles[0]);
const fileStats = fs.statSync(targetFile);
console.log(`[ARCHIVO DETECTADO]`);
console.log(`Nombre : ${path.basename(targetFile)}`);
console.log(`Tamaño : ${(fileStats.size / 1024).toFixed(2)} KB`);
console.log(`Ruta   : ${targetFile}\n`);

const content = fs.readFileSync(targetFile, 'utf-8');

// Extraer Placemarks
const placemarkRegex = /<Placemark[\s\S]*?<\/Placemark>/gi;
const placemarks = content.match(placemarkRegex) || [];

let totalPolygons = 0;
let totalLines = 0;
let totalPoints = 0;
let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
const lotesDetalle = [];

for (let i = 0; i < placemarks.length; i++) {
  const pm = placemarks[i];
  const nameMatch = pm.match(/<name>([\s\S]*?)<\/name>/i);
  const name = nameMatch ? nameMatch[1].trim() : `Elemento-${i + 1}`;

  // Buscar descripción o datos extendidos
  const descMatch = pm.match(/<description>([\s\S]*?)<\/description>/i);
  const desc = descMatch ? descMatch[1].trim() : '';

  const hasPolygon = /<Polygon[\s\S]*?<\/Polygon>/i.test(pm);
  const hasLine = /<LineString[\s\S]*?<\/LineString>/i.test(pm);
  const hasPoint = /<Point[\s\S]*?<\/Point>/i.test(pm);

  if (hasPolygon) totalPolygons++;
  else if (hasLine) totalLines++;
  else if (hasPoint) totalPoints++;

  const coordMatch = pm.match(/<coordinates>([\s\S]*?)<\/coordinates>/i);
  if (coordMatch) {
    const rawCoords = coordMatch[1].trim().split(/\s+/);
    const coords = [];
    for (const c of rawCoords) {
      const parts = c.split(',');
      if (parts.length >= 2) {
        const lng = parseFloat(parts[0]);
        const lat = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          coords.push([lng, lat]);
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
          if (lng < minLng) minLng = lng;
          if (lng > maxLng) maxLng = lng;
        }
      }
    }

    if (hasPolygon) {
      lotesDetalle.push({
        codigo: name,
        vertices: coords.length,
        descripcion: desc ? desc.substring(0, 50) : null,
        primerPunto: coords[0] || null
      });
    }
  }
}

console.log(`=== RESULTADOS DE LA INSPECCIÓN ===`);
console.log(`- Total de elementos (Placemarks) : ${placemarks.length}`);
console.log(`- Polígonos de lote detectados    : ${totalPolygons}`);
console.log(`- Líneas / Vías / Trazos          : ${totalLines}`);
console.log(`- Puntos / Hitos                  : ${totalPoints}`);

if (minLat <= maxLat && minLng <= maxLng) {
  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;
  console.log(`\n=== ENVOLVENTE GEOGRÁFICA (WGS84) ===`);
  console.log(`- Latitud min / max : [${minLat.toFixed(6)}, ${maxLat.toFixed(6)}]`);
  console.log(`- Longitud min / max: [${minLng.toFixed(6)}, ${maxLng.toFixed(6)}]`);
  console.log(`- Centro aproximado : Lat ${centerLat.toFixed(6)}, Lng ${centerLng.toFixed(6)}`);

  // Validación de rango Perú (aproximado: Lat -19° a 0°, Lng -82° a -68°)
  const enPeru = (minLat >= -19 && maxLat <= 1 && minLng >= -82 && maxLng <= -68);
  if (enPeru) {
    console.log(`- Validación territorial: Coordenadas coherentes con la región de Perú.`);
  } else {
    console.log(`- [Aviso] Verificar el sistema de coordenadas. Podría no estar en WGS84 decimal grados.`);
  }
}

if (lotesDetalle.length > 0) {
  console.log(`\n=== MUESTRA DE LOTES (Primeros 10 de ${lotesDetalle.length}) ===`);
  lotesDetalle.slice(0, 10).forEach((lote, idx) => {
    console.log(`  ${idx + 1}. Código: "${lote.codigo}" | Vértices: ${lote.vertices}`);
  });
}

console.log(`\n[SEGURIDAD] Inspección 100% de solo lectura. No se ha modificado la BD ni los datos DEMO.`);
