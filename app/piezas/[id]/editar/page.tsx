import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SELECT_PIEZA } from "@/lib/queries";
import Header from "@/components/Header";
import PiezaForm from "@/components/piezas/PiezaForm";
import SidebarPiezas from "@/components/piezas/SidebarPiezas";
import { Pieza } from "@/lib/types";

export default async function EditarPiezaPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { q?: string; familia?: string; cultura?: string; tab?: string };
}) {
  const { id } = params;
  const { q, familia, cultura, tab } = searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: pieza, error } = await supabase
    .from("piezas")
    .select(SELECT_PIEZA)
    .eq("id", id)
    .single();
  if (error || !pieza) notFound();

  const [{ data: hsList }, { data: sitios }, { data: actores }, { data: papers }] = await Promise.all([
    supabase.from("clasificacion_hs").select("*"),
    supabase.from("sitios").select("id, nombre").order("nombre"),
    supabase.from("actores").select("id, nombre, tipo").order("nombre"),
    supabase.from("papers").select("id, titulo, anio").order("titulo"),
  ]);

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
  const culturas = Array.from(new Set((culturasRaw ?? []).map((r) => r.cultura_etnia as string))).sort();

  return (
    <div>
      <Header />
      <div className="mx-auto flex max-w-6xl gap-6 px-6 py-8">
        <SidebarPiezas lista={(lista as Pieza[] | null) ?? []} culturas={culturas} activaId={id} puedeCrear />

        <main className="min-w-0 flex-1">
          <h1 className="mb-4 text-xl font-bold text-ink">Editar pieza</h1>
          <PiezaForm
            modo="editar"
            piezaId={id}
            pieza={pieza as unknown as Pieza}
            hsList={hsList ?? []}
            sitios={sitios ?? []}
            actoresExistentes={actores ?? []}
            papersExistentes={papers ?? []}
            initialTab={tab}
          />
        </main>
      </div>
    </div>
  );
}
