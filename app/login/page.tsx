"use client";

import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";

function LoginContent() {
  const params = useSearchParams();
  const error = params.get("error");
  const [oauthError, setOauthError] = useState<string | null>(null);
  const supabase = createClient();

  async function entrarConGoogle() {
    setOauthError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setOauthError(error.message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm rounded-xl border border-line bg-paperLight p-8 text-center shadow-sm">
        <div className="mb-1 text-lg font-bold text-ink">Ingreso de investigador</div>
        <p className="mb-6 text-sm text-inkSoft">
          Proyecto de investigación · Universidad de Tarapacá
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-danger bg-dangerLight p-3 text-xs text-danger">
            {error === "no_autorizado"
              ? "Tu correo no está autorizado todavía. Pide acceso al administrador del proyecto."
              : "No se pudo iniciar sesión. Intenta de nuevo."}
          </div>
        )}

        {oauthError && (
          <div className="mb-4 rounded-lg border border-danger bg-dangerLight p-3 text-xs text-danger">
            {oauthError}
          </div>
        )}

        <button
          onClick={entrarConGoogle}
          className="w-full rounded-lg bg-clay px-4 py-2.5 text-sm font-semibold text-white"
        >
          Iniciar sesión con Google
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
