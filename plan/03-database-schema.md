# 03 — Database Schema & Constraints

> Tujuan: sumber kebenaran desain schema. DDL executable ada di `supabase/migrations/001_*.sql` … `009_*.sql`. Dokumen ini menjelaskan keputusan, bukan menggandakan seluruh SQL.

## Extensions & Enum

- `pgcrypto` — `gen_random_uuid()`.
- `btree_gist` — exclusion constraint anti double-booking.
- Enum: `tenant_role`, `member_status`, `quota_status`, `booking_status`, `quota_event`.

## Urutan Migrasi

| File | Isi |
|---|---|
| `001_extensions.sql` | Extensions + enum types |
| `002_tenants.sql` | `tenants`, `tenant_members` |
| `003_members.sql` | `member_profiles` |
| `004_quota.sql` | `member_quotas`, `quota_ledger` |
| `005_booking.sql` | `bookings`, composite FK, exclusion constraints, index |
| `006_attendance.sql` | `trainer_availability`, exceptions, `attendances` |
| `007_workout.sql` | `exercises`, `workout_programs`, `program_days`, `workout_exercises` |
| `008_progress.sql` | `progress_records` |
| `009_rls.sql` | Helper functions + RLS policies |

Catatan: `quota_ledger.booking_id` dibuat tanpa FK di `004`, lalu FK ke `bookings` ditambahkan di `005` karena `bookings` belum ada saat `004` berjalan.

## Aturan Integritas Kunci

### 1. Composite key untuk isolasi tenant
Semua tabel domain menyimpan `tenant_id`. Tabel yang menjadi target FK komposit wajib punya `UNIQUE (tenant_id, id)`:

- `tenant_members (tenant_id, id)`
- `member_quotas (tenant_id, id)`
- `bookings (tenant_id, id)`

Ini memungkinkan FK `(tenant_id, fk_id)` sehingga referensi tidak bisa menyeberang tenant.

### 2. Booking hanya boleh memakai kuota milik member yang sama

```sql
ALTER TABLE member_quotas
  ADD CONSTRAINT quota_member_identity UNIQUE (tenant_id, id, member_id);

ALTER TABLE bookings
  ADD CONSTRAINT booking_quota_owner
  FOREIGN KEY (tenant_id, quota_id, member_id)
  REFERENCES member_quotas (tenant_id, id, member_id);
```

FK `(tenant_id, quota_id)` yang sederhana **diganti** oleh constraint komposit ini.

### 3. Append-only quota ledger

- `quota_ledger` tidak boleh diedit/dihapus client.
- Koreksi dilakukan dengan entry `adjustment` baru.
- Tidak ada policy INSERT/UPDATE/DELETE untuk client; perubahan hanya via RPC.

### 4. CHECK pada `quota_ledger`

| event_type | quantity |
|---|---|
| `reservation` | `-1` |
| `release` | `1` |
| `consumed` | `0` |
| `grant` | `> 0` |
| `adjustment` | `<> 0` |

### 5. Anti double-booking (exclusion constraint)

```sql
ALTER TABLE bookings
  ADD CONSTRAINT prevent_trainer_overlap
  EXCLUDE USING gist (
    tenant_id WITH =,
    trainer_id WITH =,
    tstzrange(start_at, end_at, '[)') WITH &&
  )
  WHERE (status IN ('pending', 'confirmed', 'checked_in'));

ALTER TABLE bookings
  ADD CONSTRAINT prevent_member_overlap
  EXCLUDE USING gist (
    tenant_id WITH =,
    member_id WITH =,
    tstzrange(start_at, end_at, '[)') WITH &&
  )
  WHERE (status IN ('pending', 'confirmed', 'checked_in'));
```

### 6. Idempotency ledger

`UNIQUE (booking_id, event_type)` mencegah reservasi/release/consumed ganda untuk booking yang sama.

### 7. Index

- `idx_quota_ledger_quota (quota_id, created_at DESC)`
- `idx_bookings_trainer_time (trainer_id, start_at)`

## Batasan yang Diketahui

- `attendances`, `program_days`, `workout_exercises` mengikuti blueprint dan belum membawa `tenant_id`; integritas tenant dijaga lewat join. Lihat `13-decisions-risks.md`.
- RLS baca dasar perlu dilengkapi policy self-scoped; sudah diimplementasikan di `04-security-rls.md`.
- Trigger validasi role (trainer vs member) dan job expiry kuota belum termasuk migrasi awal; direncanakan di `09-backend-rpc.md`.

## Modul Terkait

- ERD: `02-database-erd.md`
- RLS: `04-security-rls.md`
- Quota: `05-quota-engine.md`
