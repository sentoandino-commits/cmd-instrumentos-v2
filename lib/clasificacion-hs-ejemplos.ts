// Ejemplos "Ej: ..." para las subcategorías (nivel 2) del selector
// de clasificación Hornbostel-Sachs. Solo 2 vienen ilustrados
// explícitamente en el documento maestro del proyecto (4.2 y 4.4);
// el resto son ejemplos razonables de instrumentos conocidos,
// ajustables a mano aquí si el equipo prefiere otros.
//
// Las categorías de nivel 1 (1, 2, 3, 4) NO llevan ejemplo a
// propósito — el selector les agrega el sufijo "(categoría general,
// sin subtipo específico)" en vez de un "Ej:".

export const HS_EJEMPLOS: Record<string, string> = {
  "1.1": "chin chines, platillos",
  "1.2": "campana, gong",
  "1.3": "maraca, cascabel",
  "1.4": "güiro, carraca",
  "1.5": "trompe, sanza",
  "2.1": "bombo, tambor",
  "2.2": "tambor de fricción con cordel",
  "2.3": "zambomba",
  "2.4": "mirlitón",
  "3.1": "arco musical",
  "3.2": "charango, guitarra",
  "4.1": "zumbador, rómbica",
  "4.2": "quena, zampoña",
  "4.3": "clarinete, chirisuya",
  "4.4": "trutruka, erke",
};

/** true para los 4 códigos de nivel 1 ("1", "2", "3", "4"). */
export function esNivelGeneral(codigo: string): boolean {
  return !codigo.includes(".");
}

export function labelClasificacionHS(codigo: string, terminoEs: string): string {
  if (esNivelGeneral(codigo)) {
    return `${codigo} — ${terminoEs} (categoría general, sin subtipo específico)`;
  }
  const ejemplo = HS_EJEMPLOS[codigo];
  return ejemplo ? `${codigo} — ${terminoEs} (Ej: ${ejemplo})` : `${codigo} — ${terminoEs}`;
}

/** Prefijo numérico de familia, para filtrar el selector por la familia ya elegida. */
export const PREFIJO_FAMILIA_HS: Record<string, string> = {
  idiofono: "1",
  membranofono: "2",
  cordofono: "3",
  aerofono: "4",
};
