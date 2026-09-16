import { NextResponse } from "next/server";
import * as XLSX from "xlsx-js-style";
import { createClient } from "@/lib/supabase/server";
import { SELECT_PIEZA } from "@/lib/queries";
import { hojaTabular, respuestaExcel } from "@/lib/excel";
import { unoONulo, type Pieza } from "@/lib/types";

// Volcado completo del catálogo, pensado como respaldo/portabilidad
// (no como "lo que estoy viendo ahora" — por eso ignora los filtros
// activos del catálogo a propósito). Varias hojas, una por tabla o
// relación, con los nombres de columna calcados de la base de datos
// en las hojas principales — así sirve de referencia real del
// esquema si algún día hay que migrar a otra base.

function filaPieza(p: Pieza): Record<string, unknown> {
  const sitio = unoONulo(p.sitios);
  const procedencia = unoONulo(p.procedencia);
  const aerofono = unoONulo(p.aerofonos);
  const cordofono = unoONulo(p.cordofonos);
  const idiofono = unoONulo(p.idiofonos);
  const membranofono = unoONulo(p.membranofonos);

  return {
    id: p.id,
    familia: p.familia,
    codigo_hs: p.codigo_hs ?? "",
    nombre_generico: p.nombre_generico,
    numero_inventario_museo: p.numero_inventario_museo ?? "",
    sitio: sitio?.nombre ?? "",
    contexto: p.contexto ?? "",
    cultura_etnia: p.cultura_etnia ?? "",
    periodo_cultural: p.periodo_cultural ?? "",
    cantidad: p.cantidad,
    integridad: p.integridad,
    descripcion_fragmentacion: p.descripcion_fragmentacion ?? "",
    materiales: p.materiales ?? "",
    alto_mm: p.alto_mm ?? "",
    largo_mm: p.largo_mm ?? "",
    ancho_mm: p.ancho_mm ?? "",
    construccion: p.construccion ?? "",
    ornamentacion: p.ornamentacion ?? "",
    estado_conservacion: p.estado_conservacion ?? "",
    observaciones: p.observaciones ?? "",
    estado_interpretacion: p.estado_interpretacion,
    motivo_no_interpretable: p.motivo_no_interpretable ?? "",
    procedencia_fecha_hallazgo: procedencia?.fecha_hallazgo ?? "",
    procedencia_metodo_ingreso: procedencia?.metodo_ingreso ?? "",
    procedencia_numero_registro_historico: procedencia?.numero_registro_historico ?? "",
    procedencia_notas: procedencia?.notas ?? "",
    aerofono_mecanismo_vibracion: aerofono?.mecanismo_vibracion ?? "",
    aerofono_diapason_referencia: aerofono?.diapason_referencia ?? "",
    aerofono_numero_tubos: aerofono?.numero_tubos ?? "",
    aerofono_notacion_musical: aerofono?.notacion_musical ?? "",
    aerofono_tañido_potencia: aerofono?.tañido_potencia ?? "",
    aerofono_tañido_calidad: aerofono?.tañido_calidad ?? "",
    cordofono_posicion_cuerdas: cordofono?.posicion_cuerdas ?? "",
    cordofono_orden_cuerdas: cordofono?.orden_cuerdas?.map((c) => `${c.posicion}:${c.nota}`).join(" · ") ?? "",
    idiofono_mecanismo: idiofono?.mecanismo ?? "",
    membranofono_tipo_fondo: membranofono?.tipo_fondo ?? "",
    membranofono_mecanismo: membranofono?.mecanismo ?? "",
    membranofono_material_membrana: membranofono?.material_membrana ?? "",
    membranofono_fijacion_membrana: membranofono?.fijacion_membrana ?? "",
  };
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const [{ data: piezasRaw }, { data: sitios }, { data: actores }, { data: papers }, { data: relacionesRaw }] =
    await Promise.all([
      supabase.from("piezas").select(SELECT_PIEZA).is("deleted_at", null).order("nombre_generico"),
      supabase.from("sitios").select("id, nombre, tipo_sitio, fase_cultural, arqueologo, bibliografia, notas").order("nombre"),
      supabase.from("actores").select("id, nombre, tipo").order("nombre"),
      supabase.from("papers").select("id, titulo, autores, anio, revista_o_fuente, origen, drive_url").order("titulo"),
      supabase
        .from("relaciones_piezas")
        .select(
          "tipo_relacion, notas, " +
            "pieza_a:pieza_id_a(id, nombre_generico, numero_inventario_museo), " +
            "pieza_b:pieza_id_b(id, nombre_generico, numero_inventario_museo)"
        ),
    ]);

  const piezas = (piezasRaw ?? []) as unknown as Pieza[];

  const filasActoresPorPieza: Record<string, unknown>[] = [];
  const filasPapersPorPieza: Record<string, unknown>[] = [];
  const filasMedidas: Record<string, unknown>[] = [];

  for (const p of piezas) {
    for (const pa of p.pieza_actores ?? []) {
      filasActoresPorPieza.push({
        pieza_id: p.id,
        pieza_nombre: p.nombre_generico,
        actor_id: pa.actor_id,
        actor_nombre: pa.actores?.nombre ?? "",
        actor_tipo: pa.actores?.tipo ?? "",
        rol: pa.rol,
      });
    }
    for (const pp of p.pieza_papers ?? []) {
      filasPapersPorPieza.push({
        pieza_id: p.id,
        pieza_nombre: p.nombre_generico,
        paper_id: pp.paper_id,
        paper_titulo: pp.papers?.titulo ?? "",
        paper_anio: pp.papers?.anio ?? "",
      });
    }
    for (const m of p.pieza_medidas ?? []) {
      filasMedidas.push({
        pieza_id: p.id,
        pieza_nombre: p.nombre_generico,
        parte: m.parte,
        tipo_medida: m.tipo_medida,
        unidad: m.unidad,
        valor: m.valor,
      });
    }
  }

  type RelacionCruda = {
    tipo_relacion: string;
    notas: string | null;
    pieza_a: { id: string; nombre_generico: string; numero_inventario_museo: string | null } | { id: string; nombre_generico: string; numero_inventario_museo: string | null }[] | null;
    pieza_b: { id: string; nombre_generico: string; numero_inventario_museo: string | null } | { id: string; nombre_generico: string; numero_inventario_museo: string | null }[] | null;
  };
  const filasRelaciones = ((relacionesRaw ?? []) as unknown as RelacionCruda[]).map((r) => {
    const a = unoONulo(r.pieza_a);
    const b = unoONulo(r.pieza_b);
    return {
      pieza_a_id: a?.id ?? "",
      pieza_a_nombre: a?.nombre_generico ?? "",
      pieza_b_id: b?.id ?? "",
      pieza_b_nombre: b?.nombre_generico ?? "",
      tipo_relacion: r.tipo_relacion,
      notas: r.notas ?? "",
    };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, hojaTabular(piezas.map(filaPieza)), "Piezas");
  XLSX.utils.book_append_sheet(wb, hojaTabular(sitios ?? []), "Sitios");
  XLSX.utils.book_append_sheet(wb, hojaTabular(actores ?? []), "Actores");
  XLSX.utils.book_append_sheet(wb, hojaTabular(filasActoresPorPieza), "Actores por pieza");
  XLSX.utils.book_append_sheet(wb, hojaTabular(papers ?? []), "Papers");
  XLSX.utils.book_append_sheet(wb, hojaTabular(filasPapersPorPieza), "Papers por pieza");
  XLSX.utils.book_append_sheet(wb, hojaTabular(filasMedidas), "Medidas");
  XLSX.utils.book_append_sheet(wb, hojaTabular(filasRelaciones), "Relaciones");

  const hoy = new Date().toISOString().slice(0, 10);
  return respuestaExcel(wb, `catalogo-completo-${hoy}`);
}
