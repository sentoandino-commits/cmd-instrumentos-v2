"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { crearPaperStandalone } from "@/lib/actions/papers";
import { ORIGEN_PAPER_OPCIONES } from "@/lib/organologico-opciones";
import { Select, inputClass } from "@/components/piezas/campos";

function BotonCrear() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-clay px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
    >
      {pending ? "Creando…" : "Crear paper"}
    </button>
  );
}

export default function NuevoPaperForm() {
  const [abierto, setAbierto] = useState(false);
  const [estado, formAction] = useFormState(crearPaperStandalone, { error: null });

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="rounded-lg bg-clay px-4 py-2 text-sm font-semibold text-white"
      >
        + Nuevo paper
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="mb-6 space-y-3 rounded-xl border border-line bg-paperLight p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-ink">Nuevo paper</div>
        <button type="button" onClick={() => setAbierto(false)} className="text-xs text-inkSoft underline">
          cancelar
        </button>
      </div>

      {estado.error && (
        <div className="rounded-lg border border-danger bg-dangerLight p-2.5 text-xs text-danger">
          {estado.error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <input name="titulo" placeholder="Título *" required className={`${inputClass} md:col-span-2`} />
        <input name="autores" placeholder="Autores" className={inputClass} />
        <input name="anio" type="number" placeholder="Año" className={inputClass} />
        <input name="revista_o_fuente" placeholder="Revista / fuente" className={inputClass} />
        <Select name="origen" opciones={ORIGEN_PAPER_OPCIONES} placeholder="Origen..." />
        <input
          name="drive_url"
          placeholder="Enlace de Google Drive (opcional)"
          className={`${inputClass} md:col-span-2`}
        />
      </div>

      <BotonCrear />
    </form>
  );
}
