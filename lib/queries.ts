// Select reutilizado para traer una pieza completa con todas sus
// relaciones anidadas — usado por la ficha de solo lectura y por el
// formulario de edición (necesitan exactamente los mismos datos).
export const SELECT_PIEZA =
  "*, sitios(*), aerofonos(*), cordofonos(*), idiofonos(*), membranofonos(*), procedencia(*), pieza_actores(*, actores(*)), pieza_medidas(*), pieza_papers(*, papers(*))";
