"use client";

import { useState } from "react";
import { RelacionPieza, TIPO_RELACION_LABELS } from "@/lib/types";
import { TIPO_RELACION_OPCIONES } from "@/lib/organologico-opciones";
import { inputClass, botonSecundarioClass, botonQuitarClass } from "./campos";

interface Fila {
  key: string;
  pieza_id: string;
  tipo_relacion: string;
  notas: string;
  nombreMostrado: string;
}

export default function RelacionesTab({
  todasLasPiezas,
  relacionesIniciales,
}: {
  todasLasPiezas: { id: string; nombre_generico: string; numero_inventario_museo: string | null }[];
  relacionesIniciales: RelacionPieza[];
}) {
  const [filas, setFilas] = useState<Fila[]>(
    relacionesIniciales.map((r) => ({
      key: crypto.randomUUID(),
      pieza_id: r.otraPieza.id,
      tipo_relacion: r.tipo_relacion,
      notas: r.notas ?? "",
      nombreMostrado: r.otraPieza.nombre_generico,
    }))
  );

  const [piezaSel, setPiezaSel] = useState("");
  const [tipoSel, setTipoSel] = useState("");
  const [notasSel, setNotasSel] = useState("");

  function agregar() {
    if (!piezaSel || !tipoSel) return;
    const pieza = todasLasPiezas.find((p) => p.id === piezaSel);
    setFilas((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        pieza_id: piezaSel,
        tipo_relacion: tipoSel,
        notas: notasSel,
        nombreMostrado: pieza?.nombre_generico ?? piezaSel,
      },
    ]);
    setPiezaSel("");
    setTipoSel("");
    setNotasSel("");
  }

  return (
    <div>
      <div className="mb-4 space-y-2">
        {filas.length === 0 && (
          <div className="text-sm italic text-inkSoft">Sin piezas relacionadas todavía.</div>
        )}
        {filas.map((f, i) => (
          <div
            key={f.key}
            className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2 text-sm"
          >
            <span>
              <strong className="text-ink">{f.nombreMostrado}</strong>
              <span className="text-inkSoft">
                {" "}
                — {TIPO_RELACION_LABELS[f.tipo_relacion as keyof typeof TIPO_RELACION_LABELS] ?? f.tipo_relacion}
              </span>
              {f.notas && <span className="text-inkSoft"> ({f.notas})</span>}
            </span>
            <button
              type="button"
              onClick={() => setFilas((prev) => prev.filter((x) => x.key !== f.key))}
              className={botonQuitarClass}
            >
              quitar
            </button>
            <input type="hidden" name={`relaciones[${i}][pieza_id]`} value={f.pieza_id} />
            <input type="hidden" name={`relaciones[${i}][tipo_relacion]`} value={f.tipo_relacion} />
            <input type="hidden" name={`relaciones[${i}][notas]`} value={f.notas} />
          </div>
        ))}
      </div>

      <div className="space-y-2 rounded-lg border border-line p-3">
        <span className="text-xs font-semibold text-ink">Relacionar con otra pieza</span>
        <select value={piezaSel} onChange={(e) => setPiezaSel(e.target.value)} className={inputClass}>
          <option value="">Elige una pieza...</option>
          {todasLasPiezas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre_generico}
              {p.numero_inventario_museo ? ` (${p.numero_inventario_museo})` : ""}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <select value={tipoSel} onChange={(e) => setTipoSel(e.target.value)} className={inputClass}>
            <option value="">Tipo de relación...</option>
            {TIPO_RELACION_OPCIONES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button type="button" onClick={agregar} className={botonSecundarioClass}>
            Agregar
          </button>
        </div>
        <input
          value={notasSel}
          onChange={(e) => setNotasSel(e.target.value)}
          placeholder="Notas (opcional)"
          className={inputClass}
        />
      </div>
    </div>
  );
}
