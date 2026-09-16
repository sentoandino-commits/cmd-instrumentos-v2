"use client";

import { useState } from "react";
import { inputClass, botonSecundarioClass, botonQuitarClass } from "./campos";

interface FilaCuerda {
  key: string;
  posicion: string;
  nota: string;
}

export default function OrdenCuerdasEditor({
  ordenInicial,
}: {
  ordenInicial: { posicion: number; nota: string }[] | null;
}) {
  const [filas, setFilas] = useState<FilaCuerda[]>(
    (ordenInicial ?? []).map((c) => ({
      key: crypto.randomUUID(),
      posicion: String(c.posicion),
      nota: c.nota,
    }))
  );

  function actualizar(key: string, campo: keyof FilaCuerda, valor: string) {
    setFilas((prev) => prev.map((f) => (f.key === key ? { ...f, [campo]: valor } : f)));
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-medium text-inkSoft">Orden de cuerdas</label>
        <button
          type="button"
          onClick={() =>
            setFilas((prev) => [
              ...prev,
              { key: crypto.randomUUID(), posicion: String(prev.length + 1), nota: "" },
            ])
          }
          className={botonSecundarioClass}
        >
          + agregar cuerda
        </button>
      </div>

      {filas.length === 0 && (
        <div className="text-sm italic text-inkSoft">Sin cuerdas registradas todavía.</div>
      )}

      <div className="space-y-2">
        {filas.map((f, i) => (
          <div key={f.key} className="grid grid-cols-[70px_1fr_auto] items-center gap-2">
            <input
              type="number"
              name={`orden_cuerdas[${i}][posicion]`}
              value={f.posicion}
              onChange={(e) => actualizar(f.key, "posicion", e.target.value)}
              className={inputClass}
            />
            <input
              name={`orden_cuerdas[${i}][nota]`}
              value={f.nota}
              onChange={(e) => actualizar(f.key, "nota", e.target.value)}
              placeholder="Nota / afinación"
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
