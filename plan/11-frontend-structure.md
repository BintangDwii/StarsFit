# 11 — Frontend Structure

> Tujuan: struktur project React + Vite + JavaScript + custom CSS yang feature-based.

## Stack

| Technology | Kegunaan |
|---|---|
| React + Vite | Frontend |
| JavaScript | Bahasa project |
| React Router | Routing |
| Custom CSS | Design system (`src/styles.css`) |
| Lucide React | Icon |
| TanStack Query | Server state (provider aktif) |
| Supabase JS | Backend integration (client disiapkan) |
| Zod | Validasi data (terpasang) |

Keputusan ini menggantikan rencana lama TypeScript + Tailwind. Detail: `frontend/02-project-setup.md`.

## Lokasi

Kode aplikasi ada di `fitflow/`, bukan di folder `plan/`.

## Struktur

```
fitflow/
├── public/
│   ├── favicon.svg
│   └── logo.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ui/                 # primitive (belum dipakai)
│   │   ├── layout/             # Sidebar, Topbar
│   │   └── dashboard/          # komponen dashboard (belum dipakai)
│   ├── layouts/
│   │   └── AppLayout.jsx
│   ├── pages/
│   │   ├── trainer/DashboardPage.jsx
│   │   ├── members/
│   │   ├── calendar/
│   │   ├── quota/
│   │   ├── workouts/
│   │   └── progress/
│   ├── features/
│   │   ├── auth/
│   │   ├── members/
│   │   ├── scheduling/
│   │   └── quota/
│   ├── lib/
│   │   └── supabase.js
│   ├── data/
│   │   └── mockDashboard.js
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── .env.example
└── package.json
```

Prinsip: setiap fitur punya tanggung jawab sendiri; logic tidak menumpuk di `App.jsx`.

## Konvensi Feature

Setiap folder feature akan berisi:

```
feature/
├── api/          # query & RPC
├── components/   # komponen khusus feature
├── hooks/        # state & data hooks
└── pages/        # route pages
```

Belum diisi sampai modul terkait diimplementasikan.

## Routing (saat ini)

```
/                    DashboardPage
/members             PlaceholderPage
/calendar            PlaceholderPage
/quota               PlaceholderPage
/workouts            PlaceholderPage
/progress            PlaceholderPage
/settings            PlaceholderPage
*                    Navigate to "/"
```

Rencana route member (belum diimplementasikan): `/m/home`, `/m/booking`, `/m/workout`, `/m/progress`, `/m/profile`.

## Query Client

```js
{
  staleTime: 30_000,
  retry: 1,
  refetchOnWindowFocus: false,
}
```

## Data Flow (rencana)

Component → hook → service (`supabase.rpc(...)`) → cache/state.

- Mutasi lewat RPC; setelah sukses invalidate query terkait.
- Realtime subscribe untuk status booking & notifikasi.
- Jangan memanggil `supabase.from('quota_ledger').insert(...)` dari client.
- Saat ini komponen membaca `src/data/mockDashboard.js`, bukan Supabase.

## Mapping Fitur → Modul Plan

| Feature | Plan |
|---|---|
| design system | `frontend/01-design-system.md` |
| setup & providers | `frontend/02-project-setup.md` |
| layout & router | `frontend/03-layout-routing.md` |
| dashboard | `frontend/04-dashboard.md` |
| styles | `frontend/05-global-styles.md` |
| authentication | `04-security-rls.md` |
| workspace | `01-architecture.md` |
| members | `frontend/07-status-next.md`, `10-ui-ux.md` |
| quota | `05-quota-engine.md` |
| scheduling | `06-booking-engine.md` |
| attendance | `07-session-attendance.md` |
| workouts / progress | `08-coaching-progress.md` |

## Modul Terkait

- UI: `10-ui-ux.md`
- Roadmap: `12-roadmap.md`
- Frontend index: `frontend/plan.md`
