"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FAMILIAS, FAMILIA_COLOR, Familia } from "@/lib/types";

export default function FilterPanel({ culturas }: { culturas: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const familiaActiva = searchParams.get("familia");
  const culturaActiva = searchParams.get("cultura") ?? "";

  function setParam(clave: string, valor: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (valor) {
      params.set(clave, valor);
    } else {
      params.delete(clave);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => setParam("familia", null)}
        className={`rounded-full border px-3 py-1 text-xs ${
          !familiaActiva
            ? "border-clay bg-clayLight text-clayDark"
            : "border-line text-inkSoft"
        }`}
      >
        Todas
      </button>
      {FAMILIAS.map((f) => {
        const color = FAMILIA_COLOR[f.id];
        const activa = familiaActiva === f.id;
        return (
          <button
            key={f.id}
            onClick={() => setParam("familia", activa ? null : (f.id as Familia))}
            className="rounded-full border px-3 py-1 text-xs"
            style={{
              borderColor: activa ? color : "#DDE3E8",
              backgroundColor: activa ? `${color}18` : "transparent",
              color: activa ? color : "#5B6B7A",
            }}
          >
            {f.label}
          </button>
        );
      })}

      {culturas.length > 0 && (
        <select
          value={culturaActiva}
          onChange={(e) => setParam("cultura", e.target.value || null)}
          className="rounded-full border border-line bg-paperLight px-3 py-1 text-xs text-inkSoft"
        >
          <option value="">Cultura: todas</option>
          {culturas.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
