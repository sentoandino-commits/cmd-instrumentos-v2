import Link from "next/link";
import { Paper } from "@/lib/types";
import { ORIGEN_PAPER_OPCIONES } from "@/lib/organologico-opciones";

function origenLabel(origen: string | null) {
  return ORIGEN_PAPER_OPCIONES.find((o) => o.value === origen)?.label ?? origen;
}

export default function PaperCard({ paper, compacta = false }: { paper: Paper; compacta?: boolean }) {
  if (compacta) {
    return (
      <Link
        href={`/papers/${paper.id}`}
        className="block rounded-lg border border-line bg-paperLight p-2.5"
      >
        <div className="text-sm font-semibold text-ink">{paper.titulo}</div>
        <div className="mt-0.5 text-[11px] text-inkSoft">
          {paper.autores ? `${paper.autores}` : "Sin autor registrado"}
          {paper.anio ? ` · ${paper.anio}` : ""}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/papers/${paper.id}`}
      className="block rounded-xl border border-line bg-paperLight p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="font-semibold text-ink">{paper.titulo}</div>
        {!paper.drive_url && (
          <span className="shrink-0 rounded-full border border-line px-2.5 py-0.5 text-[10px] text-inkSoft">
            sin archivo
          </span>
        )}
      </div>
      <div className="mt-1 text-xs text-inkSoft">
        {paper.autores ? `${paper.autores}` : "Sin autor registrado"}
        {paper.anio ? ` · ${paper.anio}` : ""}
      </div>
      {paper.revista_o_fuente && (
        <div className="mt-1 text-xs italic text-inkSoft">{paper.revista_o_fuente}</div>
      )}
      {paper.origen && (
        <div className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-clayDark">
          {origenLabel(paper.origen)}
        </div>
      )}
    </Link>
  );
}
