import Link from "next/link";
import { FAMILIAS, FAMILIA_COLOR, Pieza } from "@/lib/types";

export default function PiezaCard({
  pieza,
  compacta = false,
  activa = false,
}: {
  pieza: Pieza;
  compacta?: boolean;
  activa?: boolean;
}) {
  const familiaLabel =
    FAMILIAS.find((f) => f.id === pieza.familia)?.label ?? pieza.familia;
  const color = FAMILIA_COLOR[pieza.familia];

  if (compacta) {
    return (
      <Link
        href={`/piezas/${pieza.id}`}
        className="block rounded-lg border-l-4 border p-2.5"
        style={{
          borderLeftColor: color,
          borderColor: activa ? "#14507D" : "#DDE3E8",
          backgroundColor: activa ? "#DCEAF4" : "#FFFFFF",
        }}
      >
        <div className="text-sm font-semibold text-ink">{pieza.nombre_generico}</div>
        <div className="mt-0.5 font-mono text-[10px] text-inkSoft">
          {pieza.numero_inventario_museo || "sin código"}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/piezas/${pieza.id}`}
      className="block rounded-xl border-l-4 border border-line bg-paperLight p-4 shadow-sm transition hover:shadow-md"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="font-semibold text-ink">{pieza.nombre_generico}</div>
        <span
          className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          style={{ color, backgroundColor: `${color}18` }}
        >
          {familiaLabel}
        </span>
      </div>
      <div className="mt-1 font-mono text-xs text-inkSoft">
        {pieza.numero_inventario_museo || "sin código"}
      </div>
      {(pieza.cultura_etnia || pieza.periodo_cultural) && (
        <div className="mt-2 text-xs text-inkSoft">
          {[pieza.cultura_etnia, pieza.periodo_cultural].filter(Boolean).join(" · ")}
        </div>
      )}
    </Link>
  );
}
