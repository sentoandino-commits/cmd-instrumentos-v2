// Utilidades puras para leer FormData dentro de los Server Actions.
// Sin "use server": no son endpoints, solo funciones auxiliares.

/** Devuelve el texto del campo, o null si viene vacío/ausente. */
export function textoONulo(formData: FormData, campo: string): string | null {
  const valor = formData.get(campo);
  if (typeof valor !== "string") return null;
  const limpio = valor.trim();
  return limpio === "" ? null : limpio;
}

/** Devuelve el número del campo, o null si viene vacío/ausente/no numérico. */
export function numeroONulo(formData: FormData, campo: string): number | null {
  const texto = textoONulo(formData, campo);
  if (texto === null) return null;
  const numero = Number(texto);
  return Number.isNaN(numero) ? null : numero;
}

/**
 * Parsea filas de una lista dinámica enviadas como
 * `prefijo[0][campo]`, `prefijo[1][campo]`, ... y las devuelve como
 * un array de objetos { campo: valor }, en orden de índice.
 *
 * Se usa para medidas, orden_cuerdas, actores y papers — las 4
 * listas dinámicas del formulario de piezas.
 */
export function parseIndexedArray(
  formData: FormData,
  prefijo: string
): Record<string, string>[] {
  const patron = new RegExp(
    `^${prefijo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\[(\\d+)\\]\\[(\\w+)\\]$`
  );
  const filas = new Map<number, Record<string, string>>();

  for (const [key, valor] of formData.entries()) {
    const match = key.match(patron);
    if (!match || typeof valor !== "string") continue;
    const indice = Number(match[1]);
    const campo = match[2];
    if (!filas.has(indice)) filas.set(indice, {});
    filas.get(indice)![campo] = valor;
  }

  return Array.from(filas.entries())
    .sort(([a], [b]) => a - b)
    .map(([, fila]) => fila);
}
