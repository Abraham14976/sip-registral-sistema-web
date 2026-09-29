import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import styles from "./page.module.css";

const pendingProjects = [
  "Alameda La Colpa",
  "La Finca",
  "Planicies del Valle",
  "Valle 4 Etapa 1",
  "Valle 4 Etapa 2-3",
  "Valle 5",
  "Valle 6",
  "Valle 7",
];

export default function AquinoPage() {
  return (
    <main>
      <SiteHeader active="Inmobiliarias" />
      <section className="company-hero">
        <div className="company-logo large">AQ</div>
        <div>
          <p className="eyebrow">Portafolio de proyectos</p>
          <h1>Inmobiliaria Aquino</h1>
          <p>Proyectos organizados con sus etapas y datos territoriales disponibles.</p>
        </div>
      </section>

      <section className="directory-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Inmobiliaria Aquino</p>
            <h2>Proyectos</h2>
          </div>
          <span className="demo-note">9 proyectos</span>
        </div>
        <div className={styles.projectGrid}>
          <article className={`${styles.projectCard} ${styles.santaMargarita}`}>
            <div className={styles.projectTitleRow}>
              <p className="eyebrow">Proyecto</p>
              <span className={styles.stageStatus}>Plano disponible</span>
            </div>
            <h3>Santa Margarita</h3>
            <p className={styles.projectNote}>Etapa 3 cuenta con un plano lineal georreferenciado, pendiente de individualizar.</p>
            <a className={styles.stageLink} href="/inmobiliarias/aquino/santa-margarita/etapa-3">
              <span><small>Etapa 3</small><strong>Ver plano satelital</strong></span>
              <span aria-hidden="true">→</span>
            </a>
          </article>
          {pendingProjects.map((project) => (
            <article className={styles.projectCard} key={project}>
              <div className={styles.projectTitleRow}>
                <p className="eyebrow">Proyecto</p>
                <span className={styles.pendingStatus}>Pendiente de datos</span>
              </div>
              <h3>{project}</h3>
            </article>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
