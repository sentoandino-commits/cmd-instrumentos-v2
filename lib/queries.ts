import type { SupabaseClient } from "@supabase/supabase-js";
import type { RelacionPieza, TipoRelacion } from "./types";

// Select reutilizado para traer una pieza completa con todas sus
// relaciones anidadas — usado por la ficha de solo lectura y por el
// formulario de edición (necesitan exactamente los mismos datos).
export const SELECT_PIEZA =
  "*, sitios(*), aerofonos(*), cordofonos(*), idiofonos(*), membranofonos(*), procedencia(*), pieza_actores(*, actores(*)), pieza_medidas(*), pieza_papers(*, papers(*))";

/**
 * Trae las relaciones de una pieza sin importar de qué lado quedaron
 * guardadas (pieza_id_a o pieza_id_b), y devuelve siempre "la otra
 * pieza" ya resuelta — ni la ficha ni el formulario necesitan saber
 * de la asimetría de almacenamiento.
 */
export async function fetchRelacionesPieza(
  supabase: SupabaseClient,
  piezaId: string
): Promise<RelacionPieza[]> {
  const { data } = await supabase
    .from("relaciones_piezas")
    .select(
      "id, tipo_relacion, notas, pieza_id_a, pieza_id_b, " +
        "pieza_a:pieza_id_a(id, nombre_generico, numero_inventario_museo), " +
        "pieza_b:pieza_id_b(id, nombre_generico, numero_inventario_museo)"
    )
    .or(`pieza_id_a.eq.${piezaId},pieza_id_b.eq.${piezaId}`);

  return ((data ?? []) as unknown as {
    id: string;
    tipo_relacion: TipoRelacion;
    notas: string | null;
    pieza_id_a: string;
    pieza_a: RelacionPieza["otraPieza"] | RelacionPieza["otraPieza"][] | null;
    pieza_b: RelacionPieza["otraPieza"] | RelacionPieza["otraPieza"][] | null;
  }[]).flatMap((fila) => {
    const otro = fila.pieza_id_a === piezaId ? fila.pieza_b : fila.pieza_a;
    const otraPieza = Array.isArray(otro) ? otro[0] : otro;
    if (!otraPieza) return [];
    return [{ id: fila.id, tipo_relacion: fila.tipo_relacion, notas: fila.notas, otraPieza }];
  });
}
