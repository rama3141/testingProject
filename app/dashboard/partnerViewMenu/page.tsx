{/* File ini untuk server component-nya, kegunaan-nya untuk loading data dari database */}

import { supabaseServer } from "@/lib/supabase/server";
import PartnerViewMenuClientPage from "./partnerViewMenuClientPage";

export default async function partnerViewMenuPage() {

    return (
      <PartnerViewMenuClientPage/>
    );
}