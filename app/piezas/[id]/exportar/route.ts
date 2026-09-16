import { NextResponse } from "next/server";
import * as XLSX from "xlsx-js-style";
import { createClient } from "@/lib/supabase/server";
import { SELECT_PIEZA, fetchRelacionesPieza, fetchHistorialPieza } from "@/lib/queries";
import { ESTILO_SECCION, ESTILO_ETIQUETA, respuestaExcel } from "@/lib/excel";
import { organologicoParaVista } from "@/lib/organologico-opciones";
import { resumirCambios } from "@/lib/auditoria";
import { FAMILIAS, INTEGRIDAD_LABELS, TIPO_RELACION_LABELS, unoONulo, type Pieza } from "@/lib/types";

const ESTADO_INTERPRETACION_LABEL: Record<string, string> = {
  interpretable: "Interpretable",
  no_interpretable: "No interpretable",
  sin_evaluar: "Sin evaluar",
};

type Fila = { tipo: "seccion" | "dato"; etiqueta: string; valor?: string };

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const { data: piezaRaw, error } = await supabase
    .from("piezas")
    .select(SELECT_PIEZA)
    .eq("id", params.id)
    .single();
  if (error || !piezaRaw) return new Response("Pieza no encontrada", { status: 404 });

  const pieza = piezaRaw as unknown as Pieza;
  const { data: hsList } = await supabase.from("clasificacion_hs").select("*");
  const hs = (hsList ?? []).find((h) => h.codigo === pieza.codigo_hs);
  const relaciones = await fetchRelacionesPieza(supabase, params.id);
  const historial = await fetchHistorialPieza(supabase, params.id);

  const sitio = unoONulo(pieza.sitios);
  const procedencia = unoONulo(pieza.procedencia);
  const medidas = pieza.pieza_medidas ?? [];
  const actores = pieza.pieza_actores ?? [];
  const papers = pieza.pieza_papers ?? [];
  const familiaLabel = FAMILIAS.find((f) => f.id === pieza.familia)?.label ?? pieza.familia;

  const filas: Fila[] = [];
  const seccion = (etiqueta: string) => filas.push({ tipo: "seccion", etiqueta });
  const dato = (etiqueta: string, valor: unknown) => {
    if (valor === null || valor === undefined || valor === "") return;
    filas.push({ tipo: "dato", etiqueta, valor: String(valor) });
  };

  seccion("IDENTIFICACIÓN");
  dato("Nombre genérico", pieza.nombre_generico);
  dato("N° de inventario", pieza.numero_inventario_museo);
  dato("Familia", familiaLabel);
  dato("Clasificación H-S", hs ? `${hs.codigo} — ${hs.termino_es}` : null);
  dato("Contexto", pieza.contexto);
  dato("Cultura/etnia", pieza.cultura_etnia);
  dato("Período cultural", pieza.periodo_cultural);
  dato("Cantidad", pieza.cantidad);

  seccion("PROCEDENCIA");
  dato("Fecha de hallazgo", procedencia?.fecha_hallazgo);
  dato("Método de ingreso", procedencia?.metodo_ingreso);
  dato("N° de registro histórico", procedencia?.numero_registro_historico);
  dato("Notas de procedencia", procedencia?.notas);

  if (sitio) {
    seccion("SITIO ARQUEOLÓGICO");
    dato("Nombre", sitio.nombre);
    dato("Tipo de sitio", sitio.tipo_sitio);
    dato("Fase cultural", sitio.fase_cultural);
    dato("Arqueólogo", sitio.arqueologo);
    dato("Bibliografía del sitio", sitio.bibliografia);
    dato("Notas del sitio", sitio.notas);
  }

  seccion("MORFOLOGÍA");
  dato("Integridad", INTEGRIDAD_LABELS[pieza.integridad]);
  dato("Descripción de fragmentación", pieza.descripcion_fragmentacion);
  dato("Alto (mm)", pieza.alto_mm);
  dato("Largo (mm)", pieza.largo_mm);
  dato("Ancho (mm)", pieza.ancho_mm);
  dato("Estado de conservación", pieza.estado_conservacion);
  dato("Materiales", pieza.materiales);
  dato("Construcción", pieza.construccion);
  dato("Ornamentación", pieza.ornamentacion);
  dato("Observaciones", pieza.observaciones);

  if (medidas.length > 0) {
    seccion("MEDIDAS ESPECÍFICAS");
    medidas.forEach((m, i) => dato(`Medida ${i + 1}`, `${m.parte} — ${m.tipo_medida}: ${m.valor} ${m.unidad}`));
  }

  const orgFilas = organologicoParaVista(pieza);
  seccion(`ORGANOLÓGICO — ${familiaLabel}`);
  orgFilas.forEach(([label, value]) => dato(label, value));
  dato("Estado de interpretación", ESTADO_INTERPRETACION_LABEL[pieza.estado_interpretacion]);
  if (pieza.estado_interpretacion === "no_interpretable") {
    dato("Motivo (no interpretable)", pieza.motivo_no_interpretable);
  }

  if (actores.length > 0) {
    seccion("ACTORES VINCULADOS");
    actores.forEach((a) => dato(a.rol, a.actores?.nombre));
  }

  if (papers.length > 0) {
    seccion("BIBLIOGRAFÍA");
    papers.forEach((pp, i) => {
      const p = pp.papers;
      if (!p) return;
      const cita =
        `${p.autores ? p.autores + ". " : ""}` +
        `${p.anio ? "(" + p.anio + "). " : ""}` +
        `${p.titulo}` +
        `${p.revista_o_fuente ? ". " + p.revista_o_fuente : ""}`;
      dato(`Paper ${i + 1}`, p.drive_url ? `${cita} — ${p.drive_url}` : cita);
    });
  }

  if (relaciones.length > 0) {
    seccion("PIEZAS RELACIONADAS");
    relaciones.forEach((r) =>
      dato(
        TIPO_RELACION_LABELS[r.tipo_relacion],
        r.notas ? `${r.otraPieza.nombre_generico} (${r.notas})` : r.otraPieza.nombre_generico
      )
    );
  }

  if (historial.length > 0) {
    seccion("HISTORIAL DE CAMBIOS");
    historial.forEach((h) =>
      dato(
        new Date(h.changed_at).toLocaleString("es-CL"),
        `${h.changed_by_email ?? "correo no disponible"} — ${resumirCambios(h)}`
      )
    );
  }

  const aoa: (string | number)[][] = filas.map((f) => [f.etiqueta, f.tipo === "dato" ? f.valor ?? "" : ""]);
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [{ wch: 28 }, { wch: 80 }];

  const merges: { s: { r: number; c: number }; e: { r: number; c: number } }[] = [];
  filas.forEach((f, i) => {
    const refA = XLSX.utils.encode_cell({ r: i, c: 0 });
    const refB = XLSX.utils.encode_cell({ r: i, c: 1 });
    if (f.tipo === "seccion") {
      if (ws[refA]) ws[refA].s = ESTILO_SECCION;
      if (ws[refB]) ws[refB].s = ESTILO_SECCION;
      merges.push({ s: { r: i, c: 0 }, e: { r: i, c: 1 } });
    } else if (ws[refA]) {
      ws[refA].s = ESTILO_ETIQUETA;
    }
  });
  ws["!merges"] = merges;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ficha");

  return respuestaExcel(wb, `pieza-${pieza.numero_inventario_museo || pieza.id}`);
}
