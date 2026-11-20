# F01 — Design System

> Tujuan: fondasi visual FitFlow — clean white, blue accent, kualitas SaaS fitness profesional.

## Design Direction

| Aspek | Keputusan |
|---|---|
| Tema | White & blue, terinspirasi dashboard gym modern |
| Background | Dominan putih dengan surface abu sangat terang |
| Aksen | Blue sebagai identitas, tombol primer, active state |
| Card | Border tipis, bukan shadow berlebihan |
| Radius | 12–16px |
| Typography | Inter, modern dan mudah dibaca |
| Densitas | Bersih, tidak terlalu banyak warna |
| Responsive | Desktop, tablet, mobile |

Referensi visual: Fitness Management SaaS Platform / CRM Dashboard Gym (Behance).

## Design Token

| Elemen | Warna | Pemakaian |
|---|---|---|
| Primary blue | `#2563EB` | Tombol, active nav, icon utama |
| Dark blue | `#173B70` | Brand name, teks identitas |
| Light blue | `#EFF6FF` | Active nav background, stat icon |
| Background | `#F7F9FC` | Halaman |
| Surface | `#FFFFFF` | Card, sidebar, topbar |
| Border | `#E5EAF2` | Garis card & divider |
| Primary text | `#172B4D` | Heading, nilai statistik |
| Secondary text | `#718096` | Deskripsi, label |
| Success | `#16A36A` | Status confirmed, trend positif |
| Warning | `#E99A24` | Pending, low quota |
| Danger | `#DC5252` | Attention, reject |

Token implementation ada di `:root` pada `src/styles.css` (`--primary`, `--background`, `--surface`, `--border`, `--text-primary`, `--success`, `--warning`, `--danger`, `--radius-md`, `--radius-lg`, `--sidebar-width`).

Catatan: `--primary-dark` memakai `#1D4ED8` untuk hover state; `#173B70` dipakai khusus brand name.

## Dua Layout

### 1. Trainer Dashboard (desktop-first)

- Sidebar putih tetap, lebar 250px.
- Topbar dengan breadcrumb, search, notifikasi, profil.
- Konten: statistik, tabel, kalender, kartu.
- Navigasi: Overview, Calendar, Members, Quota Management, Workout Programs, Progress Tracking, Settings.

### 2. Member Portal (mobile-first, belum diimplementasikan)

- Bottom navigation: Home, Booking, Workout, Progress, Profile.
- Fokus: sisa kuota, booking, program latihan, progress.
- Akan dibangun setelah UI trainer selesai.

## Responsive

| Breakpoint | Perilaku |
|---|---|
| `> 1200px` | 4 stat card, grid dashboard 2 kolom |
| `≤ 1200px` | 2 stat card, grid dashboard 1 kolom |
| `≤ 768px` | Sidebar jadi off-canvas + backdrop, topbar ringkas |
| `≤ 380px` | Stat card 1 kolom |

## Modul Terkait

- Styles: `05-global-styles.md`
- UI lama yang disupersede: `../10-ui-ux.md`
