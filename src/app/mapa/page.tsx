import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import MapFilterLayout from "@/components/MapFilterLayout";
import { getLotsFromPostGIS } from "@/lib/lots";

export const dynamic = "force-dynamic";

export default async function MapPage({
  searchParams,
}: {
  searchParams?: Promise<{ lote?: string }>;
}) {
  const params = (await searchParams) || {};
  const { lots, error } = await getLotsFromPostGIS();

  return (
    <main>
      <SiteHeader active="Mapa de lotes" />
      <section className="page-intro">
        <p className="eyebrow">Explorador territorial</p>
        <h1>Mapa público de lotes y proyectos</h1>
        <p>
          Consulta los 34 lotes georreferenciados de Aquino, Santa Margarita, Etapa 3. Selecciona un polígono para ver su código y estado registral.
        </p>
      </section>
      <MapFilterLayout
        initialLots={lots}
        error={error}
        defaultLote={params.lote || "134A"}
      />
      <SiteFooter />
    </main>
  );
}
