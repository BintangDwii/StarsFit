# 15 — RLS & Isolation Audit

> Tujuan: hasil audit isolasi tenant setelah frontend dan backend selesai, beserta perbaikan yang sudah diterapkan.

## Ringkasan

Audit dilakukan terhadap `supabase/migrations/001–018`. Fokus: setiap tabel domain memiliki `tenant_id`, policy tidak bergantung pada join yang bisa salah, dan client tidak bisa menulis langsung ke tabel sensitif.

## Temuan & Perbaikan

| # | Temuan | Status | Tindakan |
|---|---|---|---|
| 1 | `attendances` tidak punya `tenant_id` | ✅ diperbaiki | `018_rls_hardening.sql` — tambah kolom, backfill dari `bookings`, `NOT NULL`, composite FK, policy baru |
| 2 | `program_days` tidak punya `tenant_id` | ✅ diperbaiki | `018` — denormalisasi dari `workout_programs`, FK komposit, policy baru |
| 3 | `workout_exercises` tidak punya `tenant_id` | ✅ diperbaiki | `018` — denormalisasi dari `program_days`, FK komposit, policy baru |
| 4 | `quota_ledger` bisa ditulis langsung | ✅ aman | Tidak ada policy `insert`/`update`; semua mutasi lewat RPC `SECURITY DEFINER` |
| 5 | Helper RLS memakai `SECURITY DEFINER` | ✅ aman | `search_path = ''` atau `public, pg_temp`, validasi `auth.uid()` eksplisit |
| 6 | Job expiry bisa dipanggil user biasa | ✅ aman | `expire_pending_bookings` / `expire_quotas` tidak di-`grant` ke `authenticated` |
| 7 | Notifikasi lintas user | ✅ aman | `017` — policy `user_id = auth.uid() AND is_tenant_member(tenant_id)` |
| 8 | Staff melihat semua member tenant | ⚠️ terbuka | Belum ada assignment trainer–member; sesuai keputusan di `13-decisions-risks.md` |
| 9 | `exercises` bersifat global | ⚠️ terbuka | Masih menjadi pertanyaan terbuka: global vs per tenant |
| 10 | Realtime pada `postgres_changes` | ✅ aman | Filter `tenant_id=eq.<uuid>` / `user_id=eq.<uuid>`; RLS tetap berlaku untuk channel authenticated |

## Verifikasi yang Perlu Dilakukan di Supabase

Jalankan setelah `.env` terisi dan migrations `001–018` aktif:

```sql
-- 1. Setiap tabel domain punya tenant_id NOT NULL
select table_name, column_name, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name in (
    'tenants', 'tenant_members', 'member_profiles', 'member_quotas',
    'quota_ledger', 'bookings', 'notifications', 'trainer_availability',
    'trainer_availability_exceptions', 'attendances', 'workout_programs',
    'program_days', 'workout_exercises', 'progress_records'
  )
  and column_name = 'tenant_id'
order by table_name;

-- 2. Tidak ada policy tulis untuk tabel sensitif
select tablename, cmd, policyname
from pg_policies
where schemaname = 'public'
  and tablename in ('quota_ledger', 'bookings', 'member_quotas')
  and cmd in ('insert', 'update', 'delete');

-- 3. Fungsi expiry tidak bisa dipanggil authenticated
select proname, grantee, privilege_type
from information_schema.role_routine_grants
where specific_schema = 'public'
  and routine_name in ('expire_pending_bookings', 'expire_quotas');
```

## Pengujian Isolasi Tenant

1. Buat tenant B dan member B dengan peran berbeda.
2. Login sebagai member tenant A → `list_members` hanya mengembalikan member tenant A.
3. Coba `select * from quota_ledger` sebagai member A → hanya ledger miliknya yang tampil.
4. Coba `update quota_ledger set quantity = 99` → harus ditolak.
5. Coba `approve_booking` booking tenant B dari user tenant A → harus error `TENANT_ACCESS_DENIED`.

## Modul Terkait

- RLS asli: `04-security-rls.md`
- Backend: `09-backend-rpc.md`
- Hardening SQL: `supabase/migrations/018_rls_hardening.sql`
- Notifikasi: `supabase/migrations/017_notifications.sql`
