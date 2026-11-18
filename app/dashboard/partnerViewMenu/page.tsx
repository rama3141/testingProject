{/* File ini untuk server component-nya, kegunaan-nya untuk loading data dari database */}

import { supabaseServer } from "@/lib/supabase/server";
import PartnerViewMenuClientPage from "./partnerViewMenuClientPage";
import type { PartnerRecord } from "./partnerViewMenuClientPage";

export default async function partnerViewMenuPage() {
    const supabase = await supabaseServer();  

    const {data: personInfo, error: personInfoError} = await supabase
        .from("personal_information")
        .select(`
          id, first_name, last_name, job_title, alamat_email1, alamat_email2, notel_1, notel_2,
          company:company!personal_information_company_id_fkey (
            afiliasi
          )
        `);

    console.log(
      "Company relationship:",
      JSON.stringify(
        personInfo?.map((person) => ({
          name: person.first_name,
          company: person.company,
        })),
        null,
        2
      )
    );

    if (personInfoError) {
      console.error("Error fetching personal information:", personInfoError);
      return (
        <PartnerViewMenuClientPage partners={[]}/>
      );
    }

    const partners: PartnerRecord[] = (personInfo ?? []).map((person) => {
      const company = person.company as unknown as {
        afiliasi: string | null;
      } | null;

      return {
        id: person.id,
        name: `${person.first_name ?? ""} ${person.last_name ?? ""}`.trim(),
        institution: company?.afiliasi ?? null,
        jobTitle: person.job_title ?? null,
        email: person.alamat_email1 || person.alamat_email2 || null,
        phone: person.notel_1 || person.notel_2 || null,
      };
    });

    return (
      <PartnerViewMenuClientPage partners={partners}/>
    );
}