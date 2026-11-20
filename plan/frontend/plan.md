# FitFlow — Frontend Plan Index

Blueprint modular untuk implementasi **frontend FitFlow** (white & blue). Dijalankan lebih dulu sebagai fondasi UI sebelum integrasi Supabase.

## Urutan Baca

| # | Dokumen | Isi |
|---|---|---|
| F01 | [Design System](01-design-system.md) | Design token, karakter visual, dua layout |
| F02 | [Project Setup](02-project-setup.md) | Vite, dependencies, `index.html`, `main.jsx`, env |
| F03 | [Layout & Routing](03-layout-routing.md) | Struktur folder, router, sidebar, topbar |
| F04 | [Dashboard PT](04-dashboard.md) | Mock data + halaman Overview |
| F05 | [Global Styles](05-global-styles.md) | `styles.css`, komponen, responsive |
| F06 | [Testing & Verification](06-testing-verification.md) | Smoke test, build, screenshot |
| F07 | [Status & Next](07-status-next.md) | Implemented/belum, milestone berikutnya |
| F08 | [Members Management](08-members-management.md) | Listing, filter, modal, detail bertab |
| F09 | [Quota Management](09-quota-management.md) | Available/reserved/consumed, ledger, adjust |
| F10 | [Calendar & Booking](10-calendar-booking.md) | Day/week/month, approval, aksi sesi |
| F11 | [Session & Attendance](11-session-attendance.md) | Check-in, complete, no-show |
| F12 | [Workout & Progress](12-coaching-progress.md) | Program latihan, grafik, catatan progress |
| F13 | [Member Portal](13-member-portal.md) | Bottom nav, booking, workout, progress |
| F14 | [Hardening](14-production-hardening.md) | Notifikasi, settings, error boundary, font lokal |
| F15 | [Supabase Integration](15-supabase-integration.md) | Auth, tenant, guard, realtime, cron |

## Dependency

```
F01 Design ──► F02 Setup ──► F03 Layout ──► F04 Dashboard
                                    │
                                    ▼
                                F05 Styles
                                    │
                                    ▼
                           F06 Testing ──► F07 Status/Next
                                    │
                                    ▼
F08 Members ──► F09 Quota ──► F10 Calendar ──► F11 Attendance
                                                      │
                                                      ▼
                                                F12 Coaching
                                                      │
                                                      ▼
                                                F13 Portal
                                                      │
                                                      ▼
                                                F14 Hardening
```

F02–F05 membentuk fondasi UI. F08–F13 membangun seluruh modul bisnis. F14 merapikan fitur pendukung dan verifikasi akhir.

## Status Implementasi

| Area | Status |
|---|---|
| Scaffold Vite + dependencies | ✅ selesai |
| F01–F05 source code | ✅ selesai |
| RPC migrations 010–015 + validasi Postgres | ✅ selesai |
| F06 smoke test (8/8) | ✅ selesai |
| F08–F14 semua modul | ✅ selesai |
| Verifikasi 15 route (9 trainer + 6 portal) | ✅ selesai, 0 error |
| Build + lint | ✅ bersih |
| Screenshot desktop, mobile, portal | ✅ selesai |
| Supabase auth / multi-tenant | ⏳ belum (sesuai roadmap utama) |
| Real member data & transaksi | ⏳ belum (client siap, env belum diisi) |
| F15 integrasi Supabase | ✅ kode selesai (uji live perlu kredensial) |

## Hubungan dengan Plan Utama

Dokumen ini menggantikan detail UI lama di `../10-ui-ux.md`, `../11-frontend-structure.md`, dan urutan `../12-roadmap.md` yang sudah diselaraskan dengan keputusan **frontend-first + white-blue + JavaScript**.

Engine backend tetap mengikuti modul `../00-product-vision.md` sampai `../09-backend-rpc.md`.

## Lokasi Kode

Kode aplikasi ada di `fitflow/` (root repo `StarsFit/`), bukan di folder `plan/`.

```
StarsFit/
├── plan/                  # dokumen blueprint (termasuk frontend/)
├── supabase/              # migrations + seed
└── fitflow/               # aplikasi React + Vite
    ├── public/
    ├── src/
    ├── .env.example
    └── package.json
```

## Prinsip

- Data dashboard adalah **mock data**, tidak dipresentasikan sebagai data database.
- Tombol approve/reject booking sengaja **non-aktif** sampai RPC transaksi quota tersedia.
- Setiap fitur baru wajib punya modul plan sendiri sebelum diimplementasikan.
