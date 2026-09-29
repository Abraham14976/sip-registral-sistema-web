import fs from 'fs';
import path from 'path';

const srcPath = path.resolve(process.cwd(), 'datos-privados', 'kml', 'aquino', 'santa-margarita', 'prueba.kml');
const targetDir = path.resolve(process.cwd(), 'datos-privados', 'kml', 'aquino', 'polloc');
const targetPath = path.join(targetDir, 'polloc_lote_01.kml');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

if (!fs.existsSync(srcPath)) {
  console.error(`[Error] Archivo fuente no encontrado: ${srcPath}`);
  process.exit(1);
}

const content = fs.readFileSync(srcPath, 'utf8');
const coordsMatch = content.match(/<coordinates>([\s\S]*?)<\/coordinates>/i);
if (!coordsMatch) {
  console.error('[Error] No se encontraron coordenadas en prueba.kml');
  process.exit(1);
}

const rawCoords = coordsMatch[1].trim();

const kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Polloc - Lote 01</name>
    <description>Proyecto Polloc - Inmobiliaria Aquino</description>
    <Placemark id="POLLOC-01">
      <name>POLLOC-01</name>
      <description><![CDATA[Proyecto: Polloc<br/>Estado: Disponible]]></description>
      <Polygon>
        <extrude>0</extrude>
        <altitudeMode>clampToGround</altitudeMode>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              ${rawCoords}
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
  </Document>
</kml>
`;

fs.writeFileSync(targetPath, kmlContent, 'utf8');
console.log(`[Éxito] Archivo KML con <Polygon> generado en: ${targetPath}`);
