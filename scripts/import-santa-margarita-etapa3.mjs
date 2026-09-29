import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import { readSantaMargaritaEtapa3Kml } from "../src/lib/santa-margarita-kml.mjs";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const text = line.trim();
    if (!text || text.startsWith("#")) continue;
    const separator = text.indexOf("=");
    if (separator < 1) continue;
    const key = text.slice(0, separator).trim();
    let value = text.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(path.resolve(process.cwd(), ".env.local"));
loadEnvFile(path.resolve(process.cwd(), ".env"));

const { lots, errors } = await readSantaMargaritaEtapa3Kml();
if (errors.length > 0) {
  console.error(JSON.stringify({ imported: 0, rejected: errors }, null, 2));
  process.exit(1);
}

const databaseConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.PGHOST || "127.0.0.1",
      port: Number(process.env.PGPORT || 5432),
      database: process.env.PGDATABASE || "postgres",
      user: process.env.PGUSER || "postgres",
      password: process.env.PGPASSWORD || undefined,
    };

const client = new pg.Client({ ...databaseConfig, connectionTimeoutMillis: 5000 });
let transactionStarted = false;

try {
  await client.connect();
  const schemaPath = path.resolve(process.cwd(), "db", "schema.sql");
  await client.query(fs.readFileSync(schemaPath, "utf8"));
  await client.query("BEGIN");
  transactionStarted = true;

  await client.query(
    "INSERT INTO inmobiliarias (nombre, slug) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING",
    ["Inmobiliaria Aquino", "aquino"],
  );
  const companyResult = await client.query(
    "SELECT id FROM inmobiliarias WHERE slug = $1 FOR UPDATE",
    ["aquino"],
  );
  if (companyResult.rowCount !== 1) throw new Error("AQUINO_NOT_FOUND");

  const companyId = companyResult.rows[0].id;
  let projectResult = await client.query(
    "SELECT id FROM proyectos WHERE inmobiliaria_id = $1 AND slug = $2 FOR UPDATE",
    [companyId, "santa-margarita"],
  );

  if (projectResult.rowCount === 0) {
    projectResult = await client.query(
      "INSERT INTO proyectos (inmobiliaria_id, nombre, slug) VALUES ($1, $2, $3) RETURNING id",
      [companyId, "Santa Margarita", "santa-margarita"],
    );
  }

  const projectId = projectResult.rows[0].id;
  const validGeometries = [];

  for (const lot of lots) {
    const geometryResult = await client.query(
      `SELECT ST_IsValid(geometry) AS valid, ST_IsValidReason(geometry) AS reason
       FROM (SELECT ST_GeomFromText($1, 4326) AS geometry) AS candidate`,
      [lot.wkt],
    );
    const geometry = geometryResult.rows[0];
    if (!geometry.valid) {
      throw new Error(`INVALID_GEOMETRY:${lot.code}:${geometry.reason}`);
    }
    validGeometries.push(lot);
  }

  for (const lot of validGeometries) {
    await client.query(
      `INSERT INTO lotes (proyecto_id, codigo, estado, area_m2, geom)
       VALUES (
         $1,
         $2,
         NULL,
         ROUND(ST_Area(ST_GeomFromText($3, 4326)::geography)::numeric, 2),
         ST_GeomFromText($3, 4326)
       )
       ON CONFLICT (proyecto_id, codigo) DO UPDATE
       SET area_m2 = EXCLUDED.area_m2, geom = EXCLUDED.geom`,
      [projectId, lot.code, lot.wkt],
    );
  }

  const codes = validGeometries.map((lot) => lot.code);
  const verification = await client.query(
    `SELECT l.codigo
     FROM lotes l
     WHERE l.proyecto_id = $1 AND l.codigo = ANY($2::text[])
       AND ST_IsValid(l.geom)
     ORDER BY l.codigo`,
    [projectId, codes],
  );

  if (verification.rowCount !== codes.length) throw new Error("POSTGIS_VERIFICATION_COUNT_MISMATCH");

  await client.query("COMMIT");
  transactionStarted = false;
  console.log(JSON.stringify({ imported: verification.rowCount, codes: verification.rows.map((row) => row.codigo), rejected: [] }, null, 2));
} catch (error) {
  if (transactionStarted) await client.query("ROLLBACK").catch(() => {});
  const message = error instanceof Error ? error.message : "IMPORT_FAILED";
  const geometryError = message.startsWith("INVALID_GEOMETRY:") ? message.slice("INVALID_GEOMETRY:".length) : undefined;
  const errorCode = geometryError
    ? "INVALID_GEOMETRY"
    : message === "AQUINO_NOT_FOUND" || message === "POSTGIS_VERIFICATION_COUNT_MISMATCH"
      ? message
      : /client password must be a string/i.test(message)
        ? "PGPASSWORD_MISSING"
        : error?.code || "IMPORT_FAILED";
  console.error(JSON.stringify({ imported: 0, errorCode, geometryError, rejected: [] }, null, 2));
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}