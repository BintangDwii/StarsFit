-- 017_notifications.sql
-- Notifikasi in-app + reminder otomatis H-1 dan 2 jam sebelum sesi.

create table public.notifications (
  id uuid primary key default gen_random_uuid(),

  tenant_id uuid not null
    references public.tenants(id) on delete cascade,
  user_id uuid not null
    references auth.users(id) on delete cascade,
  booking_id uuid,

  type varchar(50) not null,
  title varchar(200) not null,
  body text not null,
  read_at timestamptz,

  created_at timestamptz not null default now(),

  unique (booking_id, type),

  foreign key (tenant_id, booking_id)
    references public.bookings (tenant_id, id) on delete cascade
);

create index idx_notifications_user
  on public.notifications(user_id, created_at desc);

create index idx_notifications_tenant
  on public.notifications(tenant_id);

alter table public.notifications enable row level security;

create policy "notifications_read_own"
  on public.notifications for select
  using (
    user_id = (select auth.uid())
    and public.is_tenant_member(tenant_id)
  );

create or replace function public.get_my_notifications(p_tenant uuid)
returns table (
  id uuid,
  type varchar,
  title varchar,
  body text,
  read_at timestamptz,
  booking_id uuid,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller public.tenant_members;
begin
  v_caller := public.assert_tenant_access(p_tenant);

  return query
  select
    n.id,
    n.type::varchar,
    n.title::varchar,
    n.body,
    n.read_at,
    n.booking_id,
    n.created_at
  from public.notifications n
  where n.tenant_id = p_tenant
    and n.user_id = v_caller.user_id
  order by n.created_at desc
  limit 50;
end;
$$;

create or replace function public.mark_notification_read(p_notification uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.notifications
  set read_at = now()
  where id = p_notification
    and user_id = auth.uid();

  if not found then
    raise exception 'NOTIFICATION_NOT_FOUND' using errcode = 'P0001';
  end if;
end;
$$;

create or replace function public.mark_all_notifications_read(p_tenant uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller public.tenant_members;
begin
  v_caller := public.assert_tenant_access(p_tenant);

  update public.notifications
  set read_at = now()
  where tenant_id = p_tenant
    and user_id = v_caller.user_id
    and read_at is null;
end;
$$;

create or replace function public.create_session_reminders()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count integer;
begin
  insert into public.notifications (
    tenant_id, user_id, booking_id, type, title, body
  )
  select
    b.tenant_id,
    tm.user_id,
    b.id,
    case
      when b.start_at between now() + interval '23 hours' and now() + interval '25 hours'
        then 'reminder_24h'
      else 'reminder_2h'
    end,
    case
      when b.start_at between now() + interval '23 hours' and now() + interval '25 hours'
        then 'Pengingat latihan besok'
      else 'Pengingat latihan 2 jam lagi'
    end,
    'Sesi latihan Anda pada ' || to_char(
      b.start_at at time zone coalesce(t.timezone, 'UTC'),
      'DD Mon YYYY HH24:MI'
    ) || ' menunggu Anda.'
  from public.bookings b
  join public.tenant_members tm on tm.id = b.member_id
  left join public.tenants t on t.id = b.tenant_id
  where b.status in ('confirmed', 'checked_in')
    and (
      b.start_at between now() + interval '23 hours' and now() + interval '25 hours'
      or b.start_at between now() + interval '1 hour' and now() + interval '3 hours'
    )
  on conflict (booking_id, type) do nothing;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.get_my_notifications(uuid) from public;
revoke all on function public.mark_notification_read(uuid) from public;
revoke all on function public.mark_all_notifications_read(uuid) from public;
revoke all on function public.create_session_reminders() from public;

grant execute on function public.get_my_notifications(uuid) to authenticated;
grant execute on function public.mark_notification_read(uuid) to authenticated;
grant execute on function public.mark_all_notifications_read(uuid) to authenticated;

do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;

    perform cron.unschedule('fitflow-session-reminders')
    where exists (
      select 1 from cron.job where jobname = 'fitflow-session-reminders'
    );

    perform cron.schedule(
      'fitflow-session-reminders',
      '*/15 * * * *',
      $job$select public.create_session_reminders()$job$
    );
  end if;

  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function public.create_session_reminders() to service_role;
  end if;
end
$$;
