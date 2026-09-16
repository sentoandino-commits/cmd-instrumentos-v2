import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import PaperCard from "@/components/papers/PaperCard";
import NuevoPaperForm from "@/components/papers/NuevoPaperForm";
import SidebarPapers from "@/components/papers/SidebarPapers";
import { Paper } from "@/lib/types";

// Biblioteca exclusiva de investigadores — no debe indexarse aunque la
// ruta ya esté protegida por sesión (ver lib/supabase/middleware.ts).
export const metadata = { robots: { index: false, follow: false } };

export default async function PapersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const { q } = searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let query = supabase.from("papers").select("*").order("titulo");
  if (q) {
    const termino = q.replace(/[,()%]/g, " ").trim();
    if (termino) query = query.or(`titulo.ilike.%${termino}%,autores.ilike.%${termino}%`);
  }
  const { data: papers, error } = await query;

  return (
    <div>
      <Header />
      {/* Toda la ruta requiere sesión, así que la barra lateral (con el
          switch Piezas/Papers) está siempre presente aquí — mismo
          layout que el resto de las páginas cuando hay sesión. */}
      <div className="mx-auto flex max-w-6xl gap-6 px-6 py-8">
        <SidebarPapers lista={(papers as Paper[] | null) ?? []} />

        <main className="min-w-0 flex-1">
          <h1 className="mb-1 text-2xl font-bold text-ink">Biblioteca de papers</h1>
          <p className="mb-6 text-sm text-inkSoft">
            {papers?.length ?? 0} paper{papers?.length !== 1 ? "s" : ""} · visible solo para investigadores
          </p>

          <div className="mb-6">
            <NuevoPaperForm />
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-danger bg-dangerLight p-3 text-sm text-danger">
              Error al cargar la biblioteca: {error.message}
            </div>
          )}

          {papers && papers.length === 0 && (
            <div className="rounded-xl border border-line bg-paperLight p-10 text-center text-sm text-inkSoft">
              No se encontraron papers con esa búsqueda.
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(papers as Paper[] | null)?.map((p) => (
              <PaperCard key={p.id} paper={p} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
