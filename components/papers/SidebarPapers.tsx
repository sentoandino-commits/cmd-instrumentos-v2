import { Suspense } from "react";
import SearchBar from "@/components/SearchBar";
import SeccionSwitch from "@/components/SeccionSwitch";
import PaperCard from "./PaperCard";
import { Paper } from "@/lib/types";

export default function SidebarPapers({
  lista,
  mostrarLista = true,
}: {
  lista: Paper[];
  /** false en el listado: el área principal ya muestra los mismos
   * papers en tarjetas grandes, repetirlos acá sería redundante. */
  mostrarLista?: boolean;
}) {
  return (
    <aside className="w-72 shrink-0 space-y-3">
      <SeccionSwitch activa="papers" />

      <Suspense fallback={<div className="h-10 rounded-lg bg-paperLight" />}>
        <SearchBar />
      </Suspense>

      {mostrarLista && (
        <div className="flex flex-col gap-2 pt-2">
          {lista.map((p) => (
            <PaperCard key={p.id} paper={p} compacta />
          ))}
        </div>
      )}
    </aside>
  );
}
