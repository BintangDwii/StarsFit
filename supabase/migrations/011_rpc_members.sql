-- 011_rpc_members.sql
-- CRUD member & daftar member per tenant.

create or replace function public.create_member(
  p_tenant uuid,
  p_email text,
  p_full_name text default null,
  p_role public.tenant_role default 'member',
  p_fitness_goal text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_staff public.tenant_members;
  v_user_id uuid;
  v_member_id uuid;
begin
  v_staff := public.assert_staff(p_tenant);

  if p_role = 'owner' then
    raise exception 'OWNER_NOT_ALLOWED' using errcode = 'P0001';
  end if;

  if p_email is null or length(trim(p_email)) = 0 then
    raise exception 'EMAIL_REQUIRED' using errcode = 'P0001';
  end if;

  select id into v_user_id
  from auth.users
  where lower(email) = lower(trim(p_email));

  if v_user_id is null then
    raise exception 'AUTH_USER_NOT_FOUND' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.tenant_members
    where tenant_id = p_tenant and user_id = v_user_id
  ) then
    raise exception 'ALREADY_MEMBER' using errcode = 'P0001';
  end if;

  insert into public.tenant_members (tenant_id, user_id, role, status)
  values (p_tenant, v_user_id, p_role, 'active')
  returning id into v_member_id;

  insert into public.member_profiles (
    tenant_id, tenant_member_id, fitness_goal, notes
  )
  values (
    p_tenant,
    v_member_id,
    p_fitness_goal,
    case when p_full_name is not null then 'Created by ' || coalesce(p_full_name, 'staff') else null end
  );

  return v_member_id;
end;
$$;

create or replace function public.update_member(
  p_tenant uuid,
  p_member uuid,
  p_status public.member_status default null,
  p_fitness_goal text default null,
  p_notes text default null,
  p_birth_date date default null,
  p_gender varchar default null,
  p_height_cm numeric default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller public.tenant_members;
begin
  v_caller := public.assert_self_or_staff(p_tenant, p_member);

  perform public.get_tenant_member(p_tenant, p_member);

  if v_caller.role = 'member' and p_status is not null and p_status <> v_caller.status then
    raise exception 'STATUS_STAFF_ONLY' using errcode = 'P0001';
  end if;

  if v_caller.role in ('owner', 'trainer') and p_status is not null then
    update public.tenant_members
    set status = p_status
    where tenant_id = p_tenant and id = p_member;
  end if;

  insert into public.member_profiles (
    tenant_id,
    tenant_member_id,
    fitness_goal,
    notes,
    birth_date,
    gender,
    height_cm
  )
  values (
    p_tenant,
    p_member,
    p_fitness_goal,
    p_notes,
    p_birth_date,
    p_gender,
    p_height_cm
  )
  on conflict (tenant_member_id) do update set
    fitness_goal = coalesce(excluded.fitness_goal, public.member_profiles.fitness_goal),
    notes = coalesce(excluded.notes, public.member_profiles.notes),
    birth_date = coalesce(excluded.birth_date, public.member_profiles.birth_date),
    gender = coalesce(excluded.gender, public.member_profiles.gender),
    height_cm = coalesce(excluded.height_cm, public.member_profiles.height_cm);
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
  order by tm.created_at desc;
end;
$$;

revoke all on function public.create_member(uuid, text, text, public.tenant_role, text) from public;
revoke all on function public.update_member(uuid, uuid, public.member_status, text, text, date, varchar, numeric) from public;
revoke all on function public.list_members(uuid) from public;

grant execute on function public.create_member(uuid, text, text, public.tenant_role, text) to authenticated;
grant execute on function public.update_member(uuid, uuid, public.member_status, text, text, date, varchar, numeric) to authenticated;
grant execute on function public.list_members(uuid) to authenticated;
