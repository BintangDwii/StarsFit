-- 020_exercise_library.sql
-- Exercise library dengan scope global (tenant_id null) atau tenant-specific.

alter table public.exercises add column tenant_id uuid
  references public.tenants(id) on delete cascade;

create index idx_exercises_tenant on public.exercises(tenant_id);

drop policy if exists "exercises_read_authenticated" on public.exercises;

create policy "exercises_read_scope"
  on public.exercises for select
  using (
    tenant_id is null
    or public.is_tenant_member(tenant_id)
  );

create or replace function public.list_exercises(p_tenant uuid)
returns table (
  id uuid,
  name text,
  muscle_group text,
  equipment text,
  description text,
  is_global boolean
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.assert_tenant_access(p_tenant);

  return query
  select
    e.id,
    e.name::text,
    e.muscle_group::text,
    e.equipment::text,
    e.description::text,
    (e.tenant_id is null) as is_global
  from public.exercises e
  where e.tenant_id is null or e.tenant_id = p_tenant
  order by e.name;
end;
$$;

create or replace function public.create_exercise(
  p_tenant uuid,
  p_name text,
  p_muscle_group text default null,
  p_equipment text default null,
  p_description text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_staff public.tenant_members;
  v_exercise_id uuid;
begin
  v_staff := public.assert_staff(p_tenant);

  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'NAME_REQUIRED' using errcode = 'P0001';
  end if;

  insert into public.exercises (
    tenant_id, name, muscle_group, equipment, description
  )
  values (
    p_tenant,
    trim(p_name),
    p_muscle_group,
    p_equipment,
    p_description
  )
  returning id into v_exercise_id;

  return v_exercise_id;
end;
$$;

revoke all on function public.list_exercises(uuid) from public;
revoke all on function public.create_exercise(uuid, text, text, text, text) from public;

grant execute on function public.list_exercises(uuid) to authenticated;
grant execute on function public.create_exercise(uuid, text, text, text, text) to authenticated;
