import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

const demoCompanies = [
  { initials: "VN", name: "Inmobiliaria DEMO Valle Norte", slug: "valle-norte", description: "Ficha de prueba preparada para incorporar proyectos y lotes autorizados." },
  { initials: "PC", name: "Inmobiliaria DEMO Portal Cajamarca", slug: "portal-cajamarca", description: "Espacio DEMO para futuros proyectos georreferenciados." },
  { initials: "TI", name: "Inmobiliaria DEMO Tierra Inca", slug: "tierra-inca", description: "Registro de demostración pendiente de información oficial." },
  { initials: "MA", name: "Inmobiliaria DEMO Mirador Andino", slug: "mirador-andino", description: "Ficha de prueba sin ubicaciones ni lotes reales cargados." },
];

export default function InmobiliariasPage() {
  return <main><SiteHeader active="Inmobiliarias" /><section className="page-intro"><p className="eyebrow">Red inmobiliaria</p><h1>Inmobiliarias afiliadas</h1><p>Consulta las inmobiliarias y sus proyectos georreferenciados cuando sus datos hayan sido autorizados.</p></section><section className="directory-section"><div className="directory-header"><h2>Inmobiliarias registradas</h2><span>5 fichas DEMO disponibles</span></div><div className="directory-grid"><a className="company-card" href="/inmobiliarias/aquino"><span className="company-logo">AQ</span><p className="eyebrow">Inmobiliaria</p><h3>Aquino</h3><p>Preparada para incorporar sus proyectos mediante archivos KML o CAD georreferenciados.</p><span className="card-link">Ver inmobiliaria →</span></a>{demoCompanies.map((company) => <a className="company-card demo-company" href={`/inmobiliarias/${company.slug}`} key={company.name}><span className="company-logo">{company.initials}</span><p className="eyebrow">Inmobiliaria DEMO</p><h3>{company.name}</h3><p>{company.description}</p><span className="card-link">Ver inmobiliaria →</span></a>)}</div></section><SiteFooter /></main>;
}
