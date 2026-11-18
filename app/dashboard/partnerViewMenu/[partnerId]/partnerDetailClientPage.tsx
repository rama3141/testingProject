import Link from "next/link";

// Info dari partner profile page.
export type PartnerDetail = {
  id: string;
  name: string;
  institution: string | null;
  jobTitle: string | null;
  email1: string | null;
  email2: string | null;
  phone1: string | null;
  phone2: string | null;
  address: string | null;
  notes: string | null;
};

type PartnerDetailClientPageProps = {
  partner: PartnerDetail;
};

// Generate initials for the partner avatar.
function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "?";

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (
    words[0][0] + words[words.length - 1][0]
  ).toUpperCase();
}

// Display "-" saat kosong
function displayValue(value: string | null) {
  return value?.trim() || "—";
}

export default function PartnerDetailClientPage({
  partner,
}: PartnerDetailClientPageProps) {

  // Combine job title dan institution untuk profile.
  const subtitle = [
    partner.jobTitle,
    partner.institution,
  ]
    .filter(Boolean)
    .join(" • ");

  // Display partner information.
  const profileFields = [
    {
      label: "Job Title",
      value: partner.jobTitle,
    },
    {
      label: "Institution",
      value: partner.institution,
    },
    {
      label: "Email 1",
      value: partner.email1,
    },
    {
      label: "Email 2",
      value: partner.email2,
    },
    {
      label: "Phone 1",
      value: partner.phone1,
    },
    {
      label: "Phone 2",
      value: partner.phone2,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-[878px] px-4 pb-16 pt-[26px] sm:px-0">

      {/* Back to Partner Data */}
      <div className="mb-[14px]">
        <Link
          href="/dashboard/partnerViewMenu"
          className="inline-flex items-center gap-[9px] text-[12px] text-[#73829b] transition-colors hover:text-[#263c59]"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-[14px] w-[14px] fill-none stroke-current"
            style={{
              strokeWidth: 1.8,
              strokeLinecap: "round",
              strokeLinejoin: "round",
            }}
          >
            <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
          </svg>

          Back to Partner Data
        </Link>
      </div>

      {/* Main Partner Profile Card */}
      <section className="min-h-[535px] w-full rounded-[10px] border border-[#dfe7f1] bg-white px-[19px] py-[19px]">

        {/* Profile Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">

          {/* Avatar, Name and Subtitle */}
          <div className="flex min-w-0 items-center gap-[13px]">

            <span
              aria-hidden="true"
              className="inline-flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-[#dff2ff] text-[15px] font-semibold text-[#0872b7]"
            >
              {getInitials(partner.name)}
            </span>

            <div className="min-w-0">
              <h1 className="m-0 break-words text-[19px] font-bold leading-tight text-[#182238]">
                {partner.name}
              </h1>

              <p className="mt-[4px] mb-0 text-[11px] text-[#73829b]">
                {subtitle || "Partner contact"}
              </p>
            </div>

          </div>

          {/* Edit and Delete Buttons */}
          <div className="flex shrink-0 items-center gap-[8px]">

            <button
              type="button"
              disabled
              className="h-[33px] rounded-[7px] border border-[#dfe7f1] bg-white px-[15px] text-[11px] font-medium text-[#64758f] disabled:cursor-default"
            >
              Edit
            </button>

            <button
              type="button"
              disabled
              className="h-[33px] rounded-[7px] bg-[#ffe4e4] px-[15px] text-[11px] font-medium text-[#e12d39] disabled:cursor-default"
            >
              Delete
            </button>

          </div>
        </div>

        {/* Partner Information */}
        <div className="mt-[32px] grid grid-cols-1 gap-x-8 gap-y-[26px] sm:grid-cols-2">

          {profileFields.map((field) => (
            <div
              key={field.label}
              className="min-w-0"
            >
              <p className="m-0 text-[10px] leading-[15px] text-[#73829b]">
                {field.label}
              </p>

              <p className="mt-[2px] mb-0 break-words text-[12px] font-semibold leading-[17px] text-[#182238]">
                {displayValue(field.value)}
              </p>
            </div>
          ))}

        </div>

        {/* Address */}
        <div className="mt-[26px] min-w-0">

          <p className="m-0 text-[10px] leading-[15px] text-[#73829b]">
            Address
          </p>

          <p className="mt-[2px] mb-0 break-words text-[12px] font-semibold leading-[17px] text-[#182238]">
            {displayValue(partner.address)}
          </p>

        </div>

        {/* Notes */}
        <div className="mt-[26px] min-h-[52px] rounded-[8px] bg-[#f7f9fc] px-[13px] py-[10px]">

          <p className="m-0 text-[10px] leading-[14px] text-[#73829b]">
            Notes
          </p>

          <p className="mt-[2px] mb-0 whitespace-pre-wrap break-words text-[11px] leading-[16px] text-[#182238]">
            {displayValue(partner.notes)}
          </p>

        </div>

      </section>

    </main>
  );
}