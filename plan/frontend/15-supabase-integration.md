# F15 — Supabase Integration

> Tujuan: menghubungkan frontend demo ke backend Supabase sungguhan (multi-tenant, auth, RPC, realtime).

## Status Implementasi

| Bagian | Status |
|---|---|
| Deteksi env & demo mode | ✅ selesai |
| `AuthProvider` + sesi Supabase | ✅ selesai |
| `tenant_members` → tenant aktif & role | ✅ selesai |
| Workspace switcher (multi-tenant) | ✅ selesai |
| Halaman `/login` | ✅ selesai |
| Route guard trainer & member | ✅ selesai |
| Logout topbar & portal | ✅ selesai |
| Realtime bookings + quota_ledger | ✅ selesai |
| Cron expiry (`016_cron_jobs.sql`) | ✅ selesai |
| Uji dengan kredensial Supabase asli | ⏳ belum (perlu project) |

Semua kode berjalan dalam demo mode tanpa kredensial. Saat `.env` diisi dengan nilai asli, `isSupabaseConfigured` menjadi `true` dan alur auth aktif otomatis.

## Prasyarat

- Project Supabase aktif.
- `.env.example` disalin ke `.env` dengan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` asli.
- Migrations `supabase/migrations/001–016` dan `supabase/seed.sql` dijalankan.

## Langkah

### 1. Environment & Client

`src/lib/supabase.js` sudah otomatis mendeteksi konfigurasi. Jika env valid, `isSupabaseConfigured = true` dan `DEMO_MODE = false`.

### 2. Auth

- Halaman `/login` (email + password) memakai `supabase.auth.signInWithPassword`.
- `onAuthStateChange` menyimpan sesi.
- Tampilkan demo mode jika Supabase tidak terkonfigurasi.

### 3. Tenant Context

- Ambil `tenant_members` untuk `auth.uid()`.
- Jika user memiliki satu tenant → pilih otomatis.
- Jika lebih dari satu → workspace switcher.
- Ganti `tenantId` statis di `WorkspaceContext` dengan tenant aktif.

### 4. Route Guard

| Role | Route |
|---|---|
| owner/trainer | `/`, `/members`, `/calendar`, `/quota`, `/attendance`, `/workouts`, `/progress`, `/settings` |
| member | `/m/*` |

Redirect ke `/login` jika belum login, ke `/m/home` jika role member mengakses `/app`.

### 5. Data & RPC

`src/services/api.js` sudah menyediakan `rpc()` dan `fetchWorkspaceData()`.

- `list_members`, `get_member_quotas`, `list_bookings` untuk load awal.
- Mutasi memakai RPC di `010–015`.
- `quota_ledger` tidak pernah ditulis langsung dari client.

### 6. Realtime

- Subscribe perubahan `bookings` dan `quota_ledger` untuk tenant aktif (sudah diimplementasikan di `WorkspaceContext`).
- Setiap event memanggil `refresh()` sehingga data dan saldo kuota langsung terbarui.
- Notifikasi dari perubahan status booking (belum).

### 7. Background Jobs

- `expire_pending_bookings()` — pg_cron setiap menit.
- `expire_quotas()` — pg_cron harian.
- Reminder H-1 / beberapa jam sebelum sesi (Edge Function).

## Verifikasi

- Login owner/trainer/member.
- Isolasi tenant: tenant A tidak melihat data tenant B.
- Booking lifecycle: request → approve → check-in → complete → saldo kuota benar.
- Cancel policy: refund sebelum 12 jam, hangus setelahnya.
- Realtime status tampil tanpa refresh.

## Modul Terkait

- Security: `../04-security-rls.md`
- RPC: `../09-backend-rpc.md`
- Hardening: `14-production-hardening.md`
