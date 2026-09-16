import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import FilterPanel from "@/components/FilterPanel";
import PiezaCard from "@/components/PiezaCard";
import PiezaDetailView from "@/components/PiezaDetailView";
import { Pieza } from "@/lib/types";
import { notFound } from "next/navigation";

const SELECT_PIEZA =
  "*, sitios(*), aerofonos(*), cordofonos(*), idiofonos(*), membranofonos(*), procedencia(*), pieza_actores(*, actores(*)), pieza_medidas(*), pieza_papers(*, papers(*))";

export default async function FichaPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { q?: string; familia?: string; cultura?: string };
}) {
  const { id } = params;
  const { q, familia, cultura } = searchParams;
  const supabase = await createClient();

  const { data: pieza, error } = await supabase
    .from("piezas")
    .select(SELECT_PIEZA)
    .eq("id", id)
    .single();

  if (error || !pieza) notFound();

  const { data: hsList } = await supabase.from("clasificacion_hs").select("*");

  // Lista compacta para la barra lateral, con los mismos filtros que el catálogo
  let listaQuery = supabase
    .from("piezas")
    .select("id, familia, nombre_generico, numero_inventario_museo")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (familia) listaQuery = listaQuery.eq("familia", familia);
  if (cultura) listaQuery = listaQuery.eq("cultura_etnia", cultura);
  if (q) listaQuery = listaQuery.textSearch("busqueda", q, { type: "websearch", config: "spanish" });
  const { data: lista } = await listaQuery;

  const { data: culturasRaw } = await supabase
    .from("piezas")
    .select("cultura_etnia")
    .not("cultura_etnia", "is", null)
    .is("deleted_at", null);
  const culturas = Array.from(
    new Set((culturasRaw ?? []).map((r) => r.cultura_etnia as string))
  ).sort();

  return (
    <div>
      <Header />
      <div className="mx-auto flex max-w-6xl gap-6 px-6 py-8">
        <aside className="w-72 shrink-0 space-y-3">
          <Suspense fallback={<div className="h-10 rounded-lg bg-paperLight" />}>
            <SearchBar />
            <FilterPanel culturas={culturas} />
          </Suspense>
          <div className="flex flex-col gap-2 pt-2">
            {(lista as Pieza[] | null)?.map((p) => (
              <PiezaCard key={p.id} pieza={p} compacta activa={p.id === id} />
            ))}
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <PiezaDetailView pieza={pieza as unknown as Pieza} hsList={hsList ?? []} />
        </main>
      </div>
    </div>
  );
}
