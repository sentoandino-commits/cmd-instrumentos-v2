// Diccionarios de opciones para los <select> del formulario de
// piezas. Los ejemplos ("Ej: ...") vienen del documento maestro del
// proyecto (sección 6.2), tomados de Pérez de Arce (1985) donde los
// da. Selectores que describen una cualidad del sonido (tañido) no
// llevan ejemplo, a propósito.

import { TIPO_RELACION_LABELS, TipoRelacion, Pieza, unoONulo } from "./types";

export interface Opcion {
  value: string;
  label: string;
  ejemplo?: string;
}

function conEjemplo(value: string, label: string, ejemplo?: string): Opcion {
  return ejemplo ? { value, label, ejemplo } : { value, label };
}

// ---- Aerófono ----
export const MECANISMO_VIBRACION_AEROFONO: Opcion[] = [
  conEjemplo("labios_borde", "Labios en el borde", "quena, siku"),
  conEjemplo("conducto_borde", "Conducto hasta el borde", "pincullo, ocarina"),
  conEjemplo("lengueta_simple", "Lengüeta simple", "clarinete"),
  conEjemplo("doble_lengueta", "Doble lengüeta", "oboe, chirisuya"),
  conEjemplo("boquilla", "Boquilla", "trutruka, erke"),
];

export const TAÑIDO_POTENCIA: Opcion[] = [
  { value: "fuerte", label: "Fuerte" },
  { value: "mediano", label: "Mediano" },
  { value: "debil", label: "Débil" },
];

export const TAÑIDO_CALIDAD: Opcion[] = [
  { value: "suave", label: "Suave" },
  { value: "aspero", label: "Áspero" },
  { value: "puro", label: "Puro" },
  { value: "impuro", label: "Impuro" },
];

// ---- Cordófono ----
export const POSICION_CUERDAS: Opcion[] = [
  conEjemplo(
    "paralelas_tabla_resonancia",
    "Paralelas a la tabla de resonancia",
    "cítara"
  ),
  conEjemplo(
    "paralelas_caja_mango",
    "Paralelas a la caja y el mango",
    "laúd, charango"
  ),
  conEjemplo("perpendiculares_caja", "Perpendiculares a la caja", "arpa"),
];

// ---- Idiófono ----
export const MECANISMO_IDIOFONO: Opcion[] = [
  conEjemplo("golpe", "Golpe", "bastón de ritmo"),
  conEjemplo("entrechoque", "Entrechoque", "castañuelas"),
  conEjemplo("sacudimiento", "Sacudimiento", "maraca, cascabel"),
  conEjemplo("frotamiento", "Frotamiento", "güiro, carraca"),
  conEjemplo("pulsamiento", "Pulsamiento", "trompe, sanza"),
];

// ---- Membranófono ----
export const TIPO_FONDO_MEMBRANOFONO: Opcion[] = [
  conEjemplo("cerrado", "Cerrado", "timbal"),
  conEjemplo("abierto", "Abierto", "tambor"),
];

export const MECANISMO_MEMBRANOFONO: Opcion[] = [
  { value: "percutido", label: "Percutido" },
  { value: "frotado_palo_cordel", label: "Frotado con palo o cordel" },
  conEjemplo("soplado", "Soplado", "mirlitón"),
];

export const FIJACION_MEMBRANA: Opcion[] = [
  { value: "atada", label: "Atada" },
  { value: "clavada", label: "Clavada" },
  { value: "amarrada", label: "Amarrada" },
  { value: "pegada", label: "Pegada" },
];

// ---- Común a las 4 familias ----
export const ESTADO_INTERPRETACION_OPCIONES: Opcion[] = [
  { value: "sin_evaluar", label: "Sin evaluar" },
  { value: "interpretable", label: "Interpretable" },
  { value: "no_interpretable", label: "No interpretable" },
];

