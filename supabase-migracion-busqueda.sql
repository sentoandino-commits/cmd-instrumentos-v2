-- Corre esto en el SQL Editor de tu proyecto Supabase existente
-- (el mismo que ya usa el prototipo HTML — no es una base nueva).
-- Agrega una columna de búsqueda de texto completo en español,
-- que es lo que usa /app/piezas/page.tsx para el buscador.

alter table piezas add column if not exists busqueda tsvector
  generated always as (
    to_tsvector(
      'spanish',
      coalesce(nombre_generico, '') || ' ' ||
      coalesce(materiales, '') || ' ' ||
      coalesce(observaciones, '') || ' ' ||
      coalesce(cultura_etnia, '')
    )
  ) stored;

create index if not exists idx_piezas_busqueda on piezas using gin(busqueda);

-- Política de lectura pública (si no la tienes ya activada desde
-- politicas_definitivas_login.sql, esto permite que el catálogo
-- público funcione mientras decides activar el login real)
drop policy if exists "publico_select_piezas" on piezas;
create policy "publico_select_piezas" on piezas for select using (deleted_at is null);
