# 00 — Product Vision & Scope

> Tujuan: mendefinisikan apa itu FitFlow, untuk siapa, dan batas MVP tanpa payment gateway.

## Ringkasan Produk

FitFlow adalah **SaaS Personal Trainer Management Platform**. Fokusnya mengelola hubungan PT dengan member: kuota sesi, booking, jadwal, attendance, dan progress.

| Aspek | Keputusan |
|---|---|
| Product | FitFlow |
| Business model | SaaS (multi-tenant) |
| Platform | Web PT (desktop/tablet) + mobile-friendly member |
| Authentication | Supabase Auth |
| Database | PostgreSQL (Supabase) |
| Scheduling | Member booking + PT approval |
| Quota | Manual quota management |
| Payment gateway | **Tidak ada** |
| Financial transaction | **Tidak ada** |
| Session management | Per booking + attendance |
| Design | Premium dark navy + lime |

## Prinsip Inti

1. **Tanpa payment gateway.** Tidak ada Stripe/Midtrans/Xendit, invoice, atau transaksi bank.
2. **Kuota tetap dicatat sebagai transaksi internal.** Perubahan kuota harus auditable melalui `quota_ledger`, bukan overwrite saldo.
3. **Tenant isolation.** Data Tenant A tidak boleh diakses Tenant B.
4. **Server-authoritative.** Operasi sensitif (quota, booking, attendance) lewat RPC dengan validasi, bukan query client langsung.

## Yang Masuk MVP

- Member management (CRUD + invitation)
- Manual session quota + ledger + unlimited + expiry
- Booking request, approval/rejection, reschedule, cancellation
- Attendance, check-in, complete session, no-show
- Workout program + exercise library
- Progress tracking (weight, body fat, measurements)
- Notifikasi dasar & workspace settings

## Yang Tidak Masuk MVP

- Payment gateway
- Invoice / transaksi member
- Automatic subscription billing
- Integrasi bank

## Catatan Bisnis

FitFlow tetap sah sebagai SaaS walau belum ada pembayaran otomatis. Monetisasi platform ke PT dapat dikelola manual atau ditambahkan belakangan — berbeda dari pembayaran latihan member ke PT.

## Definisi Sukses MVP

- PT dapat membuat workspace, mengundang member, dan mengatur kuota.
- Member dapat request booking dan melihat status realtime.
- Setiap perubahan kuota punya jejak ledger yang bisa diaudit.
- Tidak ada kebocoran data antar tenant.

## Modul Terkait

- Arsitektur: `01-architecture.md`
- Quota: `05-quota-engine.md`
- Booking: `06-booking-engine.md`
- Roadmap: `12-roadmap.md`