// ---- Morfología ----
export const ESTADO_CONSERVACION_OPCIONES: Opcion[] = [
  { value: "Bueno", label: "Bueno" },
  { value: "Regular", label: "Regular" },
  { value: "Malo", label: "Malo" },
];

export const TIPO_MEDIDA_OPCIONES: Opcion[] = [
  { value: "diametro_embocadura", label: "Diámetro embocadura" },
  { value: "largo_tubo", label: "Largo tubo" },
  { value: "diametro_interior", label: "Diámetro interior" },
  { value: "profundidad", label: "Profundidad" },
  { value: "ancho_boca", label: "Ancho boca" },
  { value: "peso", label: "Peso" },
  { value: "otro", label: "Otro" },
];

// ---- Actores ----
export const ROL_ACTOR_OPCIONES: Opcion[] = [
  { value: "excavador", label: "Excavador" },
  { value: "donante", label: "Donante" },
  { value: "coleccionista", label: "Coleccionista" },
  { value: "interprete", label: "Intérprete" },
  { value: "catalogador", label: "Catalogador" },
  { value: "fabricante", label: "Fabricante" },
  { value: "otro", label: "Otro" },
];

// ---- Papers ----
export const ORIGEN_PAPER_OPCIONES: Opcion[] = [
  { value: "digitalizado_museo", label: "Digitalizado del museo" },
  { value: "extraido_museo", label: "Extraído del museo" },
  { value: "publicado", label: "Publicado" },
  { value: "acceso_abierto", label: "Acceso abierto" },
];

// ---- Relaciones ----
export const TIPO_RELACION_OPCIONES: Opcion[] = (
  Object.keys(TIPO_RELACION_LABELS) as TipoRelacion[]
).map((v) => ({ value: v, label: TIPO_RELACION_LABELS[v] }));

export function labelConEjemplo(opcion: Opcion): string {
  return opcion.ejemplo ? `${opcion.label} (Ej: ${opcion.ejemplo})` : opcion.label;
}

/**
 * Pares [etiqueta, valor] de los campos organológicos según la
 * familia de la pieza — compartido entre la vista de la ficha
 * (PiezaDetailView) y las exportaciones (Excel por ficha).
 */
export function organologicoParaVista(pieza: Pieza): [string, string | number][] {
  if (pieza.familia === "aerofono") {
    const o = unoONulo(pieza.aerofonos);
    if (!o) return [];
    return [
      ["Mecanismo de vibración", o.mecanismo_vibracion ?? "—"],
      ["Diapasón de referencia", o.diapason_referencia ?? "—"],
      ["N° de tubos", o.numero_tubos ?? "—"],
      ["Notación musical", o.notacion_musical ?? "—"],
      ["Tañido — potencia", o.tañido_potencia ?? "—"],
      ["Tañido — calidad", o.tañido_calidad ?? "—"],
    ];
  }
  if (pieza.familia === "cordofono") {
    const o = unoONulo(pieza.cordofonos);
    if (!o) return [];
    const cuerdas = o.orden_cuerdas?.map((c) => `${c.posicion}: ${c.nota}`).join(" · ") ?? "—";
    return [
      ["Posición de las cuerdas", o.posicion_cuerdas ?? "—"],
      ["Orden de cuerdas", cuerdas],
    ];
  }
  if (pieza.familia === "idiofono") {
    const o = unoONulo(pieza.idiofonos);
    return o ? [["Mecanismo", o.mecanismo ?? "—"]] : [];
  }
  if (pieza.familia === "membranofono") {
    const o = unoONulo(pieza.membranofonos);
    if (!o) return [];
    return [
      ["Tipo de fondo", o.tipo_fondo ?? "—"],
      ["Mecanismo", o.mecanismo ?? "—"],
      ["Material de la membrana", o.material_membrana ?? "—"],
      ["Fijación de la membrana", o.fijacion_membrana ?? "—"],
    ];
  }
  return [];
}
