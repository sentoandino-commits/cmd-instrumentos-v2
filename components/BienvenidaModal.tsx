"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const CLAVE_SESSION = "bienvenida_cerrada";

export default function BienvenidaModal() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Solo se evalúa en el navegador — el HTML que recibe un buscador
    // no incluye este modal renderizado, así que no afecta el SEO.
    const yaCerrada = sessionStorage.getItem(CLAVE_SESSION);
    if (!yaCerrada) setVisible(true);
  }, []);

  function cerrar() {
    sessionStorage.setItem(CLAVE_SESSION, "1");
    setVisible(false);
  }

  function irALogin() {
    sessionStorage.setItem(CLAVE_SESSION, "1");
    router.push("/login");
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
      <div className="w-full max-w-sm rounded-xl border border-line bg-paperLight p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 h-1 w-10 rounded bg-clay" />
          <div className="text-lg font-bold text-ink">Fichero de instrumentos andinos</div>
          <div className="text-xs text-inkSoft">Proyecto de investigación · Universidad de Tarapacá</div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={cerrar}
            className="rounded-lg border border-line bg-paper p-4 text-left shadow-sm"
          >
            <div className="mb-1 text-sm font-semibold text-ink">Revisar el fichaje</div>
            <div className="text-xs text-inkSoft">
              Explora el catálogo completo. Acceso abierto, solo de consulta.
            </div>
          </button>
          <button
            onClick={irALogin}
            className="rounded-lg border border-clay bg-paper p-4 text-left shadow-sm"
          >
            <div className="mb-1 text-sm font-semibold text-clayDark">
              Iniciar sesión como investigador
            </div>
            <div className="text-xs text-inkSoft">
              Para el equipo del proyecto: crear, editar y completar fichas.
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
