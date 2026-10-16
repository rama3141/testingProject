import { NextResponse } from "next/server";

// POST /api/cards/ocr — terima foto kartu nama (multipart, field "image"),
// forward ke OpenRouter (vision), return draft JSON. API key server-side only (PRD §3, §5).

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
  ". Majority language English. Use null for any field not printed on the card. " +
  "Do not guess, infer, or invent values. " +
  "Put extra info (website, fax, etc.) in notes.";

// Structured Outputs: bentuk balasan dibatasi di level decoding, bukan sekadar "JSON
// yang valid". strict:true mewajibkan semua key ada di `required`, jadi field yang tidak
// tercetak di kartu dinyatakan null — bukan dihilangkan. Catatan: OpenRouter meneruskan
// response_format ke provider upstream, jadi dukungan strict tergantung model yang dipilih.
const CARD_SCHEMA = {
  name: "business_card",
  strict: true,
  schema: {
    type: "object",
    properties: Object.fromEntries(
      FIELDS.map((k) => [k, { type: ["string", "null"] }])
    ),
    required: [...FIELDS],
    additionalProperties: false,
  },
} as const;

export async function POST(req: Request) {
  // OpenRouter: key diawali "sk-or-v1-". Nama model wajib pakai prefix provider,
  // mis. "openai/gpt-4o-mini" — tanpa prefix OpenRouter menolak request.
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
  if (!apiKey || apiKey.startsWith("your-")) {
    return NextResponse.json(
      { error: "OCR belum dikonfigurasi (OPENROUTER_API_KEY kosong). Silakan input manual." },
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
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Opsional, dipakai OpenRouter untuk atribusi di dashboard mereka.
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
        "X-Title": "IE Dashboard",
      },
      body: JSON.stringify({
        model,
        response_format: { type: "json_schema", json_schema: CARD_SCHEMA },
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
      console.error("OpenRouter error", res.status, await res.text());
      return NextResponse.json(
        { error: "OCR gagal diproses. Silakan coba lagi atau input manual." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const raw = JSON.parse(data.choices?.[0]?.message?.content ?? "{}");

    // Schema sudah menjamin bentuknya; normalisasi tetap dipakai sebagai jaring pengaman
    // dan untuk memetakan null (tidak ada di kartu) ke "" agar cocok dengan input form.
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