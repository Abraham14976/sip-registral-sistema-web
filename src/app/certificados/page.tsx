import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export default function CertificatesPage() {
  return <main><SiteHeader active="Certificados" /><section className="page-intro"><p className="eyebrow">Consulta pública</p><h1>Verificación de certificados</h1><p>Cuando existan certificados autorizados, podrás validarlos con su código SIP. Por ahora esta pantalla es una vista DEMO.</p></section><section className="certificate-page"><div className="certificate-search"><div className="search-icon">⌕</div><div><strong>Código SIP</strong><input placeholder="Ejemplo: SIP-000000" disabled /></div><button type="button" disabled>Verificar</button></div><div className="certificate-empty"><div className="empty-icon">✓</div><h2>Consulta disponible próximamente</h2><p>No hay certificados reales cargados. Las escrituras y documentos privados no se publicarán aquí.</p></div></section><SiteFooter /></main>;
}
