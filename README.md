# WSM Action Tracker

Aplikasi internal untuk mencatat dan memonitor **action item dari Weekly Staff Meeting (WSM)** — menggantikan tracker Excel yang sebelumnya dikelola manual.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript 5**
- **Tailwind CSS v4** + komponen UI (Base UI / Radix)
- **Prisma** + **PostgreSQL**
- **next-auth v5** dengan **Microsoft Entra ID (Azure AD)** SSO
- Deploy: **Node.js + PM2** di server internal Windows

## Fitur

- Daftar **Action Item** dengan filter (status, department, priority, meeting, overdue) & pencarian
- Pengelompokan per **Meeting** (1 meeting → banyak action item)
- **Dashboard** statistik: total / open / closed / overdue, breakdown per priority & department, target terdekat
- **Auto-flag Overdue** (otomatis: belum closed & target date sudah lewat)
- **Master data** terkelola (Status, Priority, Department/PIC, Type) — khusus Admin
- Target date mendukung tanggal pasti **dan** teks bebas (mis. `Q2 2026`)
- PIC bisa lebih dari satu departemen/pihak

## Konfigurasi (.env.local)

Lihat `.env.example`. Variabel penting:

| Variabel | Keterangan |
|---|---|
| `DATABASE_URL` | Koneksi PostgreSQL |
| `AUTH_SECRET` | Secret next-auth (`npx auth secret`) |
| `AUTH_URL` | URL publik aplikasi di production (kosongkan saat dev) |
| `AZURE_AD_CLIENT_ID` / `AZURE_AD_CLIENT_SECRET` / `AZURE_AD_TENANT_ID` | Kredensial Entra ID SSO |
| `ALLOWED_EMAIL_DOMAIN` | Batasi login ke domain perusahaan (mis. `hcml.co.id`) |
| `ADMIN_EMAILS` | Daftar email (dipisah koma) yang jadi Admin |
| `DEV_AUTH_BYPASS` | `1` = login mock tanpa Azure (HANYA dev) |

> **Dev login bypass:** dengan `DEV_AUTH_BYPASS=1`, tombol login langsung masuk sebagai `DEV_AUTH_EMAIL`. Wajib dikosongkan di production.

## Menjalankan (development)

```bash
npm install
npx prisma migrate dev      # buat tabel
npx prisma db seed          # seed master + import docs/excelref.xlsx
npm run dev                 # http://localhost:3000
```

Script bantu: `npm run db:studio` (Prisma Studio), `npm run db:seed`, `npm run db:migrate`.

## Deploy (server internal Windows + PM2)

```bash
npm install
npm run build
npx prisma migrate deploy   # terapkan migrasi ke DB production
pm2 start ecosystem.config.js
pm2 save
```

Ubah `PORT` di `ecosystem.config.js` bila 3000 sudah dipakai aplikasi lain. Saat memakai SSO asli: isi variabel `AZURE_AD_*`, set `AUTH_URL` ke URL publik, dan **kosongkan** `DEV_AUTH_BYPASS`.

## Struktur

```
app/(auth)/login         Halaman login (Microsoft / dev)
app/(dashboard)/
  dashboard              Statistik & ringkasan
  actions                Tabel semua action item + filter + form
  meetings, meetings/[id]  Daftar & detail meeting
  settings               Kelola master data (Admin)
components/actions       Tabel, form (Sheet), filter, badge
components/dashboard     Kartu statistik & breakdown
components/settings      Pengelolaan master data
lib/
  data.ts                Query baca (actions, meetings, stats)
  actions/               Server actions (CRUD + master + stats)
  auth.ts, guard.ts      Auth & role guard
  format.ts              Overdue & format tanggal
prisma/
  schema.prisma          Skema database
  seed.ts                Seed master + import Excel
```
