import type { BusinessCard, CardDraft } from "@/lib/types";

// Service layer tipis — semua akses Supabase Fitur 2 lewat sini (PRD §6).
// TODO(squad-2): isi dengan query Supabase + Storage (list/create/update/delete).

export async function listCards(): Promise<BusinessCard[]> {
  throw new Error("TODO(squad-2): implement listCards");
}

export async function saveCard(_d: CardDraft): Promise<BusinessCard> {
  throw new Error("TODO(squad-2): implement saveCard");
}