export interface EntradaAuditLog {
  id: string;
  accion: "INSERT" | "UPDATE" | "DELETE";
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  changed_by_email: string | null;
  changed_at: string;
}

// Campos que no aportan al resumen (metadatos o el tsvector generado).
const CAMPOS_EXCLUIDOS = new Set([
  "id",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by",
  "busqueda",
  "deleted_at", // se resume aparte, no como "campo modificado" más
]);

const ETIQUETAS: Record<string, string> = {
  nombre_generico: "nombre genérico",
  numero_inventario_museo: "n° de inventario",
  codigo_hs: "clasificación H-S",
  sitio_id: "sitio",
  cultura_etnia: "cultura/etnia",
  periodo_cultural: "período cultural",
  estado_conservacion: "estado de conservación",
  estado_interpretacion: "estado de interpretación",
  motivo_no_interpretable: "motivo (no interpretable)",
  descripcion_fragmentacion: "descripción de fragmentación",
  alto_mm: "alto",
  largo_mm: "largo",
  ancho_mm: "ancho",
};

function etiquetaCampo(campo: string): string {
  return ETIQUETAS[campo] ?? campo.replace(/_/g, " ");
}

/** Resumen en lenguaje simple de qué cambió en una entrada del historial. */
export function resumirCambios(entrada: EntradaAuditLog): string {
  if (entrada.accion === "INSERT") return "Pieza creada";
  if (entrada.accion === "DELETE") return "Pieza eliminada de la base (borrado físico)";

  const antes = entrada.old_data ?? {};
  const despues = entrada.new_data ?? {};

  if (antes.deleted_at == null && despues.deleted_at != null) return "Pieza eliminada del catálogo";
  if (antes.deleted_at != null && despues.deleted_at == null) return "Pieza restaurada";

  const campos = new Set([...Object.keys(antes), ...Object.keys(despues)]);
  const cambiados: string[] = [];
  for (const campo of campos) {
    if (CAMPOS_EXCLUIDOS.has(campo)) continue;
    if (JSON.stringify(antes[campo] ?? null) !== JSON.stringify(despues[campo] ?? null)) {
      cambiados.push(etiquetaCampo(campo));
    }
  }

  if (cambiados.length === 0) return "Sin cambios en los datos generales (revisa organológico/medidas/vínculos)";
  return `Campos modificados: ${cambiados.join(", ")}`;
}

/**
 * Colapsa entradas consecutivas que describen el mismo cambio
 * (mismo resumen + mismo correo) ocurridas a pocos segundos de
 * diferencia. Compara por el resumen ya calculado, no por los
 * campos crudos, porque si hubiera dos triggers escribiendo en
 * audit_log para el mismo UPDATE (ej. uno viejo que no llena
 * `accion`, además del actual) los valores crudos no calzan exacto
 * aunque describan el mismo cambio. `entradas` debe venir ordenada
 * de más reciente a más antigua (como devuelve fetchHistorialPieza).
 */
export function deduplicarEntradas(entradas: EntradaAuditLog[]): EntradaAuditLog[] {
  const VENTANA_MS = 10_000;
  const resultado: EntradaAuditLog[] = [];
  let resumenAnterior = "";

  for (const entrada of entradas) {
    const anterior = resultado[resultado.length - 1];
    const resumen = resumirCambios(entrada);
    const esDuplicado =
      anterior &&
      resumen === resumenAnterior &&
      anterior.changed_by_email === entrada.changed_by_email &&
      Math.abs(new Date(anterior.changed_at).getTime() - new Date(entrada.changed_at).getTime()) < VENTANA_MS;

    if (!esDuplicado) {
      resultado.push(entrada);
      resumenAnterior = resumen;
    }
  }

  return resultado;
}
