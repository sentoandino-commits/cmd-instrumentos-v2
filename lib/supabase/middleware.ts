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
  //
  // /papers/*: a diferencia del catálogo de piezas (público a
  // propósito, para SEO), la biblioteca completa de papers es
  // exclusiva de investigadores — toda la ruta se protege, no solo
  // el botón de crear, para que tampoco se pueda llegar por URL
  // directa sin sesión.
  const esRutaProtegida =
    request.nextUrl.pathname === "/piezas/nueva" ||
    /^\/piezas\/[^/]+\/editar$/.test(request.nextUrl.pathname) ||
    request.nextUrl.pathname === "/papers" ||
    request.nextUrl.pathname.startsWith("/papers/");

  if (esRutaProtegida && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return supabaseResponse;
}
