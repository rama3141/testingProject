import { NextResponse } from "next/server";

// TODO(squad-2): terima image, forward ke OpenRouter (server-side, pakai OPENROUTER_API_KEY),
// prompt ekstrak JSON {full_name,job_title,company,email1,email2,phone1,phone2,address,notes},
// return sebagai draft. Jangan expose API key ke client. Lihat PRD §5.
export async function POST() {
  return NextResponse.json(
    { todo: "squad-2: implement OpenRouter proxy", draft: null },
    { status: 501 }
  );
}