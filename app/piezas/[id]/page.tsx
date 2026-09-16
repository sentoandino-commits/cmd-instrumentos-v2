import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import PiezaDetailView from "@/components/PiezaDetailView";
import SidebarPiezas from "@/components/piezas/SidebarPiezas";
import { Pieza } from "@/lib/types";
import { SELECT_PIEZA, fetchRelacionesPieza } from "@/lib/queries";
import { notFound } from "next/navigation";

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: pieza, error } = await supabase
    .from("piezas")
    .select(SELECT_PIEZA)
    .eq("id", id)
    .single();

  if (error || !pieza) notFound();

  const { data: hsList } = await supabase.from("clasificacion_hs").select("*");
  const relaciones = await fetchRelacionesPieza(supabase, id);

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
        <SidebarPiezas
          lista={(lista as Pieza[] | null) ?? []}
          culturas={culturas}
          activaId={id}
          puedeCrear={Boolean(user)}
        />

        <main className="min-w-0 flex-1">
          <PiezaDetailView
            pieza={pieza as unknown as Pieza}
            hsList={hsList ?? []}
            relaciones={relaciones}
            puedeEditar={Boolean(user)}
          />
        </main>
      </div>
    </div>
  );
}
