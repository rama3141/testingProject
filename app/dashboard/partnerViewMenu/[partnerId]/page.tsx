import { supabaseServer } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

import PartnerDetailClientPage, {
  type PartnerDetail
} from "./partnerDetailClientPage";

// Retrieve a valid string or return null.
function getNullableString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

// Extract the address from ocr_raw_json.
function getAddressFromOCR(rawData: unknown): string | null {
  let parsedData = rawData;

  // Handle JSON stored as a string.
  if (typeof parsedData === "string") {
    try {
      parsedData = JSON.parse(parsedData);
    } catch {
      return null;
    }
  }

  // Make sure the JSON is an object.
  if (
    typeof parsedData !== "object" ||
    parsedData === null ||
    Array.isArray(parsedData)
  ) {
    return null;
  }

  const address = (
    parsedData as Record<string, unknown>
  ).address;

  return getNullableString(address);
}

// Company relationship structure.
type CompanyRelation = {
  afiliasi: string | null;
};

export default async function PartnerDetailPage({params}: {params: Promise<{ partnerId: string }>;}) {
  // Retrieve the UUID from the dynamic URL.
  const { partnerId } = await params;

  const supabase = await supabaseServer();

  // Fetch the selected partner from Supabase.
  const {
    data: personInfo,
    error: personInfoError,
  } = await supabase
    .from("personal_information")
    .select(`
      id,
      first_name,
      last_name,
      job_title,
      alamat_email1,
      alamat_email2,
      notel_1,
      notel_2,
      notes,
      ocr_raw_json,
      company:company!personal_information_company_id_fkey (
        afiliasi
      )
    `)
    .eq("id", partnerId)
    .maybeSingle();

  // Handle Supabase errors.
  if (personInfoError) {
    console.error("Error fetching partner details:", personInfoError);

    return (
      <main className="mx-auto w-full max-w-[878px] px-5 pt-8">
        <Link
          href="/dashboard/partnerViewMenu"
          className="text-sm text-[#73829b] hover:text-[#263c59]"
        >
          ← Back to Partner Data
        </Link>

        <div className="mt-6 rounded-lg border border-[#dfe7f1] bg-white p-5">
          <h1 className="text-lg font-bold text-[#182238]">
            Unable to load partner information
          </h1>

          <p className="mt-2 text-sm text-[#73829b]">
            Something went wrong while retrieving this partner's information.
            Please try again.
          </p>
        </div>
      </main>
    );
  }

  // Handle records that do not exist.
  if (!personInfo) {
    notFound();
  }

  // Retrieve the associated company.
  const companyData =
    personInfo.company as unknown as
      | CompanyRelation
      | CompanyRelation[]
      | null;

  const company = Array.isArray(companyData)
    ? companyData[0]
    : companyData;

  // Combine first name and last name.
  const fullName = [
    personInfo.first_name,
    personInfo.last_name,
  ]
    .filter(
      (value): value is string =>
        typeof value === "string" &&
        value.trim().length > 0
    )
    .map((value) => value.trim())
    .join(" ");

  // Prepare the information for the frontend.
  const partner: PartnerDetail = {
    id         : personInfo.id,
    name       : fullName || "Unnamed Partner",
    institution: getNullableString(company?.afiliasi),
    jobTitle   : getNullableString(personInfo.job_title),
    email1     : getNullableString(personInfo.alamat_email1),
    email2     : getNullableString(personInfo.alamat_email2),
    phone1     : getNullableString(personInfo.notel_1),
    phone2     : getNullableString(personInfo.notel_2),
    address    : getAddressFromOCR(personInfo.ocr_raw_json),
    notes      : getNullableString(personInfo.notes),
  };

  // Display the selected partner's profile.
  return (
    <PartnerDetailClientPage partner={partner} />
  );
}
