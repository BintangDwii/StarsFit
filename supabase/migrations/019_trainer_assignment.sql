-- 019_trainer_assignment.sql
-- Assignment trainer–member dan pembatasan akses trainer hanya ke member yang ditugaskan.

create table public.trainer_assignments (
  id uuid primary key default gen_random_uuid(),

  tenant_id uuid not null references public.tenants(id) on delete cascade,
  trainer_id uuid not null,
  member_id uuid not null,

  created_at timestamptz not null default now(),

  unique (tenant_id, trainer_id, member_id),

  foreign key (tenant_id, trainer_id)
    references public.tenant_members (tenant_id, id) on delete cascade,
  foreign key (tenant_id, member_id)
    references public.tenant_members (tenant_id, id) on delete cascade
);

create index idx_trainer_assignments_trainer
  on public.trainer_assignments(trainer_id);
create index idx_trainer_assignments_member
  on public.trainer_assignments(member_id);

alter table public.trainer_assignments enable row level security;

create policy "trainer_assignments_read_staff"
  on public.trainer_assignments for select
  using (public.is_tenant_staff(tenant_id));

create or replace function public.can_view_member(
  p_tenant uuid,
  p_member uuid
)
returns boolean
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller public.tenant_members;
begin
  v_caller := public.assert_tenant_access(p_tenant);

  if v_caller.id = p_member or v_caller.role = 'owner' then
    return true;
  end if;

  if v_caller.role = 'trainer' then
    return exists (
      select 1
      from public.trainer_assignments ta
      where ta.tenant_id = p_tenant
        and ta.trainer_id = v_caller.id
        and ta.member_id = p_member
    );
  end if;

  return false;
end;
$$;

create or replace function public.assert_self_or_staff(
  p_tenant uuid,
  p_member uuid
)
returns public.tenant_members
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller public.tenant_members;
begin
  v_caller := public.assert_tenant_access(p_tenant);

  if public.can_view_member(p_tenant, p_member) then
    return v_caller;
  end if;

  raise exception 'ACCESS_DENIED' using errcode = 'P0001';
end;
$$;

create or replace function public.list_members(p_tenant uuid)
returns table (
  id uuid,
  user_id uuid,
  email text,
  full_name text,
  role public.tenant_role,
  status public.member_status,
  fitness_goal text,
  birth_date date,
  gender varchar,
  height_cm numeric,
  notes text,
  joined_at timestamptz
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
    tm.id,
    tm.user_id,
    u.email::text,
    coalesce(u.raw_user_meta_data ->> 'full_name', u.email::text) as full_name,
    tm.role,
    tm.status,
    mp.fitness_goal::text,
    mp.birth_date,
    mp.gender::varchar,
    mp.height_cm,
    mp.notes::text,
    tm.created_at
  from public.tenant_members tm
  join auth.users u on u.id = tm.user_id
  left join public.member_profiles mp on mp.tenant_member_id = tm.id
  where tm.tenant_id = p_tenant
    and public.can_view_member(p_tenant, tm.id)
  order by tm.created_at desc;
end;
$$;

create or replace function public.assign_trainer(
  p_tenant uuid,
  p_trainer uuid,
  p_member uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_trainer public.tenant_members;
begin
  perform public.assert_staff(p_tenant);
  v_trainer := public.get_tenant_member(p_tenant, p_trainer);

  if v_trainer.role not in ('owner', 'trainer') then
    raise exception 'INVALID_TRAINER' using errcode = 'P0001';
  end if;

  perform public.get_tenant_member(p_tenant, p_member);

  insert into public.trainer_assignments (tenant_id, trainer_id, member_id)
  values (p_tenant, p_trainer, p_member)
  on conflict (tenant_id, trainer_id, member_id) do nothing;
end;
$$;

create or replace function public.unassign_trainer(
  p_tenant uuid,
  p_trainer uuid,
  p_member uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.assert_staff(p_tenant);

  delete from public.trainer_assignments
  where tenant_id = p_tenant
    and trainer_id = p_trainer
    and member_id = p_member;
end;
$$;

create or replace function public.list_assignments(p_tenant uuid)
returns table (
  id uuid,
  trainer_id uuid,
  member_id uuid,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.assert_tenant_access(p_tenant);

  return query
  select ta.id, ta.trainer_id, ta.member_id, ta.created_at
  from public.trainer_assignments ta
  where ta.tenant_id = p_tenant
  order by ta.created_at desc;
end;
$$;

revoke all on function public.can_view_member(uuid, uuid) from public;
revoke all on function public.assert_self_or_staff(uuid, uuid) from public;
revoke all on function public.list_members(uuid) from public;
revoke all on function public.assign_trainer(uuid, uuid, uuid) from public;
revoke all on function public.unassign_trainer(uuid, uuid, uuid) from public;
revoke all on function public.list_assignments(uuid) from public;

grant execute on function public.can_view_member(uuid, uuid) to authenticated;
grant execute on function public.assert_self_or_staff(uuid, uuid) to authenticated;
grant execute on function public.list_members(uuid) to authenticated;
grant execute on function public.assign_trainer(uuid, uuid, uuid) to authenticated;
grant execute on function public.unassign_trainer(uuid, uuid, uuid) to authenticated;
grant execute on function public.list_assignments(uuid) to authenticated;
