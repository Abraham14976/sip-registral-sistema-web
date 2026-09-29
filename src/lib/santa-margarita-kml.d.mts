export interface ValidatedKmlLot {
  code: string;
  placemark: string;
  rings: [number, number][][];
  wkt: string;
}

export function parseSantaMargaritaEtapa3Kml(content: string): {
  lots: ValidatedKmlLot[];
  errors: string[];
};

export function readSantaMargaritaEtapa3Kml(): Promise<{
  lots: ValidatedKmlLot[];
  errors: string[];
}>;