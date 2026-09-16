import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/piezas`);
    }
  }

  // Llega aquí tanto si Google falló como si el trigger de la
  // base de datos rechazó el correo por no estar autorizado.
  return NextResponse.redirect(`${origin}/login?error=no_autorizado`);
}
