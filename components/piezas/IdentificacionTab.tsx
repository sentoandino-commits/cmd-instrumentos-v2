"use client";

import { ClasificacionHS, Pieza, unoONulo, FAMILIAS, Familia } from "@/lib/types";
import SelectorClasificacionHS from "./SelectorClasificacionHS";
import SitioSelector from "./SitioSelector";
import { Campo, inputClass } from "./campos";

export default function IdentificacionTab({
  pieza,
  familia,
  onFamiliaChange,
  hsList,
  sitios,
}: {
  pieza?: Pieza;
  familia: Familia;
  onFamiliaChange: (familia: Familia) => void;
  hsList: ClasificacionHS[];
  sitios: { id: string; nombre: string }[];
}) {
  const procedencia = pieza ? unoONulo(pieza.procedencia) : null;
  const sitio = pieza ? unoONulo(pieza.sitios) : null;
  // El código H-S solo tiene sentido precargarlo si la pieza ya era de
  // esta familia — si el usuario está cambiando de familia, un código
  // de la familia anterior ya no aplica.
  const codigoHsInicial = pieza && pieza.familia === familia ? pieza.codigo_hs : null;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Campo label="Familia organológica *" full>
        <select
          name="familia"
          required
          value={familia}
          onChange={(e) => onFamiliaChange(e.target.value as Familia)}
          className={`${inputClass} max-w-xs`}
        >
          {FAMILIAS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      </Campo>

      <Campo label="Nombre genérico *" full>
        <input
          name="nombre_generico"
          required
          defaultValue={pieza?.nombre_generico ?? ""}
          className={inputClass}
        />
      </Campo>

      <Campo label="N° de inventario del museo">
        <input
          name="numero_inventario_museo"
          defaultValue={pieza?.numero_inventario_museo ?? ""}
          className={inputClass}
        />
      </Campo>

      <Campo label="Cantidad">
        <input
          type="number"
          min={1}
          name="cantidad"
          defaultValue={pieza?.cantidad ?? 1}
          className={inputClass}
        />
      </Campo>

      <SelectorClasificacionHS hsList={hsList} familia={familia} valorInicial={codigoHsInicial} />
      <SitioSelector sitios={sitios} valorInicial={sitio?.id ?? pieza?.sitio_id ?? null} />

      <Campo label="Contexto (ej. Tumba 125)">
        <input name="contexto" defaultValue={pieza?.contexto ?? ""} className={inputClass} />
      </Campo>

      <Campo label="Cultura / etnia">
        <input name="cultura_etnia" defaultValue={pieza?.cultura_etnia ?? ""} className={inputClass} />
      </Campo>

      <Campo label="Período cultural">
        <input
          name="periodo_cultural"
          defaultValue={pieza?.periodo_cultural ?? ""}
          className={inputClass}
        />
      </Campo>

      <div className="col-span-full mt-2 border-t border-line pt-4">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-clayDark">
          Procedencia del hallazgo
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Campo label="Fecha de hallazgo">
            <input
              type="date"
              name="fecha_hallazgo"
              defaultValue={procedencia?.fecha_hallazgo ?? ""}
              className={inputClass}
            />
          </Campo>
          <Campo label="Método de ingreso">
            <input
              name="metodo_ingreso"
              defaultValue={procedencia?.metodo_ingreso ?? ""}
              className={inputClass}
            />
          </Campo>
          <Campo label="N° de registro histórico (museo)">
            <input
              name="numero_registro_historico"
              defaultValue={procedencia?.numero_registro_historico ?? ""}
              className={inputClass}
            />
          </Campo>
          <Campo label="Notas de procedencia" full>
            <textarea
              name="notas_procedencia"
              defaultValue={procedencia?.notas ?? ""}
              rows={2}
              className={inputClass}
            />
          </Campo>
        </div>
      </div>
    </div>
  );
}
