# F14 — Notifications, Settings & Hardening

> Tujuan: melengkapi fitur pendukung dan memastikan aplikasi siap disambungkan ke backend.

## Scope

- Notifikasi: dropdown di topbar dengan daftar notifikasi dan mark-as-read.
- Settings: identitas workspace, profil trainer, status koneksi data (demo/live), area aksi sensitif.
- Error boundary untuk mencegah halaman kosong saat terjadi error render.
- Perbaikan aksesibilitas: aria-label, focus-visible, status via warna + teks.
- Pembersihan: tidak ada logic bisnis di `App.jsx`, semua aksi lewat `useWorkspace`.

## Routing

| Path | Halaman |
|---|---|
| `/settings` | `SettingsPage` |

## Komponen

| File | Tugas |
|---|---|
| `components/common/ErrorBoundary.jsx` | Fallback UI saat render error |
| `pages/trainer/SettingsPage.jsx` | Pengaturan workspace & profil |
| `components/layout/Topbar.jsx` | Dropdown notifikasi (diperbarui) |

## Hardening

- `src/lib/supabase.js` tidak membuat client jika env kosong/placeholder → demo mode aman.
- Semua mutasi demo mengubah state lokal; mode live memanggil RPC dan invalidate data.
- `quota_ledger` tidak pernah ditulis langsung dari client.
- Tombol approve/reject di dashboard lama sudah tidak dipakai; aksi kini lewat Calendar/Booking.

## Modul Terkait

- Security: `../04-security-rls.md`
- Decisions: `../13-decisions-risks.md`
- Verifikasi akhir: `06-testing-verification.md`
