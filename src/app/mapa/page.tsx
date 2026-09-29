import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import MapFilterLayout from "@/components/MapFilterLayout";
import { getLotsFromPostGIS } from "@/lib/lots";

export const dynamic = "force-dynamic";

export default async function MapPage({
  searchParams,
}: {
  searchParams?: Promise<{ inmobiliaria?: string; proyecto?: string; lote?: string }>;
}) {
  const params = (await searchParams) || {};
  const { lots, source } = await getLotsFromPostGIS({
    inmobiliariaSlug: params.inmobiliaria,
    proyectoSlug: params.proyecto,
  });

  return (
    <main>
      <SiteHeader active="Mapa de lotes" />
      <section className="page-intro">
        <p className="eyebrow">Explorador territorial</p>
        <h1>Mapa público de lotes y proyectos</h1>
        <p>
          Consulta los lotes georreferenciados en tiempo real. Selecciona un polígono para verificar su código oficial y estado registral.
        </p>
      </section>
      <MapFilterLayout
        initialLots={lots}
        initialSource={source}
        defaultInmobiliaria={params.inmobiliaria || "aquino"}
        defaultProyecto={params.proyecto || "polloc"}
        defaultLote={params.lote || "POLLOC-01"}
      />
      <SiteFooter />
    </main>
  );
}
