import { Suspense } from "react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import FilterPanel from "@/components/FilterPanel";
import PiezaCard from "@/components/PiezaCard";
import { Pieza } from "@/lib/types";

/**
 * Barra lateral compacta (buscador + filtros + lista + "+ Nueva pieza")
 * compartida por la ficha de detalle, y los formularios de crear/editar
 * — las 3 páginas que muestran el catálogo compactado a un costado.
 */
export default function SidebarPiezas({
  lista,
  culturas,
  activaId,
  puedeCrear,
}: {
  lista: Pieza[];
  culturas: string[];
  activaId?: string;
  puedeCrear: boolean;
}) {
  return (
    <aside className="w-72 shrink-0 space-y-3">
      <Suspense fallback={<div className="h-10 rounded-lg bg-paperLight" />}>
        <SearchBar />
        <FilterPanel culturas={culturas} />
      </Suspense>

      {puedeCrear && (
        <Link
          href="/piezas/nueva"
          className="block rounded-lg bg-clay px-3 py-2 text-center text-sm font-semibold text-white"
        >
          + Nueva pieza
        </Link>
      )}

      <div className="flex flex-col gap-2 pt-2">
        {lista.map((p) => (
          <PiezaCard key={p.id} pieza={p} compacta activa={p.id === activaId} />
        ))}
      </div>
    </aside>
  );
}
