# Panduan untuk AI Agent — WSM Action Tracker

Aplikasi internal pencatatan & monitoring action item dari Weekly Staff Meeting (menggantikan tracker Excel). Dibangun dari UI starter internal (navy/gold theme).

## Stack

- Next.js 16 App Router + React 19 + TypeScript
- Tailwind CSS v4 (`@import "tailwindcss"`, bukan `tailwind.config.js`)
- Prisma + PostgreSQL
- next-auth v5 — provider Microsoft Entra ID (Azure AD), dengan dev bypass via `DEV_AUTH_BYPASS=1`
- Komponen UI: Base UI / Radix (`components/ui/`), banyak UI di-hand-style dengan Tailwind + inline style

## Model data (prisma/schema.prisma)

- `Meeting` 1 → N `ActionItem`
- `ActionItem`: presentingDept (Department), pics (many-to-many Department), type, priority, status; `targetDate` (Date) + `targetDateText` (teks fuzzy seperti "Q2 2026"); `userUpdate` & `remarks` (Text)
- Master: `Department` (dipakai untuk presenting dept & PIC), `ActionType`, `Priority`, `Status` (punya `isClosed`)
- `Overdue` TIDAK disimpan — dihitung: belum closed && `targetDate` < hari ini (`isOverdue` di `lib/format.ts`)

## Konvensi penting

- Gunakan `<TitleBar title=... />` di setiap halaman (lihat `components/layout/`)
- Query baca di `lib/data.ts`; mutasi (server actions) di `lib/actions/*.ts` — selalu `revalidatePath`
- Role guard: `requireUser` / `requireAdmin` di `lib/guard.ts`. Role berasal dari `ADMIN_EMAILS` (env), bukan DB
- `lib/auth.ts` HARUS tetap Prisma-free (dipakai middleware `proxy.ts` yang edge) — jangan import prisma di sana
- Prisma client singleton: `lib/prisma.ts`
- Icon: `lucide-react`; merge class: `cn()` dari `lib/utils.ts`

## Jangan diubah tanpa instruksi

- `components/layout/SidebarContext.tsx`, `app/(dashboard)/layout.tsx`, `app/(auth)/layout.tsx`
- `proxy.ts` (middleware auth)

## Database & seed

- Dev DB lokal: lihat `.env` / `.env.local`
- `npx prisma migrate dev` lalu `npx prisma db seed` (seed master + import `docs/excelref.xlsx`)
- Seed bersifat idempotent: master di-upsert, meeting/action di-wipe lalu re-import

## Menambah komponen UI

UI di-style manual mengikuti tema (navy `#2B4162`, gold `#D7B377`). Komponen Base UI ada di `components/ui/` (`button`, `sheet`, `tooltip`). Untuk dialog/form gunakan `Sheet` (slide-over).
