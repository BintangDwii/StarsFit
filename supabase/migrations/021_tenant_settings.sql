-- 021_tenant_settings.sql
-- Durasi sesi dapat dikonfigurasi per tenant (owner only).

alter table public.tenants
  add column default_session_minutes integer not null default 60;

alter table public.tenants
  add column max_session_minutes integer not null default 120;

alter table public.tenants
  add constraint tenants_session_duration_check
  check (
    default_session_minutes between 15 and 240
    and max_session_minutes between default_session_minutes and 240
  );

create or replace function public.get_tenant_settings(p_tenant uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller public.tenant_members;
  v_result jsonb;
begin
  v_caller := public.assert_tenant_access(p_tenant);

  select jsonb_build_object(
    'timezone', t.timezone,
    'defaultSessionMinutes', t.default_session_minutes,
    'maxSessionMinutes', t.max_session_minutes,
    'role', v_caller.role,
    'workspaceName', t.name
  )
  into v_result
  from public.tenants t
  where t.id = p_tenant;

  return v_result;
end;
$$;

create or replace function public.update_tenant_settings(
  p_tenant uuid,
  p_default_session_minutes integer,
  p_max_session_minutes integer,
  p_timezone text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller public.tenant_members;
begin
  v_caller := public.assert_tenant_access(p_tenant);

  if v_caller.role <> 'owner' then
    raise exception 'OWNER_ONLY' using errcode = 'P0001';
  end if;

  if p_default_session_minutes < 15 or p_default_session_minutes > 240 then
    raise exception 'INVALID_DEFAULT_DURATION' using errcode = 'P0001';
  end if;

  if p_max_session_minutes < p_default_session_minutes
    or p_max_session_minutes > 240 then
    raise exception 'INVALID_MAX_DURATION' using errcode = 'P0001';
  end if;

  update public.tenants
  set default_session_minutes = p_default_session_minutes,
      max_session_minutes = p_max_session_minutes,
      timezone = coalesce(nullif(trim(p_timezone), ''), timezone)
  where id = p_tenant;
end;
$$;

create or replace function public.assert_session_duration(
  p_tenant uuid,
  p_minutes integer
)
returns void
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_max integer;
begin
  perform public.assert_tenant_access(p_tenant);

  select max_session_minutes into v_max
  from public.tenants
  where id = p_tenant;

  if p_minutes is null or p_minutes < 15 or p_minutes > coalesce(v_max, 120) then
    raise exception 'INVALID_DURATION' using errcode = 'P0001';
  end if;
end;
$$;

revoke all on function public.get_tenant_settings(uuid) from public;
revoke all on function public.update_tenant_settings(uuid, integer, integer, text) from public;
revoke all on function public.assert_session_duration(uuid, integer) from public;

grant execute on function public.get_tenant_settings(uuid) to authenticated;
grant execute on function public.update_tenant_settings(uuid, integer, integer, text) to authenticated;
grant execute on function public.assert_session_duration(uuid, integer) to authenticated;
