"use client";

import { useState } from "react";
import { PiezaPaper } from "@/lib/types";
import { ORIGEN_PAPER_OPCIONES } from "@/lib/organologico-opciones";
import { inputClass, botonSecundarioClass, botonQuitarClass } from "./campos";

interface VinculoPaper {
  key: string;
  paper_id: string;
  paper_nuevo_titulo: string;
  paper_nuevo_autores: string;
  paper_nuevo_anio: string;
  paper_nuevo_revista_o_fuente: string;
  paper_nuevo_origen: string;
  paper_nuevo_drive_url: string;
  tituloMostrado: string;
  tieneArchivo: boolean;
}

const NUEVO_VACIO = { titulo: "", autores: "", anio: "", revista: "", origen: "", drive_url: "" };

export default function PapersTab({
  papersExistentes,
  vinculosIniciales,
}: {
  papersExistentes: { id: string; titulo: string; anio: number | null }[];
  vinculosIniciales: PiezaPaper[];
}) {
  const [vinculos, setVinculos] = useState<VinculoPaper[]>(
    vinculosIniciales.map((v) => ({
      key: crypto.randomUUID(),
      paper_id: v.paper_id,
      paper_nuevo_titulo: "",
      paper_nuevo_autores: "",
      paper_nuevo_anio: "",
      paper_nuevo_revista_o_fuente: "",
      paper_nuevo_origen: "",
      paper_nuevo_drive_url: "",
      tituloMostrado: v.papers
        ? `${v.papers.titulo}${v.papers.anio ? ` (${v.papers.anio})` : ""}`
        : "(paper eliminado)",
      tieneArchivo: Boolean(v.papers?.drive_url),
    }))
  );

  const [paperSel, setPaperSel] = useState("");
  const [creandoNuevo, setCreandoNuevo] = useState(false);
  const [nuevo, setNuevo] = useState(NUEVO_VACIO);

  function agregar() {
    if (creandoNuevo) {
      if (!nuevo.titulo.trim()) return;
      setVinculos((prev) => [
        ...prev,
        {
          key: crypto.randomUUID(),
          paper_id: "",
          paper_nuevo_titulo: nuevo.titulo.trim(),
          paper_nuevo_autores: nuevo.autores,
          paper_nuevo_anio: nuevo.anio,
          paper_nuevo_revista_o_fuente: nuevo.revista,
          paper_nuevo_origen: nuevo.origen,
          paper_nuevo_drive_url: nuevo.drive_url,
          tituloMostrado: `${nuevo.titulo.trim()} (nuevo)`,
          tieneArchivo: Boolean(nuevo.drive_url),
        },
      ]);
      setNuevo(NUEVO_VACIO);
    } else {
      if (!paperSel) return;
      const paper = papersExistentes.find((p) => p.id === paperSel);
      setVinculos((prev) => [
        ...prev,
        {
          key: crypto.randomUUID(),
          paper_id: paperSel,
          paper_nuevo_titulo: "",
          paper_nuevo_autores: "",
          paper_nuevo_anio: "",
          paper_nuevo_revista_o_fuente: "",
          paper_nuevo_origen: "",
          paper_nuevo_drive_url: "",
          tituloMostrado: paper ? `${paper.titulo}${paper.anio ? ` (${paper.anio})` : ""}` : paperSel,
          tieneArchivo: true,
        },
      ]);
      setPaperSel("");
    }
  }

  return (
    <div>
      <div className="mb-4 space-y-2">
        {vinculos.length === 0 && (
          <div className="text-sm italic text-inkSoft">Sin papers vinculados todavía.</div>
        )}
        {vinculos.map((v, i) => (
          <div
            key={v.key}
            className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2 text-sm"
          >
            <span className="text-ink">{v.tituloMostrado}</span>
            <span className="flex items-center gap-3">
              {!v.tieneArchivo && <span className="text-xs text-inkSoft">sin archivo</span>}
              <button
                type="button"
                onClick={() => setVinculos((prev) => prev.filter((x) => x.key !== v.key))}
                className={botonQuitarClass}
              >
                quitar
              </button>
            </span>
            <input type="hidden" name={`papers[${i}][paper_id]`} value={v.paper_id} />
            <input type="hidden" name={`papers[${i}][paper_nuevo_titulo]`} value={v.paper_nuevo_titulo} />
            <input type="hidden" name={`papers[${i}][paper_nuevo_autores]`} value={v.paper_nuevo_autores} />
            <input type="hidden" name={`papers[${i}][paper_nuevo_anio]`} value={v.paper_nuevo_anio} />
            <input
              type="hidden"
              name={`papers[${i}][paper_nuevo_revista_o_fuente]`}
              value={v.paper_nuevo_revista_o_fuente}
            />
            <input type="hidden" name={`papers[${i}][paper_nuevo_origen]`} value={v.paper_nuevo_origen} />
            <input type="hidden" name={`papers[${i}][paper_nuevo_drive_url]`} value={v.paper_nuevo_drive_url} />
          </div>
        ))}
      </div>

      <div className="space-y-2 rounded-lg border border-line p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-ink">Agregar paper</span>
          <button
            type="button"
            onClick={() => setCreandoNuevo((v) => !v)}
            className="text-xs text-clay underline"
          >
            {creandoNuevo ? "elegir uno existente" : "+ crear uno nuevo"}
          </button>
        </div>

        {!creandoNuevo ? (
          <select value={paperSel} onChange={(e) => setPaperSel(e.target.value)} className={inputClass}>
            <option value="">Elige un paper...</option>
            {papersExistentes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.titulo}
                {p.anio ? ` (${p.anio})` : ""}
              </option>
            ))}
          </select>
        ) : (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <input
              value={nuevo.titulo}
              onChange={(e) => setNuevo({ ...nuevo, titulo: e.target.value })}
              placeholder="Título *"
              className={`${inputClass} md:col-span-2`}
            />
            <input
              value={nuevo.autores}
              onChange={(e) => setNuevo({ ...nuevo, autores: e.target.value })}
              placeholder="Autores"
              className={inputClass}
            />
            <input
              value={nuevo.anio}
              onChange={(e) => setNuevo({ ...nuevo, anio: e.target.value })}
              placeholder="Año"
              type="number"
              className={inputClass}
            />
            <input
              value={nuevo.revista}
              onChange={(e) => setNuevo({ ...nuevo, revista: e.target.value })}
              placeholder="Revista / fuente"
              className={inputClass}
            />
            <select
              value={nuevo.origen}
              onChange={(e) => setNuevo({ ...nuevo, origen: e.target.value })}
              className={inputClass}
            >
              <option value="">Origen...</option>
              {ORIGEN_PAPER_OPCIONES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <input
              value={nuevo.drive_url}
              onChange={(e) => setNuevo({ ...nuevo, drive_url: e.target.value })}
              placeholder="Enlace de Google Drive (opcional)"
              className={`${inputClass} md:col-span-2`}
            />
          </div>
        )}

        <button type="button" onClick={agregar} className={botonSecundarioClass}>
          Agregar
        </button>
      </div>
    </div>
  );
}
