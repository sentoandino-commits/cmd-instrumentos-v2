-- =========================================================
-- Auditoría de cambios en "piezas": bitácora append-only
-- (patrón CIDOC-CRM "evento"). Corre esto en el SQL Editor de
-- Supabase antes de usar el historial de cambios en la ficha.
--
-- Nadie puede insertar/editar/borrar audit_log directamente vía
-- la API — solo lo escribe el trigger de abajo, que corre con
-- privilegios de su dueño (security definer), no del usuario que
-- guarda la pieza. Los investigadores logueados solo pueden LEER.
-- =========================================================

-- Si la tabla ya existía (del prototipo anterior, con otra
-- estructura), "create table if not exists" no la habría tocado y
-- las columnas de abajo no existirían. Por eso se agrega cada
-- columna por separado con ADD COLUMN IF NOT EXISTS: funciona igual
-- si la tabla es nueva o si ya existía con columnas de más.
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid()
);

alter table public.audit_log add column if not exists table_name text;
alter table public.audit_log add column if not exists record_id uuid;
alter table public.audit_log add column if not exists accion text; -- 'INSERT' | 'UPDATE' | 'DELETE'
alter table public.audit_log add column if not exists old_data jsonb;
alter table public.audit_log add column if not exists new_data jsonb;
alter table public.audit_log add column if not exists changed_by uuid;
alter table public.audit_log add column if not exists changed_by_email text;
alter table public.audit_log add column if not exists changed_at timestamptz not null default now();

create index if not exists idx_audit_log_tabla_registro
  on public.audit_log(table_name, record_id, changed_at desc);

alter table public.audit_log enable row level security;
grant select on public.audit_log to authenticated;

drop policy if exists "auth_select_audit_log" on public.audit_log;
create policy "auth_select_audit_log" on public.audit_log
  for select to authenticated using (true);

-- Función genérica: registra INSERT/UPDATE/DELETE de la fila que
-- dispare el trigger, junto con el correo de quien hizo el cambio
-- (leído de auth.users vía auth.uid(), igual que el trigger de
-- correos_autorizados).
create or replace function public.registrar_auditoria()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  correo text;
begin
  select email into correo from auth.users where id = auth.uid();

  if (tg_op = 'DELETE') then
    insert into public.audit_log (table_name, record_id, accion, old_data, changed_by, changed_by_email)
    values (tg_table_name, old.id, tg_op, to_jsonb(old), auth.uid(), correo);
    return old;
  elsif (tg_op = 'UPDATE') then
    insert into public.audit_log (table_name, record_id, accion, old_data, new_data, changed_by, changed_by_email)
    values (tg_table_name, new.id, tg_op, to_jsonb(old), to_jsonb(new), auth.uid(), correo);
    return new;
  else
    insert into public.audit_log (table_name, record_id, accion, new_data, changed_by, changed_by_email)
    values (tg_table_name, new.id, tg_op, to_jsonb(new), auth.uid(), correo);
    return new;
  end if;
end;
$$;

drop trigger if exists trg_auditoria_piezas on public.piezas;
create trigger trg_auditoria_piezas
  after insert or update or delete on public.piezas
  for each row execute function public.registrar_auditoria();
