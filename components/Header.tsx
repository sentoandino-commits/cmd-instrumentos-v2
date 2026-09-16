import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-line bg-paperLight px-6 py-4 print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/piezas">
          <div className="text-lg font-bold text-ink">
            Fichero de instrumentos andinos
          </div>
          <div className="text-xs text-inkSoft">
            Proyecto de investigación · Universidad de Tarapacá
          </div>
        </Link>

        {user ? (
          <form action="/auth/signout" method="post" className="flex items-center gap-3">
            <span className="text-sm text-inkSoft">{user.email}</span>
            <button
              type="submit"
              className="rounded-lg border border-line px-4 py-1.5 text-sm text-inkSoft"
            >
              Cerrar sesión
            </button>
          </form>
        ) : (
          <Link
            href="/login"
            className="rounded-lg border border-clay px-4 py-1.5 text-sm text-clay"
          >
            Iniciar sesión
          </Link>
        )}
      </div>
    </header>
  );
}
