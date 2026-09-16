"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { actualizarPaper } from "@/lib/actions/papers";
import { ORIGEN_PAPER_OPCIONES } from "@/lib/organologico-opciones";
import { Select, inputClass } from "@/components/piezas/campos";
import { Paper } from "@/lib/types";

function BotonGuardar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-clay px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
    >
      {pending ? "Guardando…" : "Guardar cambios"}
    </button>
  );
}

export default function PaperDetailCard({ paper }: { paper: Paper }) {
  const [editando, setEditando] = useState(false);
  const [estado, formAction] = useFormState(actualizarPaper.bind(null, paper.id), { error: null });
  const origenLabel = ORIGEN_PAPER_OPCIONES.find((o) => o.value === paper.origen)?.label ?? paper.origen;

  if (editando) {
    return (
      <form
        action={formAction}
        className="space-y-3 rounded-xl border border-line bg-paperLight p-6 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-ink">Editar paper</div>
          <button
            type="button"
            onClick={() => setEditando(false)}
            className="text-xs text-inkSoft underline"
          >
            cancelar
          </button>
        </div>

        {estado.error && (
          <div className="rounded-lg border border-danger bg-dangerLight p-2.5 text-xs text-danger">
            {estado.error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            name="titulo"
            placeholder="Título *"
            required
            defaultValue={paper.titulo}
            className={`${inputClass} md:col-span-2`}
          />
          <input name="autores" placeholder="Autores" defaultValue={paper.autores ?? ""} className={inputClass} />
          <input
            name="anio"
            type="number"
            placeholder="Año"
            defaultValue={paper.anio ?? ""}
            className={inputClass}
          />
          <input
            name="revista_o_fuente"
            placeholder="Revista / fuente"
            defaultValue={paper.revista_o_fuente ?? ""}
            className={inputClass}
          />
          <Select name="origen" opciones={ORIGEN_PAPER_OPCIONES} defaultValue={paper.origen} placeholder="Origen..." />
          <input
            name="drive_url"
            placeholder="Enlace de Google Drive (opcional)"
            defaultValue={paper.drive_url ?? ""}
            className={`${inputClass} md:col-span-2`}
          />
        </div>

        <BotonGuardar />
      </form>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-paperLight p-6 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-3">
        {origenLabel ? (
          <span className="inline-block rounded-full bg-clayLight px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-clayDark">
            {origenLabel}
          </span>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => setEditando(true)}
          className="shrink-0 text-xs font-medium text-clay hover:underline"
        >
          ✎ editar
        </button>
      </div>

      <h1 className="text-xl font-bold leading-snug text-ink">{paper.titulo}</h1>
      <div className="mt-1 text-sm text-inkSoft">
        {paper.autores ? `${paper.autores}. ` : ""}
        {paper.anio ? `(${paper.anio}). ` : ""}
        {paper.revista_o_fuente ? `${paper.revista_o_fuente}.` : ""}
      </div>

      <div className="mt-4">
        {paper.drive_url ? (
          <a
            href={paper.drive_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-clay px-4 py-2 text-sm font-semibold text-white"
          >
            Ver documento ↗
          </a>
        ) : (
          <span className="text-sm italic text-inkSoft">Sin archivo cargado todavía.</span>
        )}
      </div>
    </div>
  );
}
