# 12 — Roadmap

> Tujuan: urutan implementasi dari frontend foundation sampai production. Frontend dibangun lebih dulu dengan mock data, baru disambungkan ke backend.

## Urutan yang Direkomendasikan

```
1. Frontend Foundation (UI shell + dashboard mock)   ✅
        │
        ▼
2. Database & Backend Foundation (Auth + RLS + RPC)
        │
        ▼
3. Members & Quota (UI + engine)
        │
        ▼
4. Scheduling & Booking (UI + engine)
        │
        ▼
5. Session Management & Coaching
        │
        ▼
6. Production Hardening
```

Migrations `supabase/migrations/001–015` dan `seed.sql` sudah dibuat dan divalidasi di Postgres lokal. RPC siap dipanggil client. Integrasi Auth & tenant masih tertunda (`frontend/15-supabase-integration.md`).

## Milestone 1 — Frontend Foundation ✅

- React + Vite + JavaScript + custom CSS.
- White-blue design system.
- Router, responsive sidebar, topbar.
- Dashboard PT dengan mock data.
- Smoke test 8/8 lolos, build & lint bersih.

**Output:** UI trainer siap dievaluasi sebelum integrasi backend. Detail: `frontend/plan.md`.

## Milestone 1b — Members Management UI ✅

- Member listing dengan search & filter.
- Add member modal, detail page, profile.
- Quota overview, history, edit & deactivate.
- Responsive mobile layout.

**Output:** modul member siap dipakai. Detail: `frontend/08-members-management.md`.

## Milestone 1c — Quota, Calendar, Coaching & Portal ✅

- Quota Management (F09), Calendar & Booking (F10).
- Session & Attendance (F11), Workout & Progress (F12).
- Member Portal mobile (F13), Notifications/Settings/Hardening (F14).
- Semua berjalan dalam demo mode dengan 15 route terverifikasi.

**Output:** seluruh UI trainer dan member fungsional tanpa backend.

## Milestone 2 — Database & Backend Integration

- RPC migrations `010–015` ✅ selesai.
- Auth, route guard, tenant context, realtime (F15) ✅ kode selesai.
- Cron expiry `016` ✅ selesai.
- Uji dengan project Supabase asli ⏳ tertunda (kredensial belum tersedia).
- RLS audit final ⏳ tertunda.

**Output kode:** login dan isolasi role siap; verifikasi live menyusul.

## Milestone 3 — Members & Quota

- Member CRUD + invitation (real data).
- Quota creation, adjustment, unlimited, expiry.
- Quota ledger.
- Quota Management UI.

**Output:** PT mengelola kuota member penuh.

## Milestone 4 — Scheduling & Booking

- Trainer availability.
- Calendar (day/week/month).
- Booking request, approve/reject.
- Double-booking prevention, reschedule & cancellation.
- Calendar & Booking UI.

**Output:** booking dipakai PT dan member.

## Milestone 5 — Session Management & Coaching

- Check-in, attendance, complete session, no-show.
- Cancellation policy.
- Workout programs, exercise library, training notes.
- Progress + charts.

**Output:** setiap sesi tercatat, kuota benar, coaching lengkap.

## Milestone 6 — SaaS Production

- Notifications & workspace settings.
- Member mobile portal.
- RLS final audit, testing, deployment, monitoring.

**Output:** siap multi-PT.

## Dependency

- `frontend/F01–F06` selesai sebelum Milestone 1b.
- `03` & `04` selesai sebelum `05`/`06`.
- `05` dan `06` sebelum `07`.
- `08` paralel dengan UI coaching.
- `09` RPC mengikuti engine yang sudah stabil.

## Modul Terkait

- Frontend: `frontend/plan.md`
- Semua modul `00`–`13`
- Eksekusi database: `supabase/migrations/`
