import LotTable from "@/components/LotTable";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

const companies = {
  "valle-norte": "Inmobiliaria DEMO Valle Norte",
  "portal-cajamarca": "Inmobiliaria DEMO Portal Cajamarca",
  "tierra-inca": "Inmobiliaria DEMO Tierra Inca",
  "mirador-andino": "Inmobiliaria DEMO Mirador Andino",
} as const;

const projectLots = [
  { code: "DEMO-P-01", area: "120 m²", status: "Disponible", tone: "available" as const },
  { code: "DEMO-P-02", area: "140 m²", status: "Registrado en SIP", tone: "registered" as const },
  { code: "DEMO-P-03", area: "160 m²", status: "Disponible", tone: "available" as const },
];

export function generateStaticParams() {
  return Object.keys(companies).map((slug) => ({ slug }));
}

export default async function DemoCompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = companies[slug as keyof typeof companies] ?? "Inmobiliaria DEMO";

  return <main><SiteHeader active="Inmobiliarias" /><section className="company-hero"><div className="company-logo large">DEMO</div><div><p className="eyebrow">Inmobiliaria DEMO</p><h1>{company.replace("Inmobiliaria DEMO ", "")}</h1><p>Ficha de demostración preparada para organizar proyectos y lotes georreferenciados.</p></div><span className="status-label">Datos pendientes</span></section><section className="directory-section"><div className="section-heading"><div><p className="eyebrow">Nivel 2: proyectos</p><h2>Proyectos de {company}</h2></div><span className="demo-note">Contenido DEMO</span></div><p className="section-note project-note">Esta pantalla es funcional como estructura, pero todavía no contiene nombres, ubicaciones, propietarios ni documentos reales.</p><article className="project-detail-card"><div className="project-detail-copy"><p className="eyebrow">Proyecto DEMO</p><h3>Proyecto principal DEMO</h3><p className="muted">Aquí aparecerán los proyectos reales cuando se autoricen sus datos y se importe su KML o CAD.</p><div className="detail-meta"><span>1 proyecto DEMO</span><span>3 lotes DEMO</span><span>Ubicación pendiente</span></div></div><div className="project-placeholder">Polígono del proyecto<br /><small>Esperando KML/CAD real</small></div><div className="project-lots"><p className="eyebrow">Nivel 3: lotes del proyecto</p><LotTable lots={projectLots} /></div></article></section><SiteFooter /></main>;
}
