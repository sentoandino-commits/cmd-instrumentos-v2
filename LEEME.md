# Fichero de instrumentos andinos — proyecto Next.js

Esta es la primera etapa de la migración: **catálogo público con búsqueda
instantánea vía URL + ficha individual con layout adaptativo** (barra
lateral compacta al ver un detalle). Login, papers/Drive, auditoría y
exportación quedan para las siguientes etapas, según el plan que revisamos.

## Antes de correrlo

1. Corre `supabase-migracion-busqueda.sql` en el **SQL Editor** de tu
   proyecto Supabase (el mismo de siempre — no se creó una base nueva).
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

## Qué falta (a propósito, para las próximas etapas)

- Formularios de creación/edición de fichas
- Biblioteca de papers con links de Drive protegidos
- Auditoría, relaciones entre piezas, exportación a PDF/Excel
- Fotos reales (por ahora la ficha muestra un espacio vacío)
