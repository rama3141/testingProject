# PRD — All-in-One App: Internationalization & Partnership Program

> Status: v1 locked. Single repo `project-athena`. Next.js fullstack + Supabase Postgres.
> Tim: 2 squad mahasiswa paralel (Fitur 1 & Fitur 2). Durasi 5 bulan, iteratif release → test → improve.

## 1. Outcome & Why Now

Operasional divisi masih manual: (1) monitoring International Experience (IE) mahasiswa via Excel (flip FALSE→TRUE), (2) input kartu nama manual. App ini jadi satu pintu internal agar staf bisa bulk-update IE + lihat rekap tahunan, dan scan kartu nama via LLM + fallback manual, tanpa berhenti saat OCR gagal.

Sukses v1 = kedua fitur live dipakai staf di hosting + Supabase atas nama pemilik, bukan sekadar jalan di localhost.

## 2. User & Ownership

- **User:** staf internal divisi saja. 1 role flat (semua staf bisa semua fitur). Login email+password via Supabase Auth. **No RBAC di v1.**
- **Ownership (non-negotiable):** semua resource dibuat di akun pemilik — GitHub repo, Supabase project, hosting (Vercel), OpenRouter API key. Tim mahasiswa = role contributor/developer, di-revoke saat serah terima. Credential asli tidak pernah di-commit (pakai `.env.local`, contoh di `.env.example`).

## 3. Tech (locked)

- Next.js App Router + TypeScript, fullstack langsung ke Supabase (Route Handlers + service layer tipis di `lib/api-service/`). **Tanpa backend terpisah.**
- DB: Postgres via Supabase. Auth: Supabase Auth. File kartu nama: Supabase Storage.
- OCR: LLM via OpenRouter (model vision/multimodal, pilih yang termurah-cukup, mis. model kelas GPT-4o-mini / setara). API key di server-side only (`app/api/cards/ocr/route.ts`), tidak pernah ke client.
- Single repo, branching per fitur: `feature/ie-*` (squad 1), `feature/cards-*` (squad 2). Merge ke `main` via PR kecil + manual test checklist.

## 4. Fitur 1 — Student's International Experience Monitoring

### 4.1 Data

Master mahasiswa (tabel `students`, 1 row per NIM):

```
BinusianID, NIM (PK), BinusianBatch, StudentName, AcademicCareer,
ProgramCode, ProgramDepartment, ProgramDepartmentRealization,
FacultyCode, FacultySchool, FacultySchoolRealization,
CampusCode, Campus, GraduationStatus,
IEStatus (tahun berjalan), IEStatusWisuda (kumulatif)
```

Histori partisipasi (tabel `ie_participations`, append-only, tidak pernah dihapus):

```
id (uuid PK), nim (FK → students.nim), event_name, event_year (int),
campus_location, program_department, created_by (uuid auth), created_at
```

### 4.2 Aturan reset tahunan (locked)

- `IEStatus` = status tahun berjalan → di-reset ke FALSE tiap awal Januari (via job/manual button + konfirmasi). Data tahun lalu tetap aman di `ie_participations`.
- `IEStatusWisuda` = kumulatif selama kuliah → sekali TRUE tetap TRUE, tidak ikut reset.
- Query "ikut event apa tahun lalu?" = `SELECT * FROM ie_participations WHERE nim = ? ORDER BY event_year DESC`.

### 4.3 Flow

1. List/search/filter master (`/ie`): cari NIM/Nama, filter Prodi/Campus/Angkatan/IEStatus.
2. Detail per NIM: profil + histori `ie_participations` per tahun.
3. Single update: staf pilih event + tahun → insert ke `ie_participations` → set `IEStatus=TRUE` (tahun berjalan) + `IEStatusWisuda=TRUE`.
4. Bulk update: upload file (CSV/XLSX) dengan kolom wajib `NIM, Name, Program_Department, CampusLocation, EventName` (+ `EventYear` opsional, default tahun berjalan) → preview + validasi (NIM tidak dikenal, duplikat, kolom kosong) → dry-run → confirm insert. Gagal per-row dilaporkan tanpa menggagalkan seluruh batch.
5. Rekap: agregat per tahun / prodi / campus / event (count peserta, % IE TRUE).

### 4.4 DDL awal (Supabase SQL editor)

```sql
create table students (
  nim text primary key,
  binusian_id text, binusian_batch text, student_name text not null,
  academic_career text, program_code text,
  program_department text, program_department_realization text,
  faculty_code text, faculty_school text, faculty_school_realization text,
  campus_code text, campus text, graduation_status text,
  ie_status boolean not null default false,
  ie_status_wisuda boolean not null default false
);

create table ie_participations (
  id uuid primary key default gen_random_uuid(),
  nim text not null references students(nim) on delete restrict,
  event_name text not null, event_year int not null,
  campus_location text, program_department text,
  created_by uuid, created_at timestamptz not null default now(),
  unique (nim, event_name, event_year)
);
create index on ie_participations (nim, event_year desc);
```

