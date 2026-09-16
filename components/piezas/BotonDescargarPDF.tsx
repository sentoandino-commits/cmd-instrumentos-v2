"use client";

// Público — cualquiera puede descargar el PDF de una ficha, con o sin
// sesión. Sin librería: usa el diálogo de impresión del navegador
// ("Guardar como PDF"), con la hoja de estilos de impresión que ya
// oculta lo que no debe salir (ver components/PiezaDetailView.tsx y
// components/Dato.tsx).
export default function BotonDescargarPDF() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden shrink-0 rounded-lg border border-clay px-3 py-1.5 text-xs font-semibold text-clay hover:bg-clayLight"
    >
      ⬇ Descargar PDF
    </button>
  );
}
