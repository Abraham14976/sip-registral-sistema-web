import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SantaMargaritaEtapa3MapLoader from "@/components/SantaMargaritaEtapa3MapLoader";
import { getSantaMargaritaEtapa3FromPostGIS } from "@/lib/santa-margarita-etapa3";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { lots, error } = await getSantaMargaritaEtapa3FromPostGIS();

  return (
    <main>
      <SiteHeader active="Inicio" />
      <section className="home-cover" id="inicio">
        <div className="home-cover-copy">
          <p className="eyebrow">Sistema Integral Predial</p>
          <h1>Información predial a tu alcance.</h1>
          <p className="hero-text">
            Visualiza proyectos, identifica lotes y consulta la información disponible en SIP Registral.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="/mapa">Ver mapa de lotes <span aria-hidden="true">↗</span></a>
            <a className="button secondary" href="#que-es-sip">Conocer SIP <span aria-hidden="true">↘</span></a>
          </div>
        </div>
        <div className="home-video-card" id="que-es-sip" role="img" aria-label="Espacio reservado para el video Qué es el SIP">
          <div className="home-video-image" />
          <div className="home-video-caption">
            <span className="home-video-play" aria-hidden="true">▶</span>
            <div>
              <strong>Qué es el SIP</strong>
              <p>Video informativo próximamente.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="home-access-section" aria-labelledby="home-access-title">
        <div className="home-access-heading">
          <div>
            <p className="eyebrow">Explora SIP Registral</p>
            <h2 id="home-access-title">Accesos principales</h2>
          </div>
        </div>
        <div className="home-access-grid">
          <a className="home-access-card" href="/mapa">
            <span className="home-access-image home-access-map-image" aria-hidden="true" />
            <span className="home-access-content">
              <span className="home-access-icon" aria-hidden="true">⌖</span>
              <span className="home-access-text"><strong>Mapa de lotes</strong><small>Explora la información territorial y visualiza los polígonos disponibles.</small></span>
              <span className="home-access-arrow" aria-hidden="true">↗</span>
            </span>
          </a>
          <a className="home-access-card" href="/inmobiliarias">
            <span className="home-access-image home-access-company-image" aria-hidden="true" />
            <span className="home-access-content">
              <span className="home-access-icon" aria-hidden="true">▥</span>
              <span className="home-access-text"><strong>Inmobiliarias</strong><small>Conoce las inmobiliarias y sus proyectos registrados.</small></span>
              <span className="home-access-arrow" aria-hidden="true">↗</span>
            </span>
          </a>
          <a className="home-access-card" href="/certificados">
            <span className="home-access-image home-access-certificate-image" aria-hidden="true" />
            <span className="home-access-content">
              <span className="home-access-icon" aria-hidden="true">▤</span>
              <span className="home-access-text"><strong>Certificados</strong><small>Consulta la información disponible sobre certificados.</small></span>
              <span className="home-access-arrow" aria-hidden="true">↗</span>
            </span>
          </a>
        </div>
      </section>

      <section className="home-preview">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Explorador territorial</p>
            <h2>Vista satelital</h2>
            <p className="section-note">Consulta los polígonos georreferenciados disponibles en SIP Registral.</p>
          </div>
          <a className="text-link" href="/mapa">Abrir mapa completo <span aria-hidden="true">↗</span></a>
        </div>
        {error ? (
          <div className="home-map-error" role="status">La vista satelital no está disponible en este momento.</div>
        ) : (
          <div className="home-map-frame"><SantaMargaritaEtapa3MapLoader lots={lots} /></div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
