# FitFlow — Plan Index

Blueprint modular untuk **FitFlow**, SaaS Personal Trainer Management Platform (tanpa payment gateway).

## Urutan Baca

| # | Dokumen | Isi |
|---|---|---|
| 00 | [Product Vision](00-product-vision.md) | Visi, scope MVP, no-payment decision |
| 01 | [Architecture](01-architecture.md) | Multi-tenant, role, alur sistem |
| 02 | [Database ERD](02-database-erd.md) | Relasi tabel & alasan desain |
| 03 | [Database Schema](03-database-schema.md) | Constraint, composite FK, exclusion, index |
| 04 | [Security & RLS](04-security-rls.md) | Otorisasi tenant + matrix role |
| 05 | [Quota Engine](05-quota-engine.md) | Ledger, reserve/release/consumed |
| 06 | [Booking Engine](06-booking-engine.md) | Slot, approval, cancel, reschedule |
| 07 | [Session & Attendance](07-session-attendance.md) | Check-in, complete, no-show |
| 08 | [Coaching & Progress](08-coaching-progress.md) | Program, exercise, progress |
| 09 | [Backend RPC](09-backend-rpc.md) | Daftar RPC + transaction boundary |
| 10 | [UI/UX](10-ui-ux.md) | Dashboard PT + mobile member (white-blue) |
| 11 | [Frontend Structure](11-frontend-structure.md) | Stack JS + custom CSS, struktur `src/` |
| 12 | [Roadmap](12-roadmap.md) | Frontend-first, 6 milestone + dependency |
| 13 | [Decisions & Risks](13-decisions-risks.md) | Keputusan, risiko, pertanyaan terbuka |
| FE | [Frontend Blueprint](frontend/plan.md) | Index modul F01–F07 (implementasi UI) |

## Dependency

```
03 Schema ──► 04 RLS ──► 05 Quota ──► 06 Booking ──► 07 Session
                                             │
 08 Coaching ◄───────────────────────────────┘
 09 RPC mengikuti 04–07

 FE Frontend (mock data) ──► 10 UI ──► 11 Structure
         │
         └──► 12 Roadmap (frontend-first)
```

## Status Implementasi

| Area | Status |
|---|---|
| Dokumen plan | ✅ selesai |
| Migrations `supabase/migrations/001–009` | ✅ dibuat & divalidasi |
| RPC migrations `010–015` | ✅ dibuat & divalidasi |
| Cron migration `016` | ✅ dibuat & divalidasi |
| Seed `supabase/seed.sql` | ✅ dibuat & divalidasi |
| Frontend foundation (`fitflow/`) | ✅ selesai — smoke test 8/8 |
| Frontend modul F08–F14 | ✅ selesai |
| Verifikasi 15 route + build/lint | ✅ bersih |
| Auth, guard, tenant context, realtime (F15) | ✅ kode selesai |
| Uji auth dengan project Supabase asli | ⏳ belum (perlu kredensial) |
| Real data, quota & booking | ⏳ belum (client & RPC siap) |
| Member mobile portal | ✅ selesai (demo mode) |
| Edge Function / cron | ⏳ belum |

## Struktur Repo

```
StarsFit/
├── plan/                 # dokumen blueprint
│   ├── 00–13.md
│   └── frontend/         # modul F01–F15 + index
├── supabase/
│   ├── migrations/       # 001–016
│   └── seed.sql
└── fitflow/              # aplikasi React + Vite (JavaScript)
    ├── public/
    ├── src/
    ├── .env.example
    └── package.json
```
