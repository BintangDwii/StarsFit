-- 016_cron_jobs.sql
-- Job terjadwal untuk expiry booking & kuota.
-- Dijalankan hanya jika pg_cron tersedia (Supabase: aktifkan extension pg_cron).

do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;

    perform cron.unschedule('fitflow-expire-pending-bookings')
    where exists (
      select 1 from cron.job where jobname = 'fitflow-expire-pending-bookings'
    );

    perform cron.unschedule('fitflow-expire-quotas')
    where exists (
      select 1 from cron.job where jobname = 'fitflow-expire-quotas'
    );

    perform cron.schedule(
      'fitflow-expire-pending-bookings',
      '*/5 * * * *',
      $job$select public.expire_pending_bookings()$job$
    );

    perform cron.schedule(
      'fitflow-expire-quotas',
      '0 * * * *',
      $job$select public.expire_quotas()$job$
    );
  end if;
end
$$;
