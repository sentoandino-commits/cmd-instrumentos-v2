"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { parseIndexedArray, textoONulo, numeroONulo } from "./form-utils";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Familia } from "@/lib/types";

export type EstadoPiezaForm = { error: string | null };

const FAMILIAS_VALIDAS: Familia[] = ["aerofono", "cordofono", "idiofono", "membranofono"];

const TABLA_POR_FAMILIA: Record<Familia, string> = {
  aerofono: "aerofonos",
  cordofono: "cordofonos",
  idiofono: "idiofonos",
  membranofono: "membranofonos",
};

async function requireUser(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Resuelve el sitio de la pieza: usa el existente si se eligió uno del
 * selector, crea uno nuevo si se completó el mini-formulario "+ nuevo
 * sitio", o devuelve null si no se eligió/creó ninguno (es opcional).
 */
async function resolverSitio(
  supabase: SupabaseClient,
  formData: FormData
): Promise<{ sitioId: string | null; error?: string }> {
  const nuevoNombre = textoONulo(formData, "sitio_nuevo_nombre");
  if (nuevoNombre) {
    const { data, error } = await supabase
      .from("sitios")
      .insert({
        nombre: nuevoNombre,
        tipo_sitio: textoONulo(formData, "sitio_nuevo_tipo_sitio"),
        fase_cultural: textoONulo(formData, "sitio_nuevo_fase_cultural"),
        arqueologo: textoONulo(formData, "sitio_nuevo_arqueologo"),
        bibliografia: textoONulo(formData, "sitio_nuevo_bibliografia"),
        notas: textoONulo(formData, "sitio_nuevo_notas"),
      })
      .select("id")
      .single();
    if (error || !data) {
      return { sitioId: null, error: `No se pudo crear el sitio nuevo: ${error?.message ?? ""}` };
    }
    return { sitioId: data.id };
  }
  return { sitioId: textoONulo(formData, "sitio_id") };
}

/**
 * Borra las filas de las otras 3 tablas organológicas para esta pieza
 * (cubre el caso de cambiar de familia al editar) y guarda los campos
 * de la familia elegida.
 */
async function sincronizarOrganologico(
  supabase: SupabaseClient,
  piezaId: string,
  familia: Familia,
  formData: FormData
): Promise<string | null> {
  for (const [fam, tabla] of Object.entries(TABLA_POR_FAMILIA)) {
    if (fam === familia) continue;
    const { error } = await supabase.from(tabla).delete().eq("pieza_id", piezaId);
    if (error) return `No se pudo limpiar datos organológicos previos (${tabla}): ${error.message}`;
  }

  let payload: Record<string, unknown> = { pieza_id: piezaId };

  if (familia === "aerofono") {
    payload = {
      ...payload,
      mecanismo_vibracion: textoONulo(formData, "mecanismo_vibracion"),
      diapason_referencia: textoONulo(formData, "diapason_referencia"),
      numero_tubos: numeroONulo(formData, "numero_tubos"),
      notacion_musical: textoONulo(formData, "notacion_musical"),
      tañido_potencia: textoONulo(formData, "tañido_potencia"),
      tañido_calidad: textoONulo(formData, "tañido_calidad"),
    };
  } else if (familia === "cordofono") {
    const filas = parseIndexedArray(formData, "orden_cuerdas").filter((f) => f.nota);
    const ordenCuerdas = filas.map((f) => ({
      posicion: Number(f.posicion) || 0,
      nota: f.nota,
    }));
    payload = {
      ...payload,
      posicion_cuerdas: textoONulo(formData, "posicion_cuerdas"),
      orden_cuerdas: ordenCuerdas.length > 0 ? ordenCuerdas : null,
    };
  } else if (familia === "idiofono") {
    payload = { ...payload, mecanismo: textoONulo(formData, "idiofono_mecanismo") };
  } else if (familia === "membranofono") {
    payload = {
      ...payload,
      tipo_fondo: textoONulo(formData, "tipo_fondo"),
      mecanismo: textoONulo(formData, "membranofono_mecanismo"),
      material_membrana: textoONulo(formData, "material_membrana"),
      fijacion_membrana: textoONulo(formData, "fijacion_membrana"),
    };
  }

  const { error } = await supabase
    .from(TABLA_POR_FAMILIA[familia])
    .upsert(payload, { onConflict: "pieza_id" });
  if (error) return `No se pudo guardar los datos organológicos: ${error.message}`;
  return null;
}

async function sincronizarMedidas(
  supabase: SupabaseClient,
  piezaId: string,
  formData: FormData
): Promise<string | null> {
  const filas = parseIndexedArray(formData, "medidas").filter((f) => f.tipo_medida && f.valor);

  const { error: errorDelete } = await supabase.from("pieza_medidas").delete().eq("pieza_id", piezaId);
  if (errorDelete) return `No se pudieron actualizar las medidas: ${errorDelete.message}`;
  if (filas.length === 0) return null;

  const payload = filas.map((f) => ({
    pieza_id: piezaId,
    parte: f.parte || "Pieza completa",
    tipo_medida: f.tipo_medida,
    unidad: f.unidad || "mm",
    valor: Number(f.valor) || 0,
  }));
  const { error } = await supabase.from("pieza_medidas").insert(payload);
  if (error) return `No se pudieron guardar las medidas: ${error.message}`;
  return null;
}

async function sincronizarActores(
  supabase: SupabaseClient,
  piezaId: string,
  formData: FormData
): Promise<string | null> {
  const filas = parseIndexedArray(formData, "actores");
  const vinculos: { actor_id: string; rol: string }[] = [];

  for (const fila of filas) {
    if (!fila.rol) continue;
    let actorId = fila.actor_id;
    if (!actorId && fila.actor_nuevo_nombre) {
      const { data, error } = await supabase
        .from("actores")
        .insert({
          nombre: fila.actor_nuevo_nombre,
          tipo: fila.actor_nuevo_tipo === "institucion" ? "institucion" : "persona",
        })
        .select("id")
        .single();
      if (error || !data) {
        return `No se pudo crear el actor "${fila.actor_nuevo_nombre}": ${error?.message ?? ""}`;
      }
      actorId = data.id;
    }
    if (actorId) vinculos.push({ actor_id: actorId, rol: fila.rol });
  }

  const { error: errorDelete } = await supabase.from("pieza_actores").delete().eq("pieza_id", piezaId);
  if (errorDelete) return `No se pudieron actualizar los actores vinculados: ${errorDelete.message}`;
  if (vinculos.length === 0) return null;

  const { error } = await supabase
    .from("pieza_actores")
    .insert(vinculos.map((v) => ({ pieza_id: piezaId, ...v })));
  if (error) return `No se pudieron vincular los actores: ${error.message}`;
  return null;
}

async function sincronizarPapers(
  supabase: SupabaseClient,
  piezaId: string,
  formData: FormData
): Promise<string | null> {
  const filas = parseIndexedArray(formData, "papers");
  const paperIds: string[] = [];

  for (const fila of filas) {
    let paperId = fila.paper_id;
    if (!paperId && fila.paper_nuevo_titulo) {
      const { data, error } = await supabase
        .from("papers")
        .insert({
          titulo: fila.paper_nuevo_titulo,
          autores: fila.paper_nuevo_autores || null,
          anio: fila.paper_nuevo_anio ? Number(fila.paper_nuevo_anio) : null,
          revista_o_fuente: fila.paper_nuevo_revista_o_fuente || null,
          origen: fila.paper_nuevo_origen || null,
          drive_url: fila.paper_nuevo_drive_url || null,
        })
        .select("id")
        .single();
      if (error || !data) {
        return `No se pudo crear el paper "${fila.paper_nuevo_titulo}": ${error?.message ?? ""}`;
      }
      paperId = data.id;
    }
    if (paperId) paperIds.push(paperId);
  }

  const { error: errorDelete } = await supabase.from("pieza_papers").delete().eq("pieza_id", piezaId);
  if (errorDelete) return `No se pudieron actualizar los papers vinculados: ${errorDelete.message}`;
  if (paperIds.length === 0) return null;

  const { error } = await supabase
    .from("pieza_papers")
    .insert(paperIds.map((paper_id) => ({ pieza_id: piezaId, paper_id })));
  if (error) return `No se pudieron vincular los papers: ${error.message}`;
  return null;
}

async function guardarPieza(id: string | null, formData: FormData): Promise<EstadoPiezaForm> {
  const supabase = await createClient();
  const user = await requireUser(supabase);
  if (!user) return { error: "Tu sesión expiró. Vuelve a iniciar sesión." };

  const nombreGenerico = textoONulo(formData, "nombre_generico");
  const familia = textoONulo(formData, "familia") as Familia | null;
  if (!nombreGenerico) return { error: "El nombre genérico es obligatorio." };
  if (!familia || !FAMILIAS_VALIDAS.includes(familia)) {
    return { error: "Elige una familia organológica válida." };
  }

  const { sitioId, error: errorSitio } = await resolverSitio(supabase, formData);
  if (errorSitio) return { error: errorSitio };

  const datosPieza = {
    familia,
    codigo_hs: textoONulo(formData, "codigo_hs"),
    nombre_generico: nombreGenerico,
    numero_inventario_museo: textoONulo(formData, "numero_inventario_museo"),
    sitio_id: sitioId,
    contexto: textoONulo(formData, "contexto"),
    cultura_etnia: textoONulo(formData, "cultura_etnia"),
    periodo_cultural: textoONulo(formData, "periodo_cultural"),
    cantidad: numeroONulo(formData, "cantidad") ?? 1,
    integridad: textoONulo(formData, "integridad") ?? "completa",
    descripcion_fragmentacion: textoONulo(formData, "descripcion_fragmentacion"),
    materiales: textoONulo(formData, "materiales"),
    alto_mm: textoONulo(formData, "alto_mm"),
    largo_mm: textoONulo(formData, "largo_mm"),
    ancho_mm: textoONulo(formData, "ancho_mm"),
    construccion: textoONulo(formData, "construccion"),
    ornamentacion: textoONulo(formData, "ornamentacion"),
    estado_conservacion: textoONulo(formData, "estado_conservacion"),
    observaciones: textoONulo(formData, "observaciones"),
    estado_interpretacion: textoONulo(formData, "estado_interpretacion") ?? "sin_evaluar",
    motivo_no_interpretable: textoONulo(formData, "motivo_no_interpretable"),
  };

  let piezaId = id;
  if (piezaId) {
    const { error } = await supabase.from("piezas").update(datosPieza).eq("id", piezaId);
    if (error) return { error: `No se pudo guardar la pieza: ${error.message}` };
  } else {
    const { data, error } = await supabase.from("piezas").insert(datosPieza).select("id").single();
    if (error || !data) return { error: `No se pudo crear la pieza: ${error?.message ?? ""}` };
    piezaId = data.id;
  }
  if (!piezaId) return { error: "No se pudo determinar el id de la pieza guardada." };

  const errorOrg = await sincronizarOrganologico(supabase, piezaId, familia, formData);
  if (errorOrg) return { error: errorOrg };

  const { error: errorProcedencia } = await supabase.from("procedencia").upsert(
    {
      pieza_id: piezaId,
      fecha_hallazgo: textoONulo(formData, "fecha_hallazgo"),
      metodo_ingreso: textoONulo(formData, "metodo_ingreso"),
      numero_registro_historico: textoONulo(formData, "numero_registro_historico"),
      notas: textoONulo(formData, "notas_procedencia"),
    },
    { onConflict: "pieza_id" }
  );
  if (errorProcedencia) return { error: `No se pudo guardar la procedencia: ${errorProcedencia.message}` };

  const errorMedidas = await sincronizarMedidas(supabase, piezaId, formData);
  if (errorMedidas) return { error: errorMedidas };

  const errorActores = await sincronizarActores(supabase, piezaId, formData);
  if (errorActores) return { error: errorActores };

  const errorPapers = await sincronizarPapers(supabase, piezaId, formData);
  if (errorPapers) return { error: errorPapers };

  redirect(`/piezas/${piezaId}`);
}

export async function crearPieza(
  _prevState: EstadoPiezaForm,
  formData: FormData
): Promise<EstadoPiezaForm> {
  return guardarPieza(null, formData);
}

export async function actualizarPieza(
  id: string,
  _prevState: EstadoPiezaForm,
  formData: FormData
): Promise<EstadoPiezaForm> {
  return guardarPieza(id, formData);
}

export async function eliminarPieza(id: string): Promise<void> {
  const supabase = await createClient();
  const user = await requireUser(supabase);
  if (!user) redirect("/login");

  await supabase.from("piezas").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  redirect("/piezas");
}
