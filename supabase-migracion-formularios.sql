-- =========================================================
-- Políticas de escritura para los formularios de creación y
-- edición de piezas. Corre esto en el SQL Editor de Supabase
-- ANTES de usar /piezas/nueva o /piezas/[id]/editar.
--
-- Hasta ahora la única política existente era de SELECT público
-- en `piezas` (supabase-migracion-busqueda.sql). Este script:
--   1. Habilita RLS explícitamente en cada tabla que toca el
--      formulario (por si alguna la tenía deshabilitada del
--      todo, no solo "sin política de insert").
--   2. Re-declara una política de SELECT público equivalente a
--      la que ya funciona hoy, para no romper la lectura
--      pública del catálogo.
--   3. Agrega políticas de INSERT/UPDATE/DELETE restringidas al
--      rol `authenticated` (cualquier investigador logueado).
--
-- Nota: `piezas` ya tiene su propia política de SELECT
-- ("publico_select_piezas"), no se toca. Para `piezas` solo se
-- agregan INSERT y UPDATE — a propósito NUNCA se agrega DELETE,
-- porque eliminar una pieza siempre debe ser un soft delete
-- (columna deleted_at) hecho desde la aplicación, nunca un
-- borrado físico de la fila.
-- =========================================================

-- ---- piezas (solo INSERT/UPDATE, sin DELETE a propósito) ----
alter table public.piezas enable row level security;

drop policy if exists "auth_insert_piezas" on public.piezas;
create policy "auth_insert_piezas" on public.piezas
  for insert to authenticated with check (true);

drop policy if exists "auth_update_piezas" on public.piezas;
create policy "auth_update_piezas" on public.piezas
  for update to authenticated using (true) with check (true);

-- ---- tablas hijas: SELECT público + INSERT/UPDATE/DELETE autenticado ----
do $$
declare
  tabla text;
  tablas text[] := array[
    'sitios', 'aerofonos', 'cordofonos', 'idiofonos', 'membranofonos',
    'procedencia', 'actores', 'pieza_actores', 'pieza_medidas',
    'papers', 'pieza_papers'
  ];
begin
  foreach tabla in array tablas loop
    execute format('alter table public.%I enable row level security;', tabla);

    execute format('drop policy if exists %I on public.%I;',
      'publico_select_' || tabla, tabla);
    execute format('create policy %I on public.%I for select using (true);',
      'publico_select_' || tabla, tabla);

    execute format('drop policy if exists %I on public.%I;',
      'auth_insert_' || tabla, tabla);
    execute format('create policy %I on public.%I for insert to authenticated with check (true);',
      'auth_insert_' || tabla, tabla);

    execute format('drop policy if exists %I on public.%I;',
      'auth_update_' || tabla, tabla);
    execute format('create policy %I on public.%I for update to authenticated using (true) with check (true);',
      'auth_update_' || tabla, tabla);

    execute format('drop policy if exists %I on public.%I;',
      'auth_delete_' || tabla, tabla);
    execute format('create policy %I on public.%I for delete to authenticated using (true);',
      'auth_delete_' || tabla, tabla);
  end loop;
end $$;

-- No hace falta política para `orden_cuerdas`: es una columna
-- jsonb dentro de `cordofonos`, ya cubierta por su política de
-- UPDATE de arriba.
