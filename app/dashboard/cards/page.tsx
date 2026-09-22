"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

// TODO(squad-2): sambungkan ke POST /api/cards/ocr lalu ke Supabase via lib/api-service/cards.ts
export default function CardsPage() {
  const [draft, setDraft] = useState({
    full_name: "",
    job_title: "",
    company: "",
    email1: "",
    email2: "",
    phone1: "",
    phone2: "",
    address: "",
    notes: "",
  });

  return (
    <>
      <h1>Name Cards</h1>
      <p className="muted">
        Alur: upload → draft OCR → koreksi manual → save. Form kosong di bawah = fallback manual kalau OCR
        gagal (PRD §5). TODO(squad-2): implement upload + save.
      </p>
      <div className="card">
        <h3>1. Upload kartu (stub OCR)</h3>
        <form className="row" action="/api/cards/ocr" method="post" encType="multipart/form-data">
          <Button variant="outline">
            <input type="file" name="image" accept="image/*" />
          </Button>
          {/* <button type="submit">Scan OCR (stub)</button> */}
          <Button type="submit" variant="outline">
            Scan OCR (stub)
          </Button>
        </form>
      </div>
      <div className="card">
        <h3>2. Form (draft OCR / manual)</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert("TODO(squad-2): save ke Supabase. Payload: " + JSON.stringify(draft));
          }}
        >
          {(
            [
              ["full_name", "Nama"],
              ["job_title", "Jabatan"],
              ["company", "Institusi"],
              ["email1", "Email 1"],
              ["email2", "Email 2 (opsional)"],
              ["phone1", "Phone 1"],
              ["phone2", "Phone 2 (opsional)"],
              ["address", "Alamat"],
              ["notes", "Catatan"],
            ] as const
          ).map(([k, label]) => (
            <label key={k}>
              {label}
              <input
                value={draft[k]}
                onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
              />
            </label>
          ))}
          <div className="row">
            <Button type="submit" variant="outline">Save (stub)</Button>
            <Button type="button" variant="outline" onClick={() => setDraft({ full_name: "", job_title: "", company: "", email1: "", email2: "", phone1: "", phone2: "", address: "", notes: "" })}>
              Reset (input manual baru)
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}