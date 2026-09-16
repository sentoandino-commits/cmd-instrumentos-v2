"use client";

import { useState } from "react";
import { EntradaAuditLog, resumirCambios } from "@/lib/auditoria";

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Deliberadamente discreto: nada más que un link chico y gris. Se monta
 * solo si hay sesión y hay al menos una entrada (ver PiezaDetailView) —
 * no ocupa espacio ni llama la atención en la ficha.
 */
export default function HistorialCambios({ entradas }: { entradas: EntradaAuditLog[] }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="mt-8 border-t border-line pt-3">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="text-xs text-inkSoft underline decoration-dotted hover:text-ink"
      >
        {abierto ? "Ocultar historial de cambios" : `Historial de cambios (${entradas.length})`}
      </button>

      {abierto && (
        <ul className="mt-2 space-y-1.5">
          {entradas.map((e) => (
            <li key={e.id} className="text-xs text-inkSoft">
              <span className="text-ink">{formatFecha(e.changed_at)}</span>
              {" · "}
              {e.changed_by_email ?? "correo no disponible"}
              {" · "}
              {resumirCambios(e)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
