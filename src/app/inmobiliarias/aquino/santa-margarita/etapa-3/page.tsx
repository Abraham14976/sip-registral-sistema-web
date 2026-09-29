import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SantaMargaritaEtapa3MapLoader from "@/components/SantaMargaritaEtapa3MapLoader";
import { getSantaMargaritaEtapa3FromPostGIS } from "@/lib/santa-margarita-etapa3";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function SantaMargaritaEtapa3Page() {
  const { lots, error } = await getSantaMargaritaEtapa3FromPostGIS();

  return (
    <main>
      <SiteHeader active="Inmobiliarias" />
      <nav className={styles.breadcrumbs} aria-label="Ruta de navegación">
        <a href="/inmobiliarias">Inmobiliarias</a>
        <span aria-hidden="true">/</span>
        <a href="/inmobiliarias/aquino">Inmobiliaria Aquino</a>
        <span aria-hidden="true">/</span>
        <strong>Santa Margarita</strong>
      </nav>
      <section className={styles.pageIntro}>
        <p className="eyebrow">Proyecto Santa Margarita</p>
        <h1>Etapa 3</h1>
        <p>Plano satelital georreferenciado de los lotes asociados a esta etapa y sus códigos.</p>
      </section>
      <section className={styles.mapSection}>
        {error ? (
          <p className={styles.error} role="alert">{error}</p>
        ) : (
          <>
            <div className={styles.mapSummary}>
              <strong>{lots.length} lotes de Etapa 3</strong>
              <span>Se muestran solo los códigos y datos geométricos disponibles.</span>
            </div>
            <SantaMargaritaEtapa3MapLoader lots={lots} />
          </>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}