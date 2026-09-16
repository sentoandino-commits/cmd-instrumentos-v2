-- =========================================================
-- Tabla de relaciones entre piezas ("mismo hallazgo/lote",
-- "posible duplicado", "fragmento/parte de", "relacionada").
-- Corre esto en el SQL Editor de Supabase antes de usar la
-- pestaña "Relaciones" del formulario.
--
-- La relación se guarda en un solo sentido (pieza_id_a → pieza_id_b)
-- pero se consulta y se muestra desde cualquiera de las dos piezas
-- por igual — ver lib/queries.ts. Al guardar desde el formulario de
-- una pieza, todas sus relaciones (venga del lado A o B) se
-- reescriben con esa pieza como pieza_id_a; para los 4 tipos que
-- maneja el formulario esto no cambia el significado de la relación.
-- =========================================================

create table if not exists public.relaciones_piezas (
  id uuid primary key default gen_random_uuid(),
  pieza_id_a uuid not null references public.piezas(id) on delete cascade,
  pieza_id_b uuid not null references public.piezas(id) on delete cascade,
  tipo_relacion text not null,
  notas text,
  created_at timestamptz default now(),
  constraint relaciones_piezas_no_self check (pieza_id_a <> pieza_id_b)
);

create index if not exists idx_relaciones_piezas_a on public.relaciones_piezas(pieza_id_a);
create index if not exists idx_relaciones_piezas_b on public.relaciones_piezas(pieza_id_b);

alter table public.relaciones_piezas enable row level security;
grant select, insert, update, delete on public.relaciones_piezas to authenticated;
grant select on public.relaciones_piezas to anon;

drop policy if exists "publico_select_relaciones_piezas" on public.relaciones_piezas;
create policy "publico_select_relaciones_piezas" on public.relaciones_piezas
  for select using (true);

drop policy if exists "auth_insert_relaciones_piezas" on public.relaciones_piezas;
create policy "auth_insert_relaciones_piezas" on public.relaciones_piezas
  for insert to authenticated with check (true);

drop policy if exists "auth_update_relaciones_piezas" on public.relaciones_piezas;
create policy "auth_update_relaciones_piezas" on public.relaciones_piezas
  for update to authenticated using (true) with check (true);

drop policy if exists "auth_delete_relaciones_piezas" on public.relaciones_piezas;
create policy "auth_delete_relaciones_piezas" on public.relaciones_piezas
  for delete to authenticated using (true);
