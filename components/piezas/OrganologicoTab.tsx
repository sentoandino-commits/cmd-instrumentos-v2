"use client";

import { useState } from "react";
import { Pieza, unoONulo, EstadoInterpretacion, Familia } from "@/lib/types";
import {
  MECANISMO_VIBRACION_AEROFONO,
  TAÑIDO_POTENCIA,
  TAÑIDO_CALIDAD,
  POSICION_CUERDAS,
  MECANISMO_IDIOFONO,
  TIPO_FONDO_MEMBRANOFONO,
  MECANISMO_MEMBRANOFONO,
  FIJACION_MEMBRANA,
  ESTADO_INTERPRETACION_OPCIONES,
} from "@/lib/organologico-opciones";
import { Campo, Select, inputClass } from "./campos";
import OrdenCuerdasEditor from "./OrdenCuerdasEditor";

export default function OrganologicoTab({ pieza, familia }: { pieza?: Pieza; familia: Familia }) {
  const [estadoInterpretacion, setEstadoInterpretacion] = useState<EstadoInterpretacion>(
    pieza?.estado_interpretacion ?? "sin_evaluar"
  );

  // Los campos de cada familia solo se precargan si la pieza YA era de
  // esa familia — si el usuario está cambiando de familia, los datos de
  // la familia anterior ya no aplican (se descartan al guardar).
  const mismaFamilia = pieza?.familia === familia;
  const aerofono = mismaFamilia ? unoONulo(pieza!.aerofonos) : null;
  const cordofono = mismaFamilia ? unoONulo(pieza!.cordofonos) : null;
  const idiofono = mismaFamilia ? unoONulo(pieza!.idiofonos) : null;
  const membranofono = mismaFamilia ? unoONulo(pieza!.membranofonos) : null;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {familia === "aerofono" && (
        <>
          <Campo label="Mecanismo de vibración">
            <Select
              name="mecanismo_vibracion"
              opciones={MECANISMO_VIBRACION_AEROFONO}
              defaultValue={aerofono?.mecanismo_vibracion}
            />
          </Campo>
          <Campo label="Diapasón de referencia">
            <input
              name="diapason_referencia"
              defaultValue={aerofono?.diapason_referencia ?? ""}
              className={inputClass}
            />
          </Campo>
          <Campo label="N° de tubos">
            <input
              type="number"
              name="numero_tubos"
              defaultValue={aerofono?.numero_tubos ?? ""}
              className={inputClass}
            />
          </Campo>
          <Campo label="Notación musical">
            <input
              name="notacion_musical"
              defaultValue={aerofono?.notacion_musical ?? ""}
              className={inputClass}
            />
          </Campo>
          <Campo label="Tañido — potencia">
            <Select name="tañido_potencia" opciones={TAÑIDO_POTENCIA} defaultValue={aerofono?.tañido_potencia} />
          </Campo>
          <Campo label="Tañido — calidad">
            <Select name="tañido_calidad" opciones={TAÑIDO_CALIDAD} defaultValue={aerofono?.tañido_calidad} />
          </Campo>
        </>
      )}

      {familia === "cordofono" && (
        <>
          <Campo label="Posición de las cuerdas">
            <Select
              name="posicion_cuerdas"
              opciones={POSICION_CUERDAS}
              defaultValue={cordofono?.posicion_cuerdas}
            />
          </Campo>
          <div className="col-span-full">
            <OrdenCuerdasEditor ordenInicial={cordofono?.orden_cuerdas ?? null} />
          </div>
        </>
      )}

      {familia === "idiofono" && (
        <Campo label="Mecanismo">
          <Select name="idiofono_mecanismo" opciones={MECANISMO_IDIOFONO} defaultValue={idiofono?.mecanismo} />
        </Campo>
      )}

      {familia === "membranofono" && (
        <>
          <Campo label="Tipo de fondo">
            <Select
              name="tipo_fondo"
              opciones={TIPO_FONDO_MEMBRANOFONO}
              defaultValue={membranofono?.tipo_fondo}
            />
          </Campo>
          <Campo label="Mecanismo">
            <Select
              name="membranofono_mecanismo"
              opciones={MECANISMO_MEMBRANOFONO}
              defaultValue={membranofono?.mecanismo}
            />
          </Campo>
          <Campo label="Material de la membrana">
            <input
              name="material_membrana"
              defaultValue={membranofono?.material_membrana ?? ""}
              className={inputClass}
            />
          </Campo>
          <Campo label="Fijación de la membrana">
            <Select
              name="fijacion_membrana"
              opciones={FIJACION_MEMBRANA}
              defaultValue={membranofono?.fijacion_membrana}
            />
          </Campo>
        </>
      )}

      <div className="col-span-full mt-2 border-t border-line pt-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Campo label="Estado de interpretación">
            <select
              name="estado_interpretacion"
              value={estadoInterpretacion}
              onChange={(e) => setEstadoInterpretacion(e.target.value as EstadoInterpretacion)}
              className={inputClass}
            >
              {ESTADO_INTERPRETACION_OPCIONES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Campo>

          {estadoInterpretacion === "no_interpretable" && (
            <Campo label="Motivo">
              <input
                name="motivo_no_interpretable"
                defaultValue={pieza?.motivo_no_interpretable ?? ""}
                className={inputClass}
              />
            </Campo>
          )}
        </div>

        {estadoInterpretacion === "interpretable" && (
          <div className="mt-2 text-xs italic text-inkSoft">
            🎵 Carga de audio: pendiente de conectar almacenamiento real (etapa futura).
          </div>
        )}
      </div>
    </div>
  );
}
