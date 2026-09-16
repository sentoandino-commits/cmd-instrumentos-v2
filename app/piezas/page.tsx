import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import FilterPanel from "@/components/FilterPanel";
import PiezaCard from "@/components/PiezaCard";
import { Pieza } from "@/lib/types";

export const revalidate = 0; // por ahora siempre fresco; se puede cachear más adelante

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: { q?: string; familia?: string; cultura?: string };
}) {
  const { q, familia, cultura } = searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("piezas")
    .select(
      "id, familia, nombre_generico, numero_inventario_museo, cultura_etnia, periodo_cultural"
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (familia) query = query.eq("familia", familia);
  if (cultura) query = query.eq("cultura_etnia", cultura);
  if (q) query = query.textSearch("busqueda", q, { type: "websearch", config: "spanish" });

  const { data: piezas, error } = await query;

  // Lista de culturas distintas para poblar el filtro (consulta liviana aparte)
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
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-1 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-ink">Catálogo de instrumentos</h1>
          {user && (
            <Link
              href="/piezas/nueva"
              className="shrink-0 rounded-lg bg-clay px-4 py-2 text-sm font-semibold text-white"
            >
              + Nueva pieza
            </Link>
          )}
        </div>
        <p className="mb-6 text-sm text-inkSoft">
          {piezas?.length ?? 0} pieza{piezas?.length !== 1 ? "s" : ""} en el fichero
        </p>

        <div className="mb-6 space-y-3">
          <Suspense fallback={<div className="h-10 rounded-lg bg-paperLight" />}>
            <SearchBar />
            <FilterPanel culturas={culturas} />
          </Suspense>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-danger bg-dangerLight p-3 text-sm text-danger">
            Error al cargar el catálogo: {error.message}
          </div>
        )}

        {piezas && piezas.length === 0 && (
          <div className="rounded-xl border border-line bg-paperLight p-10 text-center text-sm text-inkSoft">
            No se encontraron piezas con esos filtros.
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(piezas as Pieza[] | null)?.map((p) => (
            <PiezaCard key={p.id} pieza={p} />
          ))}
        </div>
      </main>
    </div>
  );
}
