// Tipe bersama — cerminkan kolom PRD §4–§5. Jangan tambah kolom tanpa amend PRD.

export type Student = {
  nim: string;
  binusian_id?: string;
  binusian_batch?: string;
  student_name: string;
  academic_career?: string;
  program_code?: string;
  program_department?: string;
  program_department_realization?: string;
  faculty_code?: string;
  faculty_school?: string;
  faculty_school_realization?: string;
  campus_code?: string;
  campus?: string;
  graduation_status?: string;
  ie_status: boolean;
  ie_status_wisuda: boolean;
};

// Kolom file bulk upload (PRD §4.3)
export type BulkRow = {
  NIM: string;
  Name: string;
  Program_Department: string;
  CampusLocation: string;
  EventName: string;
  EventYear?: number;
};

export type OcrStatus = "draft" | "verified" | "manual";

export type BusinessCard = {
  id: string;
  full_name: string;
  job_title?: string;
  company?: string;
  email1?: string;
  email2?: string;
  phone1?: string;
  phone2?: string;
  address?: string;
  notes?: string;
  image_url?: string;
  ocr_raw_json?: unknown;
  ocr_status: OcrStatus;
};

export type CardDraft = Omit<BusinessCard, "id">;