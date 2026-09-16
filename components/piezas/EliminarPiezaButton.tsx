"use client";

import { eliminarPieza } from "@/lib/actions/piezas";

export default function EliminarPiezaButton({ piezaId }: { piezaId: string }) {
  return (
    <form
      action={eliminarPieza.bind(null, piezaId)}
      onSubmit={(e) => {
        if (
          !confirm(
            "¿Eliminar esta pieza? Desaparece del catálogo (queda guardada en la base para poder recuperarla)."
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className="rounded-lg border border-danger px-4 py-2 text-sm text-danger">
        Eliminar pieza
      </button>
    </form>
  );
}
