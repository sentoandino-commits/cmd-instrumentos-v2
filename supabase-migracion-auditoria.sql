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

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid not null,
  accion text not null, -- 'INSERT' | 'UPDATE' | 'DELETE'
  old_data jsonb,
  new_data jsonb,
  changed_by uuid,
  changed_by_email text,
  changed_at timestamptz not null default now()
);

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
