import fs from 'fs';
import path from 'path';

const kmlPath = path.resolve(process.cwd(), 'datos-privados', 'kml', 'aquino', 'polloc', 'polloc_lote_01.kml');
const content = fs.readFileSync(kmlPath, 'utf8');
const coordsMatch = content.match(/<coordinates>([\s\S]*?)<\/coordinates>/i);
if (!coordsMatch) {
  console.error('No coords found');
  process.exit(1);
}

const pts = coordsMatch[1].trim().split(/\s+/).map(p => {
  const [lng, lat] = p.split(',').map(Number);
  return [Number(lat.toFixed(7)), Number(lng.toFixed(7))];
});

const tsContent = `// Datos de lotes para el mapa SIP (Integración PostGIS y datos DEMO)
export type LotStatus = 'available' | 'registered';

export interface LotItem {
  code: string;
  inmobiliaria: string;
  inmobiliariaSlug: string;
  proyecto: string;
  proyectoSlug: string;
  area: number;
  status: LotStatus;
  statusLabel: string;
  isReal: boolean;
  polygon: [number, number][];
}

// Lote real importado de Inmobiliaria Aquino -> Proyecto Polloc
export const pollocLot: LotItem = {
  code: 'POLLOC-01',
  inmobiliaria: 'Inmobiliaria Aquino',
  inmobiliariaSlug: 'aquino',
  proyecto: 'Polloc',
  proyectoSlug: 'polloc',
  area: 178.02,
  status: 'available',
  statusLabel: 'Disponible',
  isReal: true,
  polygon: ${JSON.stringify(pts)}
};

// Lotes de prueba DEMO preservados
export const demoLots: LotItem[] = [
  {
    code: 'DEMO-A01',
    inmobiliaria: 'Inmobiliaria DEMO',
    inmobiliariaSlug: 'demo',
    proyecto: 'Proyecto DEMO Los Sauces',
    proyectoSlug: 'los-sauces',
    area: 120,
    status: 'available',
    statusLabel: 'Disponible',
    isReal: false,
    polygon: [[0.08, -0.12], [0.08, -0.03], [0.01, -0.03], [0.01, -0.12]]
  },
  {
    code: 'DEMO-A02',
    inmobiliaria: 'Inmobiliaria DEMO',
    inmobiliariaSlug: 'demo',
    proyecto: 'Proyecto DEMO Los Sauces',
    proyectoSlug: 'los-sauces',
    area: 120,
    status: 'registered',
    statusLabel: 'Registrado en SIP',
    isReal: false,
    polygon: [[0.08, -0.02], [0.08, 0.07], [0.01, 0.07], [0.01, -0.02]]
  },
  {
    code: 'DEMO-A03',
    inmobiliaria: 'Inmobiliaria DEMO',
    inmobiliariaSlug: 'demo',
    proyecto: 'Proyecto DEMO Los Sauces',
    proyectoSlug: 'los-sauces',
    area: 135,
    status: 'available',
    statusLabel: 'Disponible',
    isReal: false,
    polygon: [[0, -0.12], [0, -0.03], [-0.08, -0.03], [-0.08, -0.12]]
  }
];

export const allLots: LotItem[] = [pollocLot, ...demoLots];
`;

const targetDir = path.resolve(process.cwd(), 'src', 'data');
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
fs.writeFileSync(path.join(targetDir, 'lotsData.ts'), tsContent, 'utf8');
console.log(`[Éxito] src/data/lotsData.ts generado con ${pts.length} vértices.`);
