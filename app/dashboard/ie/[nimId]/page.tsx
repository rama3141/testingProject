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
        
    if (studentError) {
        console.error("Error fetching student:", studentError);

        return (
            <div className="mt-[100px]">
                <h1>Student Not Found</h1>
                <p>Could not find student with NIM: {nimId}</p>
            </div>
        );
    }

    const { data: participationRecords, error: participationError } = await supabase
        .from("ie_participations")
        .select("*")
        .eq("nim", nimId)

    if (participationError) {
        console.error("Error fetching IE participations:", participationError);
        throw new Error("Failed to load student participation history.");
    }

    const participations = participationRecords ?? [];

    // Fetch associated event details
    const eventIds = [
        ...new Set(
            participations.map(
                (participation) => participation.event_id
            )
        ),
    ];

    let eventRecords: {
        id: string;
        event_name: string;
        event_year: number;
        event_location: string | null;
    }[] = [];

    if (eventIds.length > 0) {
        const {
            data,
            error: eventError,
        } = await supabase
            .from("event_detail")
            .select(`
                id,
                event_name,
                event_year,
                event_location
            `)
            .in("id", eventIds);

        if (eventError) {
            console.error(
                "Error fetching event details:",
                eventError
            );

            throw new Error("Failed to load event details.");
        }

        eventRecords = data ?? [];
    }

    // Combine Participation and event data
    const eventMap = new Map(
        eventRecords.map((event) => [event.id, event])
    );

    const participationHistory = participations.map((participation) => {
        const event = eventMap.get(participation.event_id);

        if (!event) {
            return null;
        }

        return {
            ...participation,
            event,
        };
    }).filter((participation) => participation !== null).sort(
        (a, b) => b.event.event_year - a.event.event_year
    );


    return (
        <StudentProfileClient 
            student={student} 
            participations={participationHistory ?? []}
        />
    );
}