import Link from "next/link";

/**
 * Alterna entre el catálogo de piezas y la biblioteca de papers.
 * Solo se muestra a investigadores logueados (ver SidebarPiezas /
 * SidebarPapers) — un visitante sin sesión nunca ve que existe la
 * biblioteca de papers.
 */
export default function SeccionSwitch({ activa }: { activa: "piezas" | "papers" }) {
  return (
    <div className="flex gap-1 rounded-lg border border-line bg-paper p-1 text-xs">
      <Link
        href="/piezas"
        className={`flex-1 rounded-md px-2 py-1.5 text-center font-medium ${
          activa === "piezas" ? "bg-clay text-white" : "text-inkSoft hover:bg-paperLight"
        }`}
      >
        📦 Piezas
      </Link>
      <Link
        href="/papers"
        className={`flex-1 rounded-md px-2 py-1.5 text-center font-medium ${
          activa === "papers" ? "bg-clay text-white" : "text-inkSoft hover:bg-paperLight"
        }`}
      >
        📚 Papers
      </Link>
    </div>
  );
}
