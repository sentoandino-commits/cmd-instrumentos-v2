export type Familia = "aerofono" | "cordofono" | "idiofono" | "membranofono";

export const FAMILIAS: { id: Familia; label: string }[] = [
  { id: "aerofono", label: "Aerófono" },
  { id: "cordofono", label: "Cordófono" },
  { id: "idiofono", label: "Idiófono" },
  { id: "membranofono", label: "Membranófono" },
];

export const FAMILIA_COLOR: Record<Familia, string> = {
  aerofono: "#14507D",
  cordofono: "#B1502F",
  idiofono: "#8B6D2E",
  membranofono: "#5A4A8B",
};

export type Integridad = "completa" | "fragmentada" | "fragmento_unico_hallado";
export type EstadoInterpretacion = "interpretable" | "no_interpretable" | "sin_evaluar";

export const INTEGRIDAD_LABELS: Record<Integridad, string> = {
  completa: "Completa",
  fragmentada: "Fragmentada",
  fragmento_unico_hallado: "Fragmento único hallado",
};

export interface Sitio {
  id: string;
  nombre: string;
  tipo_sitio: string | null;
  fase_cultural: string | null;
  arqueologo: string | null;
  bibliografia: string | null;
  notas: string | null;
}

export interface Procedencia {
  fecha_hallazgo: string | null;
  metodo_ingreso: string | null;
  numero_registro_historico: string | null;
  notas: string | null;
}

export interface Actor {
  id: string;
  tipo: "persona" | "institucion";
  nombre: string;
}

export interface PiezaActor {
  actor_id: string;
  rol: string;
  actores: Actor | null;
}

export interface Paper {
  id: string;
  titulo: string;
  autores: string | null;
  anio: number | null;
  revista_o_fuente: string | null;
  drive_url: string | null;
  origen: string | null;
}

export interface PiezaPaper {
  paper_id: string;
  papers: Paper | null;
}

export interface Medida {
  id: string;
  parte: string;
  tipo_medida: string;
  unidad: string;
  valor: number;
}

export interface Aerofono {
  mecanismo_vibracion: string | null;
  diapason_referencia: string | null;
  numero_tubos: number | null;
  notacion_musical: string | null;
  tañido_potencia: string | null;
  tañido_calidad: string | null;
}

export interface Cordofono {
  posicion_cuerdas: string | null;
  orden_cuerdas: { posicion: number; nota: string }[] | null;
}

export interface Idiofono {
  mecanismo: string | null;
}

export interface Membranofono {
  tipo_fondo: string | null;
  mecanismo: string | null;
  material_membrana: string | null;
  fijacion_membrana: string | null;
}

export interface Pieza {
  id: string;
  familia: Familia;
  codigo_hs: string | null;
  nombre_generico: string;
  numero_inventario_museo: string | null;
  sitio_id: string | null;
  contexto: string | null;
  cultura_etnia: string | null;
  periodo_cultural: string | null;
  cantidad: number;
  integridad: Integridad;
  descripcion_fragmentacion: string | null;
  materiales: string | null;
  alto_mm: string | null;
  largo_mm: string | null;
  ancho_mm: string | null;
  construccion: string | null;
  ornamentacion: string | null;
  estado_conservacion: string | null;
  observaciones: string | null;
  estado_interpretacion: EstadoInterpretacion;
  motivo_no_interpretable: string | null;
  deleted_at: string | null;
  sitios: Sitio[] | Sitio | null;
  aerofonos: Aerofono[] | Aerofono | null;
  cordofonos: Cordofono[] | Cordofono | null;
  idiofonos: Idiofono[] | Idiofono | null;
  membranofonos: Membranofono[] | Membranofono | null;
  procedencia: Procedencia[] | Procedencia | null;
  pieza_actores: PiezaActor[] | null;
  pieza_papers: PiezaPaper[] | null;
  pieza_medidas: Medida[] | null;
}

export interface ClasificacionHS {
  codigo: string;
  termino_es: string;
  parent_codigo: string | null;
}

export type TipoRelacion = "mismo_hallazgo" | "duplicado" | "parte_de" | "relacionada";

export const TIPO_RELACION_LABELS: Record<TipoRelacion, string> = {
  mismo_hallazgo: "Mismo hallazgo / lote",
  duplicado: "Posible duplicado",
  parte_de: "Fragmento / parte de",
  relacionada: "Relacionada (otro motivo)",
};

// La relación se guarda una sola vez (pieza_id_a/pieza_id_b) pero se
// consulta desde cualquiera de las dos piezas; "otraPieza" ya viene
// normalizada por lib/queries.ts sin importar de qué lado quedó guardada.
export interface RelacionPieza {
  id: string;
  tipo_relacion: TipoRelacion;
  notas: string | null;
  otraPieza: {
    id: string;
    nombre_generico: string;
    numero_inventario_museo: string | null;
  };
}

// PostgREST puede devolver una relación 1:1 como objeto u array de un
// elemento según la versión; esta función normaliza ambos casos.
export function unoONulo<T>(valor: T[] | T | null | undefined): T | null {
  if (!valor) return null;
  return Array.isArray(valor) ? valor[0] ?? null : valor;
}
