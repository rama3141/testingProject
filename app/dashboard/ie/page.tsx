// Isi awalnya ada di app/components/ui/tempIEPage.tsx
import { supabaseServer } from "@/lib/supabase/server";
import IEMonitoringClient from "./IEMonitoringClientPage";

export default async function IEPage() {
    const supabase = await supabaseServer();

    const {data: students, error} = await supabase.from("students").select("*");

    if (error) {
      console.error("Error Fetching Students:", error);

      return (
        <div>
          <h1>IE Monitoring</h1>
          <p>Failed to load students</p>
        </div>
      );
    }

    return (
      <IEMonitoringClient students={students ?? []} />
    );
} 