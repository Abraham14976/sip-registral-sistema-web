-- Esquema SIP Registral (PostgreSQL + PostGIS)
-- Activar la extensión espacial PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Tabla de Inmobiliarias
CREATE TABLE IF NOT EXISTS inmobiliarias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    ruc VARCHAR(20),
    contacto VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Proyectos
CREATE TABLE IF NOT EXISTS proyectos (
    id SERIAL PRIMARY KEY,
    inmobiliaria_id INTEGER NOT NULL REFERENCES inmobiliarias(id) ON DELETE CASCADE,
    nombre VARCHAR(150) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    departamento VARCHAR(50),
    provincia VARCHAR(50),
    distrito VARCHAR(50),
    geom GEOMETRY(Geometry, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_proyecto_inmobiliaria_slug UNIQUE (inmobiliaria_id, slug)
);

-- 3. Tabla de Lotes
CREATE TABLE IF NOT EXISTS lotes (
    id SERIAL PRIMARY KEY,
    proyecto_id INTEGER NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL,
    manzana VARCHAR(10),
    numero_lote VARCHAR(20),
    area_m2 NUMERIC(10, 2),
    perimetro_m NUMERIC(10, 2),
    estado VARCHAR(30) DEFAULT 'disponible', -- 'disponible', 'reservado', 'registrado'
    geom GEOMETRY(Polygon, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_lote_proyecto_codigo UNIQUE (proyecto_id, codigo)
);

-- Índices espaciales para optimizar consultas de mapa
CREATE INDEX IF NOT EXISTS idx_proyectos_geom ON proyectos USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_lotes_geom ON lotes USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_lotes_proyecto ON lotes (proyecto_id);
CREATE INDEX IF NOT EXISTS idx_lotes_estado ON lotes (estado);
