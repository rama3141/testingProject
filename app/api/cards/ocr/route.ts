import { NextResponse } from "next/server";

// POST /api/cards/ocr — terima foto kartu nama (multipart, field "image"),
// forward ke OpenAI (vision), return draft JSON. API key server-side only (PRD §3, §5).

const FIELDS = [
  "full_name",
  "job_title",
  "company",
  "email1",
  "email2",
  "phone1",
  "phone2",
  "address",
  "notes",
] as const;

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const PROMPT =
  "Extract business card fields as JSON with exactly these keys: " +
  FIELDS.join(", ") +
  ". Majority language English. Return empty string for missing fields. No guessing. " +
  "Put extra info (website, fax, etc.) in notes.";

export async function POST(req: Request) {
  // TODO: isi OPENAI_API_KEY di .env.local setelah key didapat
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  if (!apiKey || apiKey === "your-openai-api-key-here") {
    return NextResponse.json(
      { error: "OCR belum dikonfigurasi (OPENAI_API_KEY kosong). Silakan input manual." },
      { status: 503 }
    );
  }

  let file: File | null = null;
  try {
    const form = await req.formData();
    const value = form.get("image");
    file = value instanceof File ? value : null;
  } catch {
    // body bukan multipart
  }
  if (!file || file.size === 0) {
    return NextResponse.json({ error: "Tidak ada gambar yang dikirim." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File harus berupa gambar." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Gambar terlalu besar (maks 10 MB)." }, { status: 413 });
  }

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: PROMPT },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      console.error("OpenAI error", res.status, await res.text());
      return NextResponse.json(
        { error: "OCR gagal diproses. Silakan coba lagi atau input manual." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const raw = JSON.parse(data.choices?.[0]?.message?.content ?? "{}");

    // Pastikan semua field ada dan bertipe string
    const draft = Object.fromEntries(
      FIELDS.map((k) => [k, typeof raw[k] === "string" ? raw[k].trim() : ""])
    );

    return NextResponse.json({ draft, raw });
  } catch (e) {
    console.error("OCR exception", e);
    return NextResponse.json(
      { error: "OCR gagal diproses. Silakan coba lagi atau input manual." },
      { status: 502 }
    );
  }
}
