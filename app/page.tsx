import { redirect } from "next/navigation";

// La portada del sitio ES el catálogo — sin pantalla de bienvenida
// que bloquee el rastreo de buscadores (ver plan de migración).
export default function Home() {
  redirect("/piezas");
}
