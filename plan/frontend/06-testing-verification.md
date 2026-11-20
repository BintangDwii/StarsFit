# F06 — Testing & Verification

> Tujuan: memastikan frontend berjalan bersih sebelum milestone berikutnya.

## Perintah

```bash
npm run dev       # http://localhost:5173
npm run build     # menghasilkan dist/
npm run preview   # memeriksa hasil build
npm run lint      # oxlint
```

## Smoke Test — Hasil: 8/8 lolos

| # | Pengujian | Hasil |
|---|---|---|
| 1 | Dashboard muncul tanpa error | ✅ lolos |
| 2 | Sidebar aktif saat memilih menu | ✅ lolos (`nav-link--active`) |
| 3 | Navigasi Overview, Members, Calendar, Quota | ✅ lolos (h1 sesuai route) |
| 4 | Sidebar buka/tutup di mobile | ✅ lolos (menu, backdrop, close button) |
| 5 | Empat statistik tampil | ✅ lolos (`.stat-card` = 4) |
| 6 | Tabel pending booking dapat di-scroll | ✅ lolos (`overflow-x: auto`) |
| 7 | Tidak ada horizontal overflow | ✅ lolos (desktop & mobile) |
| 8 | Console browser tanpa error React | ✅ lolos (0 error) |

## Verifikasi Tambahan

| Pemeriksaan | Hasil |
|---|---|
| `npm run build` | ✅ berhasil, `dist/` dibuat |
| `npm run lint` | ✅ tidak ada finding |
| Session item render | 4 |
| Baris pending booking | 3 |
| Route fallback `*` | redirect ke `/` |

## Verifikasi Semua Route (F08–F14)

| Grup | Route | Hasil |
|---|---|---|
| Trainer | `/`, `/members`, `/members/:id`, `/calendar`, `/quota`, `/attendance`, `/workouts`, `/progress`, `/settings` | ✅ 9/9 render, h1 sesuai, tanpa overflow |
| Portal | `/m`, `/m/home`, `/m/booking`, `/m/workout`, `/m/progress`, `/m/profile` | ✅ 6/6 render, bottom nav 5 item, tanpa overflow |
| Notifikasi | Dropdown topbar | ✅ 3notifikasi tampil |
| Console | Semua route desktop + mobile | ✅ 0 error |

Interaksi yang diuji: tambah member (8→9 baris), navigasi detail, tab Quota, pergantian view kalender (week 7 kolom, month 42 sel, day 14 jam), approve booking (3→2 pending), checkbox booking portal.

## Backend

- 15 migrasi SQL (001–015) + `seed.sql` berhasil dijalankan di Postgres 15 lokal.
- RPC lifecycle test: request → approve (idempotent) → check-in → complete → ledger reservation -1 + consumed 0, saldo 12→11 tanpa double deduction.

## Metode Screenshot

Playwright dengan Firefox pinned build:

- Desktop: `screenshot-dashboard-final.png`, `screenshot-members.png`, `screenshot-member-detail.png`, `screenshot-calendar.png`, `screenshot-quota.png`
- Mobile: `screenshot-mobile.png`, `screenshot-mobile-sidebar.png`
- Portal: `screenshot-portal-home.png`, `screenshot-portal-booking.png`

Screenshot disimpan di root project `fitflow/` untuk evaluasi visual, bukan artefak produksi.

## Verifikasi F15 (Auth & Realtime)

| Pemeriksaan | Hasil |
|---|---|
| `/login` dalam demo mode | ✅ tampil, tanpa error, tombol masuk ke dashboard |
| Guard trainer/member | ✅ demo mode langsung lolos; live mode siap redirect |
| Semua 15 route setelah wiring auth | ✅ tetap render, 0 console error |
| Migrasi `016_cron_jobs.sql` | ✅ lolos di Postgres 15 lokal |
| Build & lint | ✅ bersih, tidak ada chunk warning |

Perbaikan saat verifikasi: dollar-quoting bertabrakan dengan `DO $$`, diganti `$job$` pada argumen `cron.schedule`.

## Perbaikan Hardening

- Font Inter di-bundle lokal via `@fontsource/inter` → tidak ada request CDN dan tidak ada error font di console.
- Error boundary membungkus seluruh aplikasi.
- `PlaceholderPage` dihapus karena semua route sudah terimplementasi.

## Catatan Perbaikan

Saat screenshot pertama ditemukan tombol close sidebar dan hamburger mobile tampil di desktop akibat urutan cascade CSS. Perbaikan diterapkan di `05-global-styles.md` dan diverifikasi ulang dengan smoke test + screenshot.

## Modul Terkait

- Source: `fitflow/src/`
- Roadmap: `07-status-next.md`, `../12-roadmap.md`
