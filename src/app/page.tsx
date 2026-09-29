import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export default function Home() {
  return <main><SiteHeader active="Inicio" /><section className="hero" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow">Sistema de Información Predial</p>
          <h1>Una vista clara para cada lote.</h1>
          <p className="hero-text">Organiza proyectos, polígonos y documentos autorizados en un solo lugar.</p>
          <div className="hero-actions"><a className="button primary" href="/mapa">Ver mapa de lotes <span>↗</span></a><a className="button secondary" href="/certificados">Verificar certificado</a></div>
          <p className="trust-line">Información autorizada <span>•</span> Acceso público <span>•</span> Datos DEMO mientras se incorporan los registros reales</p>
        </div>
        <div className="video-placeholder" aria-label="Espacio reservado para video sobre qué es el SIP">
          <div className="play-ring">▶</div>
          <span>Qué es el SIP</span>
          <small>Próximamente</small>
        </div>
      </section><section className="feature-strip"><div><strong>◈</strong><b>Certificados verificables</b><span>Consulta autorizada con código SIP.</span></div><div><strong>⌖</strong><b>Georreferenciación precisa</b><span>Proyectos visibles en mapa satelital.</span></div><div><strong>♙</strong><b>Consulta pública confiable</b><span>Información clara y accesible.</span></div></section><section className="home-preview"><div className="section-heading"><div><p className="eyebrow">Explorador territorial</p><h2>Mapa satelital de lotes</h2></div><a className="text-link" href="/mapa">Abrir mapa completo ↗</a></div><div className="preview-map"><div className="map-overlay-note">Vista de demostración<br /><small>La ubicación real se incorporará con los KML autorizados.</small></div></div></section><SiteFooter /></main>;
}
