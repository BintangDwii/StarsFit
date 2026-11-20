# 01 — Architecture & Multi-Tenancy

> Tujuan: menjelaskan model tenant, role, dan alur sistem FitFlow.

## Model Multi-Tenant

```
FITFLOW SaaS
│
├── Tenant A — PT Bintang
│   ├── Member A1
│   ├── Member A2
│   └── Member A3
│
└── Tenant B — PT Andi
    ├── Member B1
    ├── Member B2
    └── Member B3
```

Aturan:

- Satu tenant = satu bisnis/workspace PT.
- Satu PT bisa memiliki banyak member.
- Satu member memiliki satu workspace PT aktif (MVP).
- Satu workspace bisa dikembangkan menjadi beberapa PT.
- Setiap tenant punya kalender, member, kuota, dan pengaturan sendiri.

## Identitas Pengguna

- Autentikasi memakai `auth.users` dari Supabase. Tidak membuat password sendiri.
- `tenant_members` adalah pusat identitas per-workspace: `(tenant_id, user_id, role, status)`.
- Seorang user dapat tergabung di beberapa tenant dengan role berbeda.
- `member_profiles` menyimpan data fitness yang terikat ke `tenant_member_id`.

## Role

| Role | Cakupan |
|---|---|
| `owner` | Mengelola workspace, member, trainer, quota, settings |
| `trainer` | Mengelola member yang ditugaskan, booking, attendance, program |
| `member` | Melihat data sendiri, request booking, melihat progress |

Otorisasi selalu berbasis **tenant + assignment**, bukan hanya role global.

## Arsitektur Aplikasi

```
PT Web Dashboard ─┐
                  ├── Supabase Auth
Member Mobile Web ┘
        │
        ▼
PostgreSQL + RLS
  ├── Tenant / Membership
  ├── Member Management
  ├── Quota Engine (+ Ledger)
  ├── Booking Engine
  ├── Workout Engine
  └── Progress Engine
        │
        ▼
Realtime Updates + Notifications
```

## Prinsip Backend

- Tahap awal tidak perlu Node.js server terpisah.
- Supabase Auth + RLS + Database Functions (RPC) + Edge Functions cukup.
- Operasi sensitif wajib RPC dengan transaction boundary dan validasi `auth.uid()`, role, tenant, dan relasi member.
- Client tidak boleh INSERT/UPDATE langsung ke `quota_ledger`.

## Isolasi Data (RLS)

- Semua tabel domain memiliki `tenant_id`.
- Helper `is_tenant_member(tenant)` menjadi dasar policy.
- Policy final memisahkan akses staff (owner/trainer) vs member (data sendiri).
- Detail: `04-security-rls.md`.

## Modul Terkait

- Database: `02-database-erd.md`, `03-database-schema.md`
- Security: `04-security-rls.md`
- Backend: `09-backend-rpc.md`
