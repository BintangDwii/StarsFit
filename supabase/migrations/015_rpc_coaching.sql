-- 015_rpc_coaching.sql
-- RPC program latihan & progress member.

create or replace function public.record_progress(
  p_tenant uuid,
  p_member uuid,
  p_weight_kg numeric default null,
  p_body_fat_percent numeric default null,
  p_waist_cm numeric default null,
  p_chest_cm numeric default null,
  p_arm_cm numeric default null,
  p_recorded_at timestamptz default now()
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_staff public.tenant_members;
  v_record_id uuid;
begin
  v_staff := public.assert_staff(p_tenant);
  perform public.get_tenant_member(p_tenant, p_member);

  insert into public.progress_records (
    tenant_id, member_id, trainer_id,
    weight_kg, body_fat_percent, waist_cm, chest_cm, arm_cm, recorded_at
  )
  values (
    p_tenant, p_member, v_staff.id,
    p_weight_kg, p_body_fat_percent, p_waist_cm, p_chest_cm, p_arm_cm,
    p_recorded_at
  )
  returning id into v_record_id;

  return v_record_id;
end;
$$;

create or replace function public.get_member_progress(
  p_tenant uuid,
  p_member uuid
)
returns table (
  id uuid,
  weight_kg numeric,
  body_fat_percent numeric,
  waist_cm numeric,
  chest_cm numeric,
  arm_cm numeric,
  recorded_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.assert_self_or_staff(p_tenant, p_member);

  return query
  select
    pr.id,
    pr.weight_kg,
    pr.body_fat_percent,
    pr.waist_cm,
    pr.chest_cm,
    pr.arm_cm,
    pr.recorded_at
  from public.progress_records pr
  where pr.tenant_id = p_tenant
    and pr.member_id = p_member
  order by pr.recorded_at desc;
end;
$$;

create or replace function public.create_workout_program(
  p_tenant uuid,
  p_member uuid,
  p_title text,
  p_start_date date default null,
  p_end_date date default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_staff public.tenant_members;
  v_program_id uuid;
begin
  v_staff := public.assert_staff(p_tenant);
  perform public.get_tenant_member(p_tenant, p_member);

  if p_title is null or length(trim(p_title)) = 0 then
    raise exception 'TITLE_REQUIRED' using errcode = 'P0001';
  end if;

  insert into public.workout_programs (
    tenant_id, trainer_id, member_id, title, start_date, end_date
  )
  values (
    p_tenant, v_staff.id, p_member, trim(p_title), p_start_date, p_end_date
  )
  returning id into v_program_id;

  return v_program_id;
end;
$$;

create or replace function public.get_workout_programs(
  p_tenant uuid,
  p_member uuid
)
returns table (
  id uuid,
  title text,
  start_date date,
  end_date date,
  is_active boolean,
  trainer_id uuid,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.assert_self_or_staff(p_tenant, p_member);

  return query
  select
    wp.id,
    wp.title::text,
    wp.start_date,
    wp.end_date,
    wp.is_active,
    wp.trainer_id,
    wp.created_at
  from public.workout_programs wp
  where wp.tenant_id = p_tenant
    and wp.member_id = p_member
  order by wp.created_at desc;
end;
$$;

create or replace function public.get_program_detail(p_program uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_tenant uuid;
  v_member uuid;
  v_result jsonb;
begin
  select tenant_id, member_id into v_tenant, v_member
  from public.workout_programs
  where id = p_program;

  if v_tenant is null then
    raise exception 'PROGRAM_NOT_FOUND' using errcode = 'P0001';
  end if;

  perform public.assert_self_or_staff(v_tenant, v_member);

  select jsonb_build_object(
    'id', wp.id,
    'title', wp.title,
    'startDate', wp.start_date,
    'endDate', wp.end_date,
    'isActive', wp.is_active,
    'days', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', pd.id,
          'dayName', pd.day_name,
          'exercises', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'id', we.id,
                'name', e.name,
                'muscleGroup', e.muscle_group,
                'sets', we.sets,
                'reps', we.reps,
                'targetWeight', we.target_weight,
                'restSeconds', we.rest_seconds
              )
            )
            from public.workout_exercises we
            join public.exercises e on e.id = we.exercise_id
            where we.program_day_id = pd.id
          ), '[]'::jsonb)
        )
        order by pd.id
      )
      from public.program_days pd
      where pd.program_id = wp.id
    ), '[]'::jsonb)
  )
  into v_result
  from public.workout_programs wp
  where wp.id = p_program;

  return v_result;
end;
$$;

revoke all on function public.record_progress(uuid, uuid, numeric, numeric, numeric, numeric, numeric, timestamptz) from public;
revoke all on function public.get_member_progress(uuid, uuid) from public;
revoke all on function public.create_workout_program(uuid, uuid, text, date, date) from public;
revoke all on function public.get_workout_programs(uuid, uuid) from public;
revoke all on function public.get_program_detail(uuid) from public;

grant execute on function public.record_progress(uuid, uuid, numeric, numeric, numeric, numeric, numeric, timestamptz) to authenticated;
grant execute on function public.get_member_progress(uuid, uuid) to authenticated;
grant execute on function public.create_workout_program(uuid, uuid, text, date, date) to authenticated;
grant execute on function public.get_workout_programs(uuid, uuid) to authenticated;
grant execute on function public.get_program_detail(uuid) to authenticated;
