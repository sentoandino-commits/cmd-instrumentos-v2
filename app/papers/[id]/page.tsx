import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import SidebarPapers from "@/components/papers/SidebarPapers";
import PaperDetailCard from "@/components/papers/PaperDetailCard";
import { Paper, FAMILIAS, FAMILIA_COLOR, Familia } from "@/lib/types";

export const metadata = { robots: { index: false, follow: false } };

export default async function PaperPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: paper, error } = await supabase.from("papers").select("*").eq("id", id).single();
  if (error || !paper) notFound();

  const { data: vinculos } = await supabase
    .from("pieza_papers")
    .select("piezas(id, nombre_generico, familia, numero_inventario_museo, deleted_at)")
    .eq("paper_id", id);

  const instrumentos = ((vinculos ?? []) as unknown as { piezas: Record<string, unknown> | null }[])
    .map((v) => v.piezas)
    .filter((p): p is { id: string; nombre_generico: string; familia: Familia; numero_inventario_museo: string | null; deleted_at: string | null } =>
      Boolean(p) && !p!.deleted_at
    );

  const { data: papersLista } = await supabase.from("papers").select("*").order("titulo");

  return (
    <div>
      <Header />
      <div className="mx-auto flex max-w-6xl gap-6 px-6 py-8">
        <SidebarPapers lista={(papersLista as Paper[] | null) ?? []} />

        <main className="min-w-0 flex-1">
          <nav className="mb-4 text-xs text-inkSoft">
            Biblioteca › <span className="font-semibold text-ink">{paper.titulo}</span>
          </nav>

          <PaperDetailCard paper={paper as Paper} />

          <div className="mt-4 rounded-xl border border-line bg-paperLight p-5 shadow-sm">
            <div className="mb-3.5 text-xs font-semibold uppercase tracking-wide text-clayDark">
              Instrumentos vinculados
            </div>
            {instrumentos.length === 0 ? (
              <div className="text-sm italic text-inkSoft">Sin instrumentos vinculados todavía.</div>
            ) : (
              <div className="flex flex-col gap-2">
                {instrumentos.map((p) => {
                  const color = FAMILIA_COLOR[p.familia];
                  const familiaLabel = FAMILIAS.find((f) => f.id === p.familia)?.label ?? p.familia;
                  return (
                    <Link
                      key={p.id}
                      href={`/piezas/${p.id}`}
                      className="flex items-center justify-between gap-3 border-b border-line pb-2 text-sm last:border-0"
                    >
                      <span className="text-ink">{p.nombre_generico}</span>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                        style={{ color, backgroundColor: `${color}18` }}
                      >
                        {familiaLabel}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
