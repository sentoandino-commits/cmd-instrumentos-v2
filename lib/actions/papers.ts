"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { textoONulo } from "./form-utils";

export type EstadoPaperForm = { error: string | null };

/**
 * Crea un paper directo desde /papers (a diferencia del "crear nuevo"
 * dentro del formulario de una pieza, que además lo vincula a esa
 * pieza — este solo lo da de alta en la biblioteca).
 */
export async function crearPaperStandalone(
  _prevState: EstadoPaperForm,
  formData: FormData
): Promise<EstadoPaperForm> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión expiró. Vuelve a iniciar sesión." };

  const titulo = textoONulo(formData, "titulo");
  if (!titulo) return { error: "El título es obligatorio." };

  const anioTexto = textoONulo(formData, "anio");
  const { data, error } = await supabase
    .from("papers")
    .insert({
      titulo,
      autores: textoONulo(formData, "autores"),
      anio: anioTexto ? Number(anioTexto) : null,
      revista_o_fuente: textoONulo(formData, "revista_o_fuente"),
      origen: textoONulo(formData, "origen"),
      drive_url: textoONulo(formData, "drive_url"),
    })
    .select("id")
    .single();

  if (error || !data) return { error: `No se pudo crear el paper: ${error?.message ?? ""}` };

  redirect(`/papers/${data.id}`);
}

/** Edita un paper ya existente (desde su propia ficha en /papers/[id]). */
export async function actualizarPaper(
  id: string,
  _prevState: EstadoPaperForm,
  formData: FormData
): Promise<EstadoPaperForm> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión expiró. Vuelve a iniciar sesión." };

  const titulo = textoONulo(formData, "titulo");
  if (!titulo) return { error: "El título es obligatorio." };

  const anioTexto = textoONulo(formData, "anio");
  const { error } = await supabase
    .from("papers")
    .update({
      titulo,
      autores: textoONulo(formData, "autores"),
      anio: anioTexto ? Number(anioTexto) : null,
      revista_o_fuente: textoONulo(formData, "revista_o_fuente"),
      origen: textoONulo(formData, "origen"),
      drive_url: textoONulo(formData, "drive_url"),
    })
    .eq("id", id);

  if (error) return { error: `No se pudo guardar el paper: ${error.message}` };

  redirect(`/papers/${id}`);
}
