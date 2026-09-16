"use client";

import { useState } from "react";
import { inputClass, botonSecundarioClass } from "./campos";

export default function SitioSelector({
  sitios,
  valorInicial,
}: {
  sitios: { id: string; nombre: string }[];
  valorInicial: string | null;
}) {
  const [creandoNuevo, setCreandoNuevo] = useState(false);

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-inkSoft">Sitio arqueológico</label>
      {!creandoNuevo ? (
        <div className="flex gap-2">
          <select name="sitio_id" defaultValue={valorInicial ?? ""} className={inputClass}>
            <option value="">(sin sitio)</option>
            {sitios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setCreandoNuevo(true)}
            className={botonSecundarioClass}
          >
            + nuevo
          </button>
        </div>
      ) : (
        <div className="space-y-2 rounded-lg border border-line p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink">Sitio nuevo</span>
            <button
              type="button"
              onClick={() => setCreandoNuevo(false)}
              className="text-xs text-clay underline"
            >
              cancelar, usar existente
            </button>
          </div>
          <input name="sitio_nuevo_nombre" placeholder="Nombre (ej. Azapa 6)" className={inputClass} />
          <input
            name="sitio_nuevo_tipo_sitio"
            placeholder="Tipo de sitio (ej. Cementerio)"
            className={inputClass}
          />
          <input name="sitio_nuevo_fase_cultural" placeholder="Fase cultural" className={inputClass} />
          <input name="sitio_nuevo_arqueologo" placeholder="Arqueólogo" className={inputClass} />
          <textarea
            name="sitio_nuevo_bibliografia"
            placeholder="Bibliografía del sitio"
            rows={2}
            className={inputClass}
          />
          <textarea name="sitio_nuevo_notas" placeholder="Notas" rows={2} className={inputClass} />
        </div>
      )}
    </div>
  );
}
