# F17 — Product Decisions & Live Smoke

> Tujuan: menutup tiga pertanyaan produk yang tersisa dan menyiapkan verifikasi Supabase live.

## Reschedule Member

- Member dapat mengubah jadwal booking `pending`/`confirmed` lewat portal.
- RPC `reschedule_booking` sudah mendukung aksi self (via `assert_self_or_staff`).
- UI: tombol **Reschedule** pada daftar booking di `/m/booking`, modal tanggal + jam.
- Durasi sesi dipertahankan dari booking awal.

## Durasi Sesi per Tenant

- Migration `021`: `tenants.default_session_minutes` (default 60) dan `tenants.max_session_minutes` (default 120).
- `assert_session_duration()` dipakai `assert_booking_slot` dan `get_available_slots` sebagai pengganti batas hardcoded 15–240 menit.
- `get_tenant_settings` / `update_tenant_settings` (owner only).
- UI: halaman `/settings` — field durasi default & maksimal, tombol Simpan.

## Progress Input Member

- Migration `022`: `record_progress` kini menerima caller member untuk dirinya sendiri.
- `trainer_id` diambil dari assignment aktif; fallback ke caller (owner/admin).
- UI: tombol **Tambah catatan** di `/m/progress`.

## Live Smoke Script

`fitflow/scripts/live-smoke.mjs` — verifikasi read-only terhadap project Supabase asli:

```bash
cp .env.example .env
# isi VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, LIVE_TEST_EMAIL, LIVE_TEST_PASSWORD
npm run smoke:live
```

Script melakukan login dan memanggil:

- `get_tenant_settings`, `list_members`, `list_bookings`
- `list_assignments`, `list_exercises`, `get_dashboard_stats`
- `get_member_quotas` untuk member pertama
- logout

Tidak ada mutasi data pada smoke script ini.

## Status

| Bagian | Status |
|---|---|
| SQL `021` + validasi durasi | ✅ selesai |
| SQL `022` + progress self | ✅ selesai |
| UI reschedule, settings, progress member | ✅ selesai |
| Live smoke script | ✅ dibuat (belum dijalankan tanpa kredensial) |

## Modul Terkait

- Integrasi: `15-supabase-integration.md`
- Audit: `../15-rls-audit.md`
- Backend: `../021_tenant_settings.sql`, `../022_member_progress.sql`
