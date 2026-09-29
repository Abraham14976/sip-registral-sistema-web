import { readFile } from "node:fs/promises";
import path from "node:path";
import { DOMParser } from "@xmldom/xmldom";

const sourcePath = path.join(
  process.cwd(),
  "datos-privados",
  "kml",
  "aquino",
  "santa-margarita",
  "Santa Margarita Etap3.kml",
);

function descendants(node, localName) {
  return [...node.getElementsByTagName("*")].filter((element) => element.localName === localName);
}

function textOf(node) {
  return node?.textContent?.trim() || "";
}

function parseRing(ringNode, label, errors) {
  const coordinateNode = descendants(ringNode, "coordinates")[0];
  const coordinateText = textOf(coordinateNode);
  const points = coordinateText.split(/\s+/).filter(Boolean).map((coordinate) => {
    const [longitudeText, latitudeText] = coordinate.split(",");
    const longitude = Number(longitudeText);
    const latitude = Number(latitudeText);

    if (!Number.isFinite(longitude) || !Number.isFinite(latitude) || Math.abs(longitude) > 180 || Math.abs(latitude) > 90) {
      errors.push(`${label}: coordenada no válida en WGS84`);
      return null;
    }

    return [longitude, latitude];
  });

  if (points.length < 4 || points.some((point) => point === null)) {
    errors.push(`${label}: anillo con menos de 4 coordenadas válidas`);
    return null;
  }

  const first = points[0];
  const last = points.at(-1);
  if (first[0] !== last[0] || first[1] !== last[1]) {
    errors.push(`${label}: anillo abierto`);
    return null;
  }

  return points;
}

export function parseSantaMargaritaEtapa3Kml(content) {
  const parserErrors = [];
  const document = new DOMParser({
    onError: (level, message) => parserErrors.push(`${level}: ${message}`),
  }).parseFromString(content, "application/xml");

  if (parserErrors.length || document.documentElement?.localName !== "kml") {
    return { lots: [], errors: parserErrors.length ? parserErrors : ["Documento KML no válido"] };
  }

  const placemarks = descendants(document, "Placemark");
  const lots = [];
  const errors = [];
  const codes = new Map();

  for (const [index, placemark] of placemarks.entries()) {
    const label = textOf(descendants(placemark, "name")[0]) || `Placemark ${index + 1}`;
    const codeNodes = descendants(placemark, "Data").filter((node) => node.getAttribute("name")?.trim().toUpperCase() === "CODIGO_LOTE")
      .flatMap((node) => descendants(node, "value"))
      .concat(descendants(placemark, "SimpleData").filter((node) => node.getAttribute("name")?.trim().toUpperCase() === "CODIGO_LOTE"));
    const codeValues = codeNodes.map(textOf).filter(Boolean);
    const featureErrors = [];
    const polygons = descendants(placemark, "Polygon");

    if (polygons.length !== 1) featureErrors.push(`se esperaba 1 Polygon y se encontraron ${polygons.length}`);
    if (codeValues.length !== 1) featureErrors.push("CODIGO_LOTE ausente, vacío o repetido en el Placemark");

    let rings = [];
    if (polygons.length === 1) {
      const polygon = polygons[0];
      const outerBoundaries = descendants(polygon, "outerBoundaryIs");
      const innerBoundaries = descendants(polygon, "innerBoundaryIs");
      if (outerBoundaries.length !== 1) featureErrors.push(`se esperaba 1 límite exterior y se encontraron ${outerBoundaries.length}`);

      const boundaryNodes = [...outerBoundaries, ...innerBoundaries];
      rings = boundaryNodes.map((boundary, ringIndex) => {
        const linearRing = descendants(boundary, "LinearRing")[0];
        if (!linearRing) {
          featureErrors.push(`anillo ${ringIndex + 1} sin LinearRing`);
          return null;
        }
        return parseRing(linearRing, `${label}, anillo ${ringIndex + 1}`, featureErrors);
      });
    }

    const code = codeValues[0] || "";
    if (code) {
      const normalizedCode = code.toLocaleUpperCase("en-US");
      const previous = codes.get(normalizedCode);
      if (previous) {
        previous.errors.push(`CODIGO_LOTE duplicado: ${code}`);
        featureErrors.push(`CODIGO_LOTE duplicado: ${code}`);
      }
    }

    const feature = { code, placemark: label, rings, errors: featureErrors };
    if (code && !codes.has(code.toLocaleUpperCase("en-US"))) codes.set(code.toLocaleUpperCase("en-US"), feature);
    lots.push(feature);
  }

  if (placemarks.length === 0) errors.push("El KML no contiene Placemark");
  for (const lot of lots) {
    errors.push(...lot.errors.map((message) => `${lot.code || lot.placemark}: ${message}`));
  }

  const validLots = lots.filter((lot) => lot.errors.length === 0).map((lot) => ({
    code: lot.code,
    placemark: lot.placemark,
    rings: lot.rings,
    wkt: `POLYGON(${lot.rings.map((ring) => `(${ring.map(([longitude, latitude]) => `${longitude} ${latitude}`).join(", ")})`).join(", ")})`,
  }));

  return { lots: validLots, errors };
}

export async function readSantaMargaritaEtapa3Kml() {
  return parseSantaMargaritaEtapa3Kml(await readFile(sourcePath, "utf8"));
}