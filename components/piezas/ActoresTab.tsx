"use client";

import { useState } from "react";
import { PiezaActor } from "@/lib/types";
import { ROL_ACTOR_OPCIONES } from "@/lib/organologico-opciones";
import { inputClass, botonSecundarioClass, botonQuitarClass } from "./campos";

interface Vinculo {
  key: string;
  actor_id: string;
  actor_nuevo_nombre: string;
  actor_nuevo_tipo: string;
  rol: string;
  nombreMostrado: string;
}

export default function ActoresTab({
  actoresExistentes,
  vinculosIniciales,
}: {
  actoresExistentes: { id: string; nombre: string; tipo: string }[];
  vinculosIniciales: PiezaActor[];
}) {
  const [vinculos, setVinculos] = useState<Vinculo[]>(
    vinculosIniciales.map((v) => ({
      key: crypto.randomUUID(),
      actor_id: v.actor_id,
      actor_nuevo_nombre: "",
      actor_nuevo_tipo: "",
      rol: v.rol,
      nombreMostrado: v.actores?.nombre ?? "(actor eliminado)",
    }))
  );

  const [actorSel, setActorSel] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoTipo, setNuevoTipo] = useState("persona");
  const [rolSel, setRolSel] = useState("");
  const [creandoNuevo, setCreandoNuevo] = useState(false);

  function agregar() {
    if (!rolSel) return;
    if (creandoNuevo) {
      if (!nuevoNombre.trim()) return;
      setVinculos((prev) => [
        ...prev,
        {
          key: crypto.randomUUID(),
          actor_id: "",
          actor_nuevo_nombre: nuevoNombre.trim(),
          actor_nuevo_tipo: nuevoTipo,
          rol: rolSel,
          nombreMostrado: `${nuevoNombre.trim()} (nuevo)`,
        },
      ]);
      setNuevoNombre("");
    } else {
      if (!actorSel) return;
      const actor = actoresExistentes.find((a) => a.id === actorSel);
      setVinculos((prev) => [
        ...prev,
        {
          key: crypto.randomUUID(),
          actor_id: actorSel,
          actor_nuevo_nombre: "",
          actor_nuevo_tipo: "",
          rol: rolSel,
          nombreMostrado: actor?.nombre ?? actorSel,
        },
      ]);
      setActorSel("");
    }
    setRolSel("");
  }

  return (
    <div>
      <div className="mb-4 space-y-2">
        {vinculos.length === 0 && (
          <div className="text-sm italic text-inkSoft">Sin actores vinculados todavía.</div>
        )}
        {vinculos.map((v, i) => (
          <div
            key={v.key}
            className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2 text-sm"
          >
            <span>
              <strong className="text-ink">{v.nombreMostrado}</strong>
              <span className="text-inkSoft">
                {" "}
                — {ROL_ACTOR_OPCIONES.find((r) => r.value === v.rol)?.label ?? v.rol}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setVinculos((prev) => prev.filter((x) => x.key !== v.key))}
              className={botonQuitarClass}
            >
              quitar
            </button>
            <input type="hidden" name={`actores[${i}][actor_id]`} value={v.actor_id} />
            <input type="hidden" name={`actores[${i}][actor_nuevo_nombre]`} value={v.actor_nuevo_nombre} />
            <input type="hidden" name={`actores[${i}][actor_nuevo_tipo]`} value={v.actor_nuevo_tipo} />
            <input type="hidden" name={`actores[${i}][rol]`} value={v.rol} />
          </div>
        ))}
      </div>

      <div className="space-y-2 rounded-lg border border-line p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-ink">Agregar actor</span>
          <button
            type="button"
            onClick={() => setCreandoNuevo((v) => !v)}
            className="text-xs text-clay underline"
          >
            {creandoNuevo ? "elegir uno existente" : "+ crear uno nuevo"}
          </button>
        </div>

        {!creandoNuevo ? (
          <select value={actorSel} onChange={(e) => setActorSel(e.target.value)} className={inputClass}>
            <option value="">Elige un actor...</option>
            {actoresExistentes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
        ) : (
          <div className="flex gap-2">
            <input
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              placeholder="Nombre"
              className={inputClass}
            />
            <select
              value={nuevoTipo}
              onChange={(e) => setNuevoTipo(e.target.value)}
              className={`${inputClass} max-w-[160px]`}
            >
              <option value="persona">Persona</option>
              <option value="institucion">Institución</option>
            </select>
          </div>
        )}

        <div className="flex gap-2">
          <select value={rolSel} onChange={(e) => setRolSel(e.target.value)} className={inputClass}>
            <option value="">Rol...</option>
            {ROL_ACTOR_OPCIONES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button type="button" onClick={agregar} className={botonSecundarioClass}>
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
