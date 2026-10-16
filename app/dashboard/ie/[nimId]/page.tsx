import { supabaseServer } from "@/lib/supabase/server";
import StudentProfileClient from "./StudentProfileClient";


export default async function StudentProfilePage({params,}: {params: Promise<{nimId: string}>;}) {
    const {nimId} = await params;

    const supabase = await supabaseServer();
    
    const { data: student, error: studentError } = await supabase
        .from("students")
        .select("*")
        .eq("nim", nimId)
        .single();
    const { data: participations, error: participationError } = await supabase
        .from("ie_participations")
        .select("*")
        .eq("nim", nimId)
        .order("event_year", { ascending: false });
        
    if (studentError) {
        console.error("Error fetching student:", studentError);

        return (
        <div className="mt-[100px]">
            <h1>Student Not Found</h1>
            <p>Could not find student with NIM: {nimId}</p>
        </div>
        );
    }

    if (participationError) {
        console.error(
        "Error fetching IE participations:",
        participationError
        );
    }

    return (
        <StudentProfileClient 
            student={student} 
            participations={participations ?? []}
        />
    );
}