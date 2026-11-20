# F03 — Layout & Routing

> Tujuan: kerangka aplikasi yang dipakai semua halaman PT agar sidebar dan topbar tidak dibuat ulang.

## Struktur Folder

```
fitflow/
├── public/
│   ├── favicon.svg
│   └── logo.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ui/                 # komponen primitive (belum dipakai)
│   │   ├── layout/             # Sidebar, Topbar
│   │   └── dashboard/          # komponen khusus dashboard (belum dipakai)
│   ├── layouts/AppLayout.jsx
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
│   ├── lib/supabase.js
│   ├── data/mockDashboard.js
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── .env.example
└── package.json
```

Prinsip: setiap fitur punya tanggung jawab sendiri; logic tidak menumpuk di `App.jsx`. Belum ada `index.js` barrel — modul di-import langsung dari path relatif.

## `src/App.jsx`

Semua route PT berada di dalam `<Route element={<AppLayout />}>`, dengan `<Outlet />` sebagai tempat konten berubah.

| Path | Halaman |
|---|---|
| `/` | DashboardPage |
| `/members` | PlaceholderPage — Members |
| `/calendar` | PlaceholderPage — Calendar |
| `/quota` | PlaceholderPage — Quota Management |
| `/workouts` | PlaceholderPage — Workout Programs |
| `/progress` | PlaceholderPage — Progress Tracking |
| `/settings` | PlaceholderPage — Settings |
| `*` | `<Navigate to="/" replace />` |

`PlaceholderPage` menerima `title` dan `description`, dirender di dalam `.card.placeholder-card`.

## `src/layouts/AppLayout.jsx`

- State `sidebarOpen`, awalnya `false`.
- `.sidebar-backdrop` dirender hanya saat sidebar terbuka; klik menutup sidebar.
- `<Sidebar open={sidebarOpen} onClose={...} />`.
- `<Topbar onMenuClick={() => setSidebarOpen(true)} />`.
- `<main className="main-content"><Outlet /></main>`.

## `src/components/layout/Sidebar.jsx`

Navigasi didefinisikan sebagai array `navigation` dengan tiga grup:

| Grup | Item |
|---|---|
| WORKSPACE | Overview (`/`), Calendar (`/calendar`) |
| MANAGEMENT | Members (`/members`), Quota Management (`/quota`) |
| COACHING | Workout Programs (`/workouts`), Progress Tracking (`/progress`) |

- `NavLink` dengan `end` hanya pada path `/`.
- Class active: `nav-link--active` via callback `isActive`.
- Bagian bawah: Settings, profil `BK / Bintang Kuat / Personal Trainer`, versi `FITFLOW v0.1.0`.
- Workspace switcher: `B / My Workspace / Personal Training`.

Data workspace dan profil masih mock; nanti diambil dari Supabase sesuai tenant & user login.

## `src/components/layout/Topbar.jsx`

- Breadcrumb statis: `Workspace / Overview`.
- Search box dengan placeholder `Search anything...` dan kbd `⌘ K` (visual saja).
- Notifikasi dengan dot merah (visual saja).
- Profil `BK / Bintang / Trainer`.

Breadcrumb dan profil akan mengikuti route & sesi setelah backend terhubung.

## Modul Terkait

- Styles sidebar/topbar: `05-global-styles.md`
- Blueprint UI: `../10-ui-ux.md`
