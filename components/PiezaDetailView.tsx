import Link from "next/link";
import {
  FAMILIAS,
  FAMILIA_COLOR,
  INTEGRIDAD_LABELS,
  Pieza,
  unoONulo,
  ClasificacionHS,
  RelacionPieza,
  TIPO_RELACION_LABELS,
} from "@/lib/types";
import { FactPill, Dato, CardSection } from "@/components/Dato";

function EditarLink({ piezaId, tab }: { piezaId: string; tab: string }) {
  return (
    <Link
      href={`/piezas/${piezaId}/editar?tab=${tab}`}
      className="shrink-0 text-xs font-medium text-clay hover:underline"
    >
      ✎ editar
    </Link>
  );
}

function organologicoParaVista(pieza: Pieza): [string, string | number][] {
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

const ESTADO_INTERPRETACION_LABEL: Record<string, string> = {
  interpretable: "Interpretable",
  no_interpretable: "No interpretable",
};

export default function PiezaDetailView({
  pieza,
  hsList,
  relaciones = [],
  puedeEditar = false,
}: {
  pieza: Pieza;
  hsList: ClasificacionHS[];
  relaciones?: RelacionPieza[];
  puedeEditar?: boolean;
}) {
  const hs = hsList.find((h) => h.codigo === pieza.codigo_hs);
  const familiaLabel = FAMILIAS.find((f) => f.id === pieza.familia)?.label ?? pieza.familia;
  const color = FAMILIA_COLOR[pieza.familia];
  const sitio = unoONulo(pieza.sitios);
  const procedencia = unoONulo(pieza.procedencia);
  const orgFilas = organologicoParaVista(pieza);
  const medidas = pieza.pieza_medidas ?? [];
  const actores = pieza.pieza_actores ?? [];
  const papers = pieza.pieza_papers ?? [];

  const badgeInterpretacion =
    pieza.estado_interpretacion !== "sin_evaluar"
      ? ESTADO_INTERPRETACION_LABEL[pieza.estado_interpretacion]
      : null;

  return (
    <div>
      <nav className="mb-4 flex items-center justify-between gap-3 text-xs text-inkSoft">
        <span>
          Fichero › {familiaLabel} › <span className="font-semibold text-ink">{pieza.nombre_generico}</span>
        </span>
        {puedeEditar && (
          <Link
            href={`/piezas/${pieza.id}/editar`}
            className="shrink-0 rounded-lg border border-clay px-3 py-1.5 text-xs font-semibold text-clay hover:bg-clayLight"
          >
            ✎ Editar pieza
          </Link>
        )}
      </nav>

      <div className="mb-5 flex h-80 w-full items-center justify-center rounded-xl border border-line bg-paperLight text-sm text-inkSoft">
        Sin fotografía todavía
      </div>

      <div className="mb-3">
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          style={{ color, backgroundColor: `${color}18` }}
        >
          {familiaLabel}
        </span>
        <h1 className="mt-2 text-2xl font-bold leading-tight text-ink">
          {pieza.nombre_generico}
        </h1>
        <div className="mt-1 font-mono text-xs text-inkSoft">
          {pieza.numero_inventario_museo || "sin código"}
          {pieza.cantidad > 1 ? ` · cantidad: ${pieza.cantidad}` : ""}
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <FactPill label="Cultura" value={pieza.cultura_etnia} />
        <FactPill label="Período" value={pieza.periodo_cultural} />
        <FactPill label="Sitio" value={sitio?.nombre} />
        {hs && <FactPill label="H-S" value={`${hs.codigo} — ${hs.termino_es}`} />}
      </div>

      {pieza.observaciones && (
        <p className="mb-6 max-w-2xl text-[15px] leading-relaxed text-ink">
          {pieza.observaciones}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <CardSection
          title="Identificación y procedencia"
          action={puedeEditar && <EditarLink piezaId={pieza.id} tab="identificacion" />}
        >
          <Dato label="Contexto" value={pieza.contexto} />
          <Dato label="N° de registro histórico" value={procedencia?.numero_registro_historico} />
          <Dato label="Fecha de hallazgo" value={procedencia?.fecha_hallazgo} />
          <Dato label="Método de ingreso" value={procedencia?.metodo_ingreso} />
          {procedencia?.notas && <Dato label="Notas de procedencia" value={procedencia.notas} full />}
        </CardSection>

        {sitio && (
          <CardSection title="Sitio arqueológico">
            <Dato label="Nombre" value={sitio.nombre} />
            <Dato label="Tipo de sitio" value={sitio.tipo_sitio} />
            <Dato label="Fase cultural" value={sitio.fase_cultural} />
            <Dato label="Arqueólogo" value={sitio.arqueologo} />
            {sitio.bibliografia && <Dato label="Bibliografía del sitio" value={sitio.bibliografia} full />}
          </CardSection>
        )}

        <CardSection
          title="Morfología"
          action={puedeEditar && <EditarLink piezaId={pieza.id} tab="morfologia" />}
        >
          <Dato label="Integridad" value={INTEGRIDAD_LABELS[pieza.integridad]} />
          {pieza.descripcion_fragmentacion && (
            <Dato label="Descripción de la fragmentación" value={pieza.descripcion_fragmentacion} full />
          )}
          <Dato label="Alto (mm)" value={pieza.alto_mm} />
          <Dato label="Largo (mm)" value={pieza.largo_mm} />
          <Dato label="Ancho (mm)" value={pieza.ancho_mm} />
          <Dato label="Estado de conservación" value={pieza.estado_conservacion} />
          <Dato label="Materiales" value={pieza.materiales} full />
          <Dato label="Construcción" value={pieza.construccion} full />
          <Dato label="Ornamentación" value={pieza.ornamentacion} full />
          {medidas.length > 0 && (
            <Dato
              label="Medidas específicas"
              value={medidas.map((m) => `${m.parte} — ${m.tipo_medida}: ${m.valor} ${m.unidad}`).join(" · ")}
              full
            />
          )}
        </CardSection>

        <CardSection
          title={
            `Organológico — ${familiaLabel}` + (badgeInterpretacion ? ` · ${badgeInterpretacion}` : "")
          }
          action={puedeEditar && <EditarLink piezaId={pieza.id} tab="organologico" />}
        >
          {orgFilas.length === 0 ? (
            <div className="col-span-2 text-sm italic text-inkSoft">Sin datos organológicos.</div>
          ) : (
            orgFilas.map(([label, value]) => <Dato key={label} label={label} value={value} full={label === "Orden de cuerdas"} />)
          )}
          {pieza.estado_interpretacion === "no_interpretable" && pieza.motivo_no_interpretable && (
            <Dato label="Motivo (no interpretable)" value={pieza.motivo_no_interpretable} full />
          )}
          {pieza.estado_interpretacion === "interpretable" && (
            <div className="col-span-2 mt-2 text-xs italic text-inkSoft">
              🎵 Grabación de audio: pendiente de conectar almacenamiento real.
            </div>
          )}
        </CardSection>

        <CardSection
          title="Actores vinculados"
          action={puedeEditar && <EditarLink piezaId={pieza.id} tab="actores" />}
        >
          {actores.length === 0 ? (
            <div className="col-span-2 text-sm italic text-inkSoft">Sin actores vinculados.</div>
          ) : (
            actores.map((a, i) => (
              <Dato key={i} label={a.rol} value={a.actores?.nombre} />
            ))
          )}
        </CardSection>

        <CardSection
          title="Piezas relacionadas"
          action={puedeEditar && <EditarLink piezaId={pieza.id} tab="relaciones" />}
        >
          {relaciones.length === 0 ? (
            <div className="col-span-2 text-sm italic text-inkSoft">Sin piezas relacionadas.</div>
          ) : (
            <div className="col-span-2 flex flex-col gap-2">
              {relaciones.map((r) => (
                <Link
                  key={r.id}
                  href={`/piezas/${r.otraPieza.id}`}
                  className="flex items-center justify-between gap-3 border-b border-line pb-2 text-sm last:border-0"
                >
                  <span className="text-ink">{r.otraPieza.nombre_generico}</span>
                  <span className="shrink-0 text-xs text-inkSoft">{TIPO_RELACION_LABELS[r.tipo_relacion]}</span>
                </Link>
              ))}
            </div>
          )}
        </CardSection>

        <CardSection
          title="Bibliografía"
          span
          action={puedeEditar && <EditarLink piezaId={pieza.id} tab="papers" />}
        >
          {papers.length === 0 ? (
            <div className="col-span-full text-sm italic text-inkSoft">Sin papers vinculados.</div>
          ) : (
            <div className="col-span-full flex flex-col gap-2.5">
              {papers.map((pp, i) => {
                const p = pp.papers;
                if (!p) return null;
                const cita = (
                  <span>
                    {p.autores ? `${p.autores}. ` : ""}
                    {p.anio ? `(${p.anio}). ` : ""}
                    {p.titulo}
                    {p.revista_o_fuente ? `. ${p.revista_o_fuente}.` : "."}
                  </span>
                );
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 border-b border-line pb-2.5 text-sm text-ink last:border-0"
                  >
                    {puedeEditar ? (
                      <Link href={`/papers/${p.id}`} className="hover:underline">
                        {cita}
                      </Link>
                    ) : (
                      cita
                    )}
                    <span className="shrink-0 whitespace-nowrap text-xs">
                      {!puedeEditar ? (
                        <span className="text-inkSoft">🔒 solo investigadores</span>
                      ) : p.drive_url ? (
                        <a
                          href={p.drive_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-clay hover:underline"
                        >
                          Ver documento ↗
                        </a>
                      ) : (
                        <span className="text-inkSoft">sin archivo</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardSection>
      </div>
    </div>
  );
}
