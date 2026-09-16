// Helper compartido para los dos Route Handlers de exportación a
// Excel. Server-only (usa xlsx-js-style, nunca se importa desde un
// componente "use client") — mismos colores que ya usa el resto de
// la app (ver tailwind.config.ts).
import * as XLSX from "xlsx-js-style";
import type { CellStyle } from "xlsx-js-style";

export const ESTILO_ENCABEZADO: CellStyle = {
  font: { bold: true, color: { rgb: "FFFFFF" } },
  fill: { fgColor: { rgb: "14507D" } }, // clay
  alignment: { vertical: "center", wrapText: true },
};

export const ESTILO_SECCION: CellStyle = {
  font: { bold: true, color: { rgb: "0D3A5C" } }, // clayDark
  fill: { fgColor: { rgb: "DCEAF4" } }, // clayLight
};

export const ESTILO_ETIQUETA: CellStyle = {
  font: { bold: true, color: { rgb: "5B6B7A" } }, // inkSoft
};

/** Ancho de columna razonable según el contenido más largo de cada clave. */
export function autoAjustarColumnas(filas: Record<string, unknown>[]): { wch: number }[] {
  if (filas.length === 0) return [];
  const claves = Object.keys(filas[0]);
  return claves.map((clave) => {
    const largoMaximo = filas.reduce((max, fila) => {
      const valor = fila[clave];
      const largo = valor == null ? 0 : String(valor).length;
      return Math.max(max, largo);
    }, clave.length);
    return { wch: Math.min(Math.max(largoMaximo + 2, 10), 60) };
  });
}

/** Pinta la primera fila (encabezado) de una hoja armada con json_to_sheet. */
export function aplicarEstiloEncabezado(ws: XLSX.WorkSheet, numColumnas: number) {
  for (let i = 0; i < numColumnas; i++) {
    const ref = XLSX.utils.encode_cell({ r: 0, c: i });
    if (ws[ref]) ws[ref].s = ESTILO_ENCABEZADO;
  }
}

/** Arma una hoja tabular (json_to_sheet) con encabezado estilizado y columnas ajustadas. */
export function hojaTabular(filas: Record<string, unknown>[]): XLSX.WorkSheet {
  const ws = XLSX.utils.json_to_sheet(filas);
  if (filas.length > 0) {
    aplicarEstiloEncabezado(ws, Object.keys(filas[0]).length);
    ws["!cols"] = autoAjustarColumnas(filas);
  }
  return ws;
}

function sanitizarNombreArchivo(nombre: string): string {
  return (
    nombre
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "") // saca tildes
      .replace(/[^a-zA-Z0-9-_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "exportacion"
  );
}

export function respuestaExcel(libro: XLSX.WorkBook, nombreBase: string): Response {
  const buffer = XLSX.write(libro, { type: "buffer", bookType: "xlsx" }) as Buffer;
  const nombreArchivo = `${sanitizarNombreArchivo(nombreBase)}.xlsx`;
  // Response no acepta Buffer de Node directamente en sus tipos — se
  // pasa como Uint8Array (Buffer ya lo es en runtime, esto solo
  // satisface a TypeScript).
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${nombreArchivo}"`,
      "Cache-Control": "no-store",
    },
  });
}
