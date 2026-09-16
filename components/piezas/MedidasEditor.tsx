"use client";

import { useState } from "react";
import { Medida } from "@/lib/types";
import { TIPO_MEDIDA_OPCIONES } from "@/lib/organologico-opciones";
import { inputClass, botonSecundarioClass, botonQuitarClass } from "./campos";

interface FilaMedida {
  key: string;
  parte: string;
  tipo_medida: string;
  unidad: string;
  valor: string;
}

function nuevaFila(): FilaMedida {
  return {
    key: crypto.randomUUID(),
    parte: "Pieza completa",
    tipo_medida: "",
    unidad: "mm",
    valor: "",
  };
}

export default function MedidasEditor({ medidasIniciales }: { medidasIniciales: Medida[] }) {
  const [filas, setFilas] = useState<FilaMedida[]>(
    medidasIniciales.map((m) => ({
      key: crypto.randomUUID(),
      parte: m.parte,
      tipo_medida: m.tipo_medida,
      unidad: m.unidad,
      valor: String(m.valor),
    }))
  );

  function actualizar(key: string, campo: keyof FilaMedida, valor: string) {
    setFilas((prev) => prev.map((f) => (f.key === key ? { ...f, [campo]: valor } : f)));
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-clayDark">
          Medidas específicas
        </div>
        <button
          type="button"
          onClick={() => setFilas((prev) => [...prev, nuevaFila()])}
          className={botonSecundarioClass}
        >
          + agregar medida
        </button>
      </div>

      {filas.length === 0 && (
        <div className="text-sm italic text-inkSoft">Sin medidas adicionales todavía.</div>
      )}

      <div className="space-y-2">
        {filas.map((f, i) => (
          <div key={f.key} className="grid grid-cols-[1fr_1fr_70px_80px_auto] items-center gap-2">
            <input
              name={`medidas[${i}][parte]`}
              value={f.parte}
              onChange={(e) => actualizar(f.key, "parte", e.target.value)}
              placeholder="Parte (ej. Tubo 2)"
              className={inputClass}
            />
            <select
              name={`medidas[${i}][tipo_medida]`}
              value={f.tipo_medida}
              onChange={(e) => actualizar(f.key, "tipo_medida", e.target.value)}
              className={inputClass}
            >
              <option value="">Tipo de medida</option>
              {TIPO_MEDIDA_OPCIONES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <input
              name={`medidas[${i}][unidad]`}
              value={f.unidad}
              onChange={(e) => actualizar(f.key, "unidad", e.target.value)}
              className={inputClass}
            />
            <input
              type="number"
              step="any"
              name={`medidas[${i}][valor]`}
              value={f.valor}
              onChange={(e) => actualizar(f.key, "valor", e.target.value)}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setFilas((prev) => prev.filter((x) => x.key !== f.key))}
              className={botonQuitarClass}
            >
              quitar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
