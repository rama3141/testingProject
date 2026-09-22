import type { Student, BulkRow, BusinessCard } from "@/lib/types";

// Service layer tipis — semua akses Supabase Fitur 1 lewat sini (PRD §6).
// TODO(squad-1): isi dengan query Supabase (list/search/detail/bulk/rekap).

export async function listStudents(_q: string): Promise<Student[]> {
  throw new Error("TODO(squad-1): implement listStudents");
}

export async function previewBulk(_rows: BulkRow[]) {
  throw new Error("TODO(squad-1): implement previewBulk");
}

export type { Student, BulkRow, BusinessCard };