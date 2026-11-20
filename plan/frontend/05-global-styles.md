# F05 — Global Styles

> Tujuan: satu file `src/styles.css` sebagai sumber kebenaran design system dan seluruh komponen UI.

## Blok CSS

| Blok | Isi |
|---|---|
| `@import` + `:root` | Font Inter, design token, reset ringan |
| Reset | `box-sizing`, `body`, `button/input`, focus-visible, link |
| App shell | `.app-shell`, `.app-main`, `.main-content` |
| Sidebar | brand, workspace switcher, nav group, nav link, profil |
| Topbar | breadcrumb, search box, icon button, notifikasi, user |
| Page | `.page-container`, `.page-heading`, `.eyebrow` |
| Buttons | `.primary-button`, `.text-button` |
| Cards | `.card`, `.stats-grid`, `.stat-*` |
| Dashboard grid | `.dashboard-grid`, `.section-header` |
| Session list | `.session-item`, `.session-member`, `.session-time` |
| Badges | `.status-badge--confirmed`, `.status-badge--pending` |
| Quota | `.quota-list`, `.quota-progress-track`, `.quota-progress-fill` |
| Table | `.table-wrapper`, `.data-table`, `.table-actions` |
| Empty state | `.placeholder-card`, `.empty-state` |
| Responsive | media query 1200px, 768px, 380px |

## Catatan Cascade

`.icon-button` didefinisikan dengan `display: grid`. Aturan sembunyi untuk `.sidebar-close` dan `.mobile-menu-button` harus diletakkan **setelah** `.icon-button`, jika tidak keduanya akan tampil di desktop karena specificity yang sama dan urutan cascade yang kalah.

Media query `≤ 768px` menimpa dengan `display: grid`, sehingga tombol muncul hanya di mobile.

## Responsive

```css
@media (max-width: 1200px) { /* 2 stat card, grid 1 kolom */ }
@media (max-width: 768px)  { /* off-canvas sidebar, backdrop, topbar ringkas */ }
@media (max-width: 380px)  { /* stat card 1 kolom */ }
```

Detail lengkap ada di `01-design-system.md`.

## Aksesibilitas

- `button:focus-visible`, `a:focus-visible`, `input:focus-visible` memakai outline biru muda.
- Setiap ikon aksi memiliki `aria-label`.
- Status disampaikan lewat warna **dan** label teks.

## Modul Terkait

- Token: `01-design-system.md`
- Komponen: `03-layout-routing.md`, `04-dashboard.md`
