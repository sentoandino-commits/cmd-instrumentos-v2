# Fichero de instrumentos andinos — proyecto Next.js

Catálogo público con búsqueda instantánea vía URL + ficha individual con
layout adaptativo (barra lateral compacta al ver un detalle), login de
investigadores con Google, y formularios de creación/edición de piezas
("fichaje") con sus 5 pestañas principales. Papers/Drive real, auditoría,
relaciones entre piezas, fotos reales y exportación quedan para las
siguientes etapas.

## Antes de correrlo

1. Corre, en orden, en el **SQL Editor** de tu proyecto Supabase (el
   mismo de siempre — no se creó una base nueva):
   - `supabase-migracion-busqueda.sql`
   - `supabase-migracion-auth.sql`
   - `supabase-migracion-formularios.sql` (políticas de escritura —
     necesaria para poder crear/editar piezas)
   - `supabase-migracion-relaciones.sql` (tabla + políticas para
     "Piezas relacionadas" — necesaria para la pestaña Relaciones)
2. Copia `.env.local.example` a un archivo nuevo llamado `.env.local`
   (ya viene con tu Project URL y tu clave pública precargadas).

## Opción A — Ver el resultado sin instalar nada en tu computador (recomendado)

1. Crea un repositorio nuevo en GitHub y sube esta carpeta completa
   (excepto `node_modules`, que no existe todavía — no hay que excluir nada a mano).
2. Entra a [vercel.com](https://vercel.com), conecta tu cuenta de GitHub,
   e importa ese repositorio.
3. Cuando te pida las variables de entorno, pega el contenido de tu
   `.env.local` (las mismas dos líneas).
4. Vercel instala todo, construye el proyecto, y te da un link público
   en 1-2 minutos — ese link ya lo puedes mostrar al equipo.

## Opción B — Correrlo en tu computador (necesitas Node.js instalado)

```bash
npm install
npm run dev
```

Abre `http://localhost:3000` — te va a llevar directo a `/piezas`.

## Qué probar

- Escribe algo en el buscador (ej. "zampoña") — la URL cambia sola a
  `/piezas?q=zampoña`, sin recargar la página completa.
- Filtra por familia o cultura — también queda en la URL, así que puedes
  copiar y compartir ese link con alguien y va a ver exactamente lo mismo.
- Entra a una pieza — la búsqueda y la lista se compactan a la izquierda,
  y el detalle completo aparece a la derecha (el layout adaptativo que
  definimos juntos).
- Prueba con el celular / achicando la ventana del navegador — Tailwind
  ya trae la base responsiva, aunque el pulido fino queda para una etapa
  posterior.
- Con sesión iniciada: botón "+ Nueva pieza" en el catálogo, y "✎ editar"
  en cada tarjeta de una ficha (abre el formulario ya en esa pestaña).
  Prueba crear una pieza completa (las 6 pestañas), editarla, cambiarle
  la familia organológica, y eliminarla (soft delete — desaparece del
  catálogo pero sigue en la base).
- Con sesión iniciada: switch "📦 Piezas / 📚 Papers" en la barra lateral
  → entra a `/papers`, crea uno nuevo, y confirma que la cita se ve en la
  ficha de cualquier pieza que lo vincule. Sin sesión, esa misma cita se
  ve igual pero sin el link "Ver documento" (solo "🔒 solo
  investigadores"), y `/papers` redirige a `/login` si lo visitas
  directo por URL. Recuerda: el archivo real en Google Drive hay que
  compartirlo aparte con las cuentas del equipo — la protección de la
  app es solo para no mostrar el link, no reemplaza los permisos de
  Drive.

## Qué falta (a propósito, para las próximas etapas)

- Auditoría (bitácora de cambios), exportación a PDF/Excel
- Fotos y audio reales (por ahora la ficha muestra un espacio vacío/
  placeholder) — falta conectar Supabase Storage
