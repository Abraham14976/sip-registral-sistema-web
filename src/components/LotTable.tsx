type Lot = { code: string; area: string; status: string; tone: "available" | "registered" };

type LotTableProps = { lots?: Lot[] };

const defaultLots: Lot[] = [
  { code: "DEMO-A01", area: "120 m²", status: "Disponible", tone: "available" },
  { code: "DEMO-A02", area: "120 m²", status: "Registrado en SIP", tone: "registered" },
  { code: "DEMO-A03", area: "135 m²", status: "Disponible", tone: "available" },
];

export default function LotTable({ lots = defaultLots }: LotTableProps) {
  return <div className="lot-table"><div className="table-head"><span>Lotes DEMO</span><span>Área</span><span>Estado</span></div>{lots.map((lot) => <div className="table-row" key={lot.code}><strong>{lot.code}</strong><span>{lot.area}</span><span className={`lot-status ${lot.tone}`}><i />{lot.status}</span></div>)}</div>;
}
