"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { crearPieza, actualizarPieza } from "@/lib/actions/piezas";
import { ClasificacionHS, Pieza, Familia, RelacionPieza } from "@/lib/types";
import IdentificacionTab from "./IdentificacionTab";
import MorfologiaTab from "./MorfologiaTab";
import OrganologicoTab from "./OrganologicoTab";
import ActoresTab from "./ActoresTab";
import PapersTab from "./PapersTab";
import RelacionesTab from "./RelacionesTab";
import EliminarPiezaButton from "./EliminarPiezaButton";

export type TabId =
  | "identificacion"
  | "morfologia"
  | "organologico"
  | "actores"
  | "papers"
  | "relaciones";

const TABS: { id: TabId; label: string }[] = [
  { id: "identificacion", label: "Identificación" },
  { id: "morfologia", label: "Morfología" },
  { id: "organologico", label: "Organológico" },
  { id: "actores", label: "Actores" },
  { id: "papers", label: "Papers" },
  { id: "relaciones", label: "Relaciones" },
];

function esTabId(valor: string | undefined): valor is TabId {
  return TABS.some((t) => t.id === valor);
}

function BotonGuardar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-clay px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
    >
      {pending ? "Guardando…" : "Guardar"}
    </button>
  );
}

export default function PiezaForm({
  modo,
  piezaId,
  pieza,
  hsList,
  sitios,
  actoresExistentes,
  papersExistentes,
  todasLasPiezas,
  relacionesIniciales,
  initialTab,
}: {
  modo: "crear" | "editar";
  piezaId?: string;
  pieza?: Pieza;
  hsList: ClasificacionHS[];
  sitios: { id: string; nombre: string }[];
  actoresExistentes: { id: string; nombre: string; tipo: string }[];
  papersExistentes: { id: string; titulo: string; anio: number | null }[];
  todasLasPiezas: { id: string; nombre_generico: string; numero_inventario_museo: string | null }[];
  relacionesIniciales?: RelacionPieza[];
  initialTab?: string;
}) {
  const [tab, setTab] = useState<TabId>(esTabId(initialTab) ? initialTab : "identificacion");
  const [familia, setFamilia] = useState<Familia>(pieza?.familia ?? "aerofono");

  const accion = modo === "crear" ? crearPieza : actualizarPieza.bind(null, piezaId as string);
  const [estado, formAction] = useFormState(accion, { error: null });

  return (
    <form action={formAction}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                tab === t.id ? "border-clay bg-clayLight text-clayDark" : "border-line text-inkSoft"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {modo === "editar" && (
            <Link href={`/piezas/${piezaId}`} className="text-sm text-inkSoft underline">
              ← volver a la vista
            </Link>
          )}
          <BotonGuardar />
        </div>
      </div>

      {estado.error && (
        <div className="mb-4 rounded-lg border border-danger bg-dangerLight p-3 text-sm text-danger">
          {estado.error}
        </div>
      )}

      <div className="rounded-xl border border-line bg-paperLight p-5 shadow-sm">
        <div hidden={tab !== "identificacion"}>
          <IdentificacionTab
            pieza={pieza}
            familia={familia}
            onFamiliaChange={setFamilia}
            hsList={hsList}
            sitios={sitios}
          />
        </div>
        <div hidden={tab !== "morfologia"}>
          <MorfologiaTab pieza={pieza} />
        </div>
        <div hidden={tab !== "organologico"}>
          <OrganologicoTab pieza={pieza} familia={familia} />
        </div>
        <div hidden={tab !== "actores"}>
          <ActoresTab actoresExistentes={actoresExistentes} vinculosIniciales={pieza?.pieza_actores ?? []} />
        </div>
        <div hidden={tab !== "papers"}>
          <PapersTab papersExistentes={papersExistentes} vinculosIniciales={pieza?.pieza_papers ?? []} />
        </div>
        <div hidden={tab !== "relaciones"}>
          <RelacionesTab todasLasPiezas={todasLasPiezas} relacionesIniciales={relacionesIniciales ?? []} />
        </div>
      </div>

      {modo === "editar" && piezaId && (
        <div className="mt-6 flex justify-end">
          <EliminarPiezaButton piezaId={piezaId} />
        </div>
      )}
    </form>
  );
}
