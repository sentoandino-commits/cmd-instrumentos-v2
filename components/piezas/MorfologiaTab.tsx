"use client";

import { useState } from "react";
import { Pieza, INTEGRIDAD_LABELS, Integridad } from "@/lib/types";
import { ESTADO_CONSERVACION_OPCIONES } from "@/lib/organologico-opciones";
import { Campo, Select, inputClass } from "./campos";
import MedidasEditor from "./MedidasEditor";

const INTEGRIDAD_OPCIONES = (Object.keys(INTEGRIDAD_LABELS) as Integridad[]).map((v) => ({
  value: v,
  label: INTEGRIDAD_LABELS[v],
}));

export default function MorfologiaTab({ pieza }: { pieza?: Pieza }) {
  const [integridad, setIntegridad] = useState<Integridad>(pieza?.integridad ?? "completa");

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Campo label="Integridad de la pieza">
        <select
          name="integridad"
          value={integridad}
          onChange={(e) => setIntegridad(e.target.value as Integridad)}
          className={inputClass}
        >
          {INTEGRIDAD_OPCIONES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Campo>

      {integridad !== "completa" && (
        <Campo label="Descripción de la fragmentación" full>
          <textarea
            name="descripcion_fragmentacion"
            defaultValue={pieza?.descripcion_fragmentacion ?? ""}
            rows={2}
            className={inputClass}
          />
        </Campo>
      )}

      <Campo label="Alto (mm)">
        <input name="alto_mm" defaultValue={pieza?.alto_mm ?? ""} className={inputClass} />
      </Campo>
      <Campo label="Largo (mm)">
        <input name="largo_mm" defaultValue={pieza?.largo_mm ?? ""} className={inputClass} />
      </Campo>
      <Campo label="Ancho (mm)">
        <input name="ancho_mm" defaultValue={pieza?.ancho_mm ?? ""} className={inputClass} />
      </Campo>

      <Campo label="Estado de conservación">
        <Select
          name="estado_conservacion"
          opciones={ESTADO_CONSERVACION_OPCIONES}
          defaultValue={pieza?.estado_conservacion}
          placeholder="(sin evaluar)"
        />
      </Campo>

      <Campo label="Materiales" full>
        <input name="materiales" defaultValue={pieza?.materiales ?? ""} className={inputClass} />
      </Campo>
      <Campo label="Construcción" full>
        <input name="construccion" defaultValue={pieza?.construccion ?? ""} className={inputClass} />
      </Campo>
      <Campo label="Ornamentación" full>
        <input name="ornamentacion" defaultValue={pieza?.ornamentacion ?? ""} className={inputClass} />
      </Campo>
      <Campo label="Observaciones" full>
        <textarea
          name="observaciones"
          defaultValue={pieza?.observaciones ?? ""}
          rows={3}
          className={inputClass}
        />
      </Campo>

      <div className="col-span-full mt-2 border-t border-line pt-4">
        <MedidasEditor medidasIniciales={pieza?.pieza_medidas ?? []} />
      </div>
    </div>
  );
}
