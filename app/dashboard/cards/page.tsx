"use client";

import { CameraCapture } from "@/components/CameraCapture";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

const EMPTY_DRAFT = {
  full_name: "",
  job_title: "",
  company: "",
  email1: "",
  email2: "",
  phone1: "",
  phone2: "",
  address: "",
  notes: "",
};

// TODO(squad-2): sambungkan Save ke Supabase via lib/api-service/cards.ts (+ upload `image` ke Storage)
export default function CardsPage() {
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);

  // Bebaskan object URL preview lama
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function selectImage(file: File) {
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setOcrError(null);
  }

  async function runOcr() {
    if (!image) return;
    setLoading(true);
    setOcrError(null);
    try {
      const fd = new FormData();
      fd.append("image", image);
      const res = await fetch("/api/cards/ocr", { method: "POST", body: fd });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setOcrError(body.error ?? "OCR gagal. Silakan input manual.");
        return;
      }
      setDraft({ ...EMPTY_DRAFT, ...body.draft });
    } catch {
      setOcrError("OCR gagal (koneksi). Silakan input manual.");
    } finally {
      setLoading(false);
    }
  }

  // Hapus foto saja (untuk ambil ulang); isi form tetap
  function removeImage() {
    setImage(null);
    setPreview(null);
    setOcrError(null);
  }

  function resetAll() {
    setDraft(EMPTY_DRAFT);
    setImage(null);
    setPreview(null);
    setOcrError(null);
  }

  return (
    <>
      <h1>Name Cards</h1>
      <p className="muted">
        Alur: foto/upload → draft OCR → koreksi manual → save. Form kosong di bawah = fallback manual kalau OCR
        gagal (PRD §5).
      </p>
      <div className="card">
        <h3>1. Foto kartu nama</h3>
        <CameraCapture onCapture={selectImage} />
        <p className="muted">atau upload file:</p>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) selectImage(file);
            e.target.value = "";
          }}
        />
        {preview && (
          <div style={{ position: "relative", display: "inline-block" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview kartu nama" style={{ maxWidth: 320, borderRadius: 8, display: "block" }} />
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Hapus foto"
              title="Hapus foto (ambil ulang)"
              onClick={removeImage}
              disabled={loading}
              style={{ position: "absolute", top: 6, right: 6 }}
            >
              <X />
            </Button>
          </div>
        )}
        <div className="row">
          <Button type="button" variant="outline" onClick={runOcr} disabled={!image || loading}>
            {loading ? "Memproses..." : "Scan OCR"}
          </Button>
        </div>
        {ocrError && <p className="muted">{ocrError}</p>}
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
            <Button type="button" variant="outline" onClick={resetAll}>
              Reset (input manual baru)
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
