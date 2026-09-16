import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // No borrar esta línea: es la que efectivamente renueva la sesión.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Rutas de creación/edición de piezas: requieren sesión. La
  // protección real de escritura vive en las políticas RLS
  // (supabase-migracion-formularios.sql); esto es solo para no
  // dejar que un visitante sin sesión llegue al formulario.
  const esRutaProtegida =
    request.nextUrl.pathname === "/piezas/nueva" ||
    /^\/piezas\/[^/]+\/editar$/.test(request.nextUrl.pathname);

  if (esRutaProtegida && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return supabaseResponse;
}
