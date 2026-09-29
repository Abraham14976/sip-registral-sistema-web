import fs from 'fs';
import path from 'path';
import pg from 'pg';

// Cargar variables de entorno de .env.local o .env si existen
const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

loadEnvFile(envLocalPath);
loadEnvFile(envPath);

const dbConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.PGHOST || '127.0.0.1',
      port: parseInt(process.env.PGPORT || '5432', 10),
      database: process.env.PGDATABASE || 'postgres',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || undefined,
    };

const client = new pg.Client(dbConfig);

async function runImport() {
  console.log(`\n======================================================`);
  console.log(`  SIP REGISTRAL - IMPORTADOR POSTGIS (POLLOC)`);
  console.log(`  Host     : ${dbConfig.host || 'vía DATABASE_URL'}`);
  console.log(`  Database : ${dbConfig.database || 'vía DATABASE_URL'}`);
  console.log(`  Usuario  : ${dbConfig.user || 'vía DATABASE_URL'}`);
  console.log(`======================================================\n`);

  try {
    await client.connect();
    console.log('[Conexión] Conectado exitosamente a PostgreSQL.');

    // 1. Ejecutar esquema base si no existe
    const schemaPath = path.resolve(process.cwd(), 'db', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('[Esquema] Verificando tablas y extensión PostGIS...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      await client.query(schemaSql);
      console.log('[Esquema] Tablas e índices espaciales verificados.');
    }

    // 2. Ejecutar importación de Polloc
    const pollocSqlPath = path.resolve(process.cwd(), 'datos-privados', 'sql', 'aquino', 'polloc_import.sql');
    if (!fs.existsSync(pollocSqlPath)) {
      console.error(`[Error] No se encontró el archivo SQL en: ${pollocSqlPath}`);
      process.exit(1);
    }

    console.log('[Importación] Ejecutando inserción de lote Polloc...');
    const pollocSql = fs.readFileSync(pollocSqlPath, 'utf-8');
    await client.query(pollocSql);

    // 3. Consultar y verificar el lote insertado en PostGIS
    const query = `
      SELECT 
        l.id,
        l.codigo,
        l.estado,
        l.area_m2,
        p.nombre AS proyecto,
        i.nombre AS inmobiliaria,
        ST_AsGeoJSON(l.geom) AS geojson,
        ST_X(ST_Centroid(l.geom)) AS lng_centro,
        ST_Y(ST_Centroid(l.geom)) AS lat_centro
      FROM lotes l
      JOIN proyectos p ON l.proyecto_id = p.id
      JOIN inmobiliarias i ON p.inmobiliaria_id = i.id
      WHERE p.slug = 'polloc' AND i.slug = 'aquino';
    `;

    const res = await client.query(query);
    console.log(`\n[Éxito PostGIS] Se encontraron ${res.rowCount} lote(s) en la base de datos:`);
    res.rows.forEach((r) => {
      console.log(`- Código: ${r.codigo} | Proyecto: ${r.proyecto} (${r.inmobiliaria})`);
      console.log(`  Área calculada: ${r.area_m2} m² | Estado: ${r.estado}`);
      console.log(`  Centroide: Lat ${parseFloat(r.lat_centro).toFixed(6)}, Lng ${parseFloat(r.lng_centro).toFixed(6)}`);
    });

  } catch (err) {
    console.error('\n[Error de conexión/ejecución]');
    console.error(err.message);
    console.log('\nSi la base de datos requiere contraseña, puedes configurar la variable DATABASE_URL en un archivo .env.local:');
    console.log('DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/tu_base_datos\n');
  } finally {
    await client.end();
  }
}

runImport();
