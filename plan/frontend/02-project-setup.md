# F02 — Project Setup

> Tujuan: scaffolding React + Vite dengan dependency yang dibutuhkan frontend dan backend di masa depan.

## Perintah

```bash
npm create vite@latest fitflow -- --template react
cd fitflow
npm install
npm install react-router-dom lucide-react
npm install @supabase/supabase-js @tanstack/react-query zod
npm run dev
```

Dev server: `http://localhost:5173`.

## Stack

| Technology | Kegunaan | Status |
|---|---|---|
| React + Vite | Frontend | Digunakan |
| JavaScript | Bahasa project | Digunakan |
| React Router | Routing | Digunakan |
| Custom CSS | Design system | Digunakan |
| Lucide React | Icon | Digunakan |
| TanStack Query | Server state | Provider aktif, belum dipakai query |
| Supabase JS | Backend integration | Client disiapkan, belum dipanggil |
| Zod | Validasi data | Terpasang, belum dipakai |

Keputusan: **JavaScript + custom CSS**, bukan TypeScript + Tailwind (sesuai spek frontend-first).

## `index.html`

- `lang="id"`.
- `theme-color` putih.
- Meta description: `FitFlow - Personal Training Management Platform`.
- Title: `FitFlow | Personal Training`.
- Favicon: `/favicon.svg`.
- Mount point: `#root`, entry `/src/main.jsx`.

## `src/main.jsx`

- `BrowserRouter` untuk navigasi.
- `QueryClientProvider` dengan konfigurasi:

```js
{
  staleTime: 30_000,
  retry: 1,
  refetchOnWindowFocus: false,
}
```

- `React.StrictMode` untuk deteksi masalah development.
- Import `./styles.css` sebagai design system global.

## `src/lib/supabase.js`

Client Supabase dibuat dari `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`. File ini belum di-import komponen mana pun, sehingga tidak dieksekusi selama frontend masih memakai mock data.

## `.env.example`

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Jangan pernah commit file `.env` yang berisi kredensial asli.

## Struktur Awal

Folder kosong sudah disiapkan untuk `components/ui`, `components/dashboard`, `pages/{members,calendar,quota,workouts,progress}`, `features/{auth,members,scheduling,quota}`, dan `assets`.

## Modul Terkait

- Routing: `03-layout-routing.md`
- Arsitektur lama (TS + Tailwind) yang disupersede: `../11-frontend-structure.md`
