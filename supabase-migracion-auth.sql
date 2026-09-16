-- =========================================================
-- Restringe el acceso por Google OAuth a una lista blanca de
-- correos. Quien no esté en la lista recibe un rechazo limpio
-- al intentar entrar — nunca se crea su cuenta, y a ti no te
-- llega ninguna notificación ni solicitud pendiente.
-- =========================================================

create table if not exists public.correos_autorizados (
    email text primary key,
    nombre text,
    created_at timestamptz default now()
);

-- Sin políticas RLS a propósito: nadie puede leer ni escribir
-- esta tabla vía la API pública (ni con sesión). Solo tú, desde
-- el SQL Editor, agregas o quitas correos.
alter table public.correos_autorizados enable row level security;

create or replace function public.verificar_correo_autorizado()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.correos_autorizados where email = new.email
  ) then
    raise exception 'No tienes acceso autorizado a este sistema. Contacta al administrador del proyecto.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_verificar_correo_autorizado on auth.users;
create trigger trg_verificar_correo_autorizado
before insert on auth.users
for each row execute function public.verificar_correo_autorizado();

-- Agrega aquí, desde ya, tu propio correo (el que vas a usar
-- para iniciar sesión con Google) y el de quien quieras probar
-- primero. Repite esta línea por cada investigador autorizado.
insert into public.correos_autorizados (email, nombre) values
    ('TU_CORREO_DE_GOOGLE_AQUI@gmail.com', 'Tu nombre')
on conflict (email) do nothing;