## 5. Fitur 2 — OCR Name Card + CRUD Manual

### 5.1 Data (tabel `business_cards`)

```
id, full_name, job_title, company,
email1, email2, phone1, phone2,   -- dual field (locked)
address, notes,
image_url (Storage), ocr_raw_json (jsonb), ocr_status ('draft'|'verified'|'manual'),
created_by, created_at, updated_at
```

```sql
create table business_cards (
  id uuid primary key default gen_random_uuid(),
  full_name text not null, job_title text, company text,
  email1 text, email2 text, phone1 text, phone2 text,
  address text, notes text, image_url text,
  ocr_raw_json jsonb, ocr_status text not null default 'manual'
    check (ocr_status in ('draft','verified','manual')),
  created_by uuid, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 5.2 Flow (human-in-the-loop, locked)

- Flow A (OCR): upload foto (`/cards`) → `POST /api/cards/ocr` (server forward image ke OpenRouter, prompt ekstrak JSON) → form terisi sebagai `draft` → staf koreksi → Save → `verified` + simpan foto asli di Storage untuk audit.
- Flow B (fallback manual): tombol "Input manual" → form kosong → Save → `manual`. Flow B harus bisa dipakai penuh tanpa lewat OCR sama sekali (jaga operasional saat LLM gagal / gambar buram).
- CRUD penuh: list/search + edit + hapus (hapus konfirmasi). Hasil OCR selalu bisa diedit sebelum dan sesudah save.

### 5.3 Prompt LLM (acuan, bukan final)

> "Extract business card fields as JSON: full_name, job_title, company, email1, email2, phone1, phone2, address, notes. Majority language English. Return empty string for missing fields. No guessing."

## 6. Pages & API (placeholder scope)

- Pages: `/` (hub), `/ie` (list+search+bulk stub), `/cards` (upload+form stub). Detail (`/ie/[nim]`) boleh menyusul M2.
- API: `POST /api/ie/bulk` (terima CSV, validasi, dry-run), `POST /api/cards/ocr` (proxy OpenRouter, return JSON draft). Stub return TODO di placeholder, implementasi per squad.
- Service layer: `lib/api-service/ie.ts`, `lib/api-service/cards.ts` — semua akses Supabase lewat sini, jangan query langsung dari component.

## 7. Non-functional (v1 minimal)

- RLS Supabase: `authenticated` full access (flat role). Anon ditolak. Storage bucket `name-cards`: authenticated read/write.
- Validasi: bulk tolak row kosong/duplikat dengan pesan jelas; OCR gagal → error ramah + arahkan ke input manual (jangan crash).
- Audit: `created_by` = `auth.uid()` di setiap insert.
- `.env` wajib: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `OPENROUTER_API_KEY` (server only), `OPENROUTER_MODEL`.

## 8. SDLC 5 Bulan (iteratif)

- M1 (skeleton): repo jalan, auth login, schema + RLS terpasang, deploy preview di akun pemilik.
- M2 (IE single+history): list/detail/history/single flip.
- M3 (IE bulk+rekap): upload+preview+dry-run+rekap tahunan + reset tahunan.
- M4 (OCR+CRUD): upload→draft→verifikasi + manual fallback + Storage.
- M5 (hardening+UAT): bugfix, data real, SOP reset tahunan, serah terima + revoke akses tim.
- Setiap milestone: release → test oleh staf → improve. DoD = jalan di production + checklist manual hijau.

## 9. Acceptance Criteria v1

- [ ] Staf login, buka `/ie`, cari NIM, lihat histori tahun lalu.
- [ ] Bulk upload 1 file contoh → preview benar, row invalid ditolak dengan pesan, confirm insert menambah `ie_participations` + flip status.
- [ ] Reset tahunan: `IEStatus` kembali FALSE, histori + `IEStatusWisuda` utuh.
- [ ] Rekap per tahun/prodi/campus tampil angka benar.
- [ ] Upload 1 kartu nama → draft terisi → koreksi → save `verified` + foto tersimpan.
- [ ] Input manual tanpa OCR tersimpan sebagai `manual`; edit/hapus jalan.
- [ ] Semua resource di akun pemilik; tim di-revoke tanpa kehilangan akses/data.

## 10. Out of Scope (tegas)

No RBAC, no backend terpisah, no OCR full-otomatis tanpa koreksi, no multi-bahasa Asia penuh, no kolom baru di luar daftar §4–§5 tanpa amend PRD ini.

## 11. Backlog / Later (bukan v1)

TDD (`vitest` + contoh `parseBulkRow`, `normalizeCard`) + CI test gate + e2e — ditunda sampai M4/M5 saat tim stabil (keputusan pemilik: hindari beban kognitif awal).