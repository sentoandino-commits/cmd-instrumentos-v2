"use client";

import { ClasificacionHS } from "@/lib/types";
import { PREFIJO_FAMILIA_HS, labelClasificacionHS } from "@/lib/clasificacion-hs-ejemplos";
import { inputClass } from "./campos";

export default function SelectorClasificacionHS({
  hsList,
  familia,
  valorInicial,
}: {
  hsList: ClasificacionHS[];
  familia: string;
  valorInicial: string | null;
}) {
  const prefijo = PREFIJO_FAMILIA_HS[familia];
  const opciones = prefijo
    ? hsList
        .filter((h) => h.codigo === prefijo || h.codigo.startsWith(`${prefijo}.`))
        .sort((a, b) => a.codigo.localeCompare(b.codigo))
    : [];

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-inkSoft">
        Clasificación Hornbostel-Sachs
      </label>
      {/* key=familia: fuerza remount al cambiar de familia, para no dejar
          seleccionado un código que ya no pertenece a esa familia. */}
      <select name="codigo_hs" defaultValue={valorInicial ?? ""} key={familia} className={inputClass}>
        <option value="">(sin clasificar todavía)</option>
        {opciones.map((h) => (
          <option key={h.codigo} value={h.codigo}>
            {labelClasificacionHS(h.codigo, h.termino_es)}
          </option>
        ))}
      </select>
    </div>
  );
}
