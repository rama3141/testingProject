"use server"

import { supabaseServer } from "../supabase/server";

export async function handleSubmitUploadForm(formData: FormData) {
    try {
        const            varName = String(formData.get("label id") ?? "").trim();
        const          firstName = String(formData.get("firstName")).trim();
        const           lastName = String(formData.get("lastName")).trim();
        const                job = String(formData.get("job")).trim();
        const        institution = String(formData.get("institution")).trim();
        const             email1 = String(formData.get("email1")).trim();
        const             email2 = String(formData.get("email2") ?? "").trim();
        const             phone1 = String(formData.get("phone1")).trim();
        const             phone2 = String(formData.get("phone2") ?? "").trim();
        const            address = String(formData.get("address")).trim();
        const              notes = String(formData.get("notes")).trim();
        const formObjectForJsonb = Object.fromEntries(formData.entries());

        console.log("first name:",  firstName);
        console.log("last name:",   lastName);
        console.log("job:",         job);
        console.log("institution:", institution);
        console.log("email1:",      email1);
        console.log("email2:",      email2);
        console.log("phone1:",      phone1);
        console.log("phone2:",      phone2);
        console.log("address:",     address);
        console.log("notes:",       notes); 

        const supabase = await supabaseServer();
        
        const {
            data: companyExist,
            error: companyLookUpError
        } = await supabase
            .from("company")
            .select("afiliasi, id")
            .eq("afiliasi", institution)
            .maybeSingle();
        
        if (companyLookUpError) {
            throw new Error(`Failed to retrieve company information: ${companyLookUpError.message}`);
        }

        let companyId: string;

        if (companyExist) {
            companyId = companyExist.id;
            console.log(`Found existing company with ID: ${companyId}`);
        } else {
            const {
                data: newCompany,
                error: companyInsertError
            } = await supabase
                .from("company")
                .insert({
                    afiliasi: institution,
                    alamat_kantor: address
                })
                .select("id")
                .single();
            
            if (companyInsertError) {
                if (companyInsertError.code === "23505") {
                    throw new Error("This company is already registered.");
                }

                throw new Error(`Failed to insert company: ${companyInsertError.message}`);
            } else {
                companyId = newCompany.id;
                console.log(`Created new event with ID: ${companyId}`);
            }
        }

        const {
            error: personalInformationInsertError,
        } = await supabase
            .from("personal_information")
            .insert({
                company_id: companyId,
                first_name: firstName,
                last_name: lastName,
                alamat_email1: email1,
                alamat_email2: email2,
                notel_1: phone1,
                notel_2: phone2,
                job_title: job,
                notes: notes,
                ocr_raw_json: formObjectForJsonb,
                ocr_status: "manual"
            });

        if (personalInformationInsertError) {
            if (personalInformationInsertError.code === "23505") {
                throw new Error("This person is already registered for this company.");
            }
            throw new Error(`Failed to insert personal information: ${personalInformationInsertError.message}`);
        }

        console.log(`Successfully inserted new personal information for comapny ${companyId}.`);
    } catch(error) {
        console.error("form failed to save:", error);
    }
}


export async function newHandleSubmitSingleUpdate(previousState: unknown, formData: FormData) {
    try{
        const nim = String(formData.get("nim") ?? "").trim();
        const campus = String(formData.get("campus") ?? "").trim();
        const eventName = String(formData.get("eventName") ?? "").trim();
        const eventYear = Number(formData.get("eventYear"));

        // Validate the required form fields.
        if (!/^\d{10}$/.test(nim)) {
            throw new Error("NIM must contain exactly 10 digits.");
        }
        if (!eventName || !Number.isInteger(eventYear) || eventYear <= 0) {
            throw new Error("Please provide a valid event name and event year.");
        }

        console.log("NIM:", nim);
        console.log("Campus:", campus);
        console.log("Event Name:", eventName);
        console.log("Event Year:", eventYear);

        const supabase = await supabaseServer();

        // Retrieve the student using their NIM.
        const {
            data: student,
            error: studentLookupError,
        } = await supabase
            .from("students")
            .select("nim, student_name, program_department")
            .eq("nim", nim)
            .maybeSingle();

        if (studentLookupError) {
            throw new Error(`Failed to retrieve student information: ${studentLookupError.message}`);
        }

        if (!student) {
            throw new Error("Student not found. Please check the NIM.");
        }
        console.log("Student Name:", student.student_name);
        console.log("Major:", student.program_department);

        // Step 1: Find the event in event_detail.
        const {
            data: existingEvent,
            error: eventLookupError,
        } = await supabase
            .from("event_detail")
            .select("id")
            .eq("event_name", eventName)
            .eq("event_year", eventYear)
            .maybeSingle();

        if (eventLookupError) {
            throw new Error(`Failed to find event: ${eventLookupError.message}`);
        }

        let eventId: string;

        if (existingEvent) {
            // Step 2A: Reuse the existing event's UUID.
            eventId = existingEvent.id;

            console.log(`Found existing event with ID: ${eventId}`);
        } else {
            // Step 2B: Create the event if it does not exist.
            const {
                data: newEvent,
                error: eventInsertError,
            } = await supabase
                .from("event_detail")
                .insert({
                    event_name: eventName,
                    event_year: eventYear,
                    event_location: campus || null,
                })
                .select("id")
                .single();

            if (eventInsertError) {
                // Another request might have created the same event
                // between our lookup and insert.
                if (eventInsertError.code === "23505") {
                    const {
                        data: concurrentEvent,
                        error: retryLookupError,
                    } = await supabase
                        .from("event_detail")
                        .select("id")
                        .eq("event_name", eventName)
                        .eq("event_year", eventYear)
                        .maybeSingle();

                    if (retryLookupError || !concurrentEvent) {
                        throw new Error("The event already exists, but its ID could not be retrieved.");
                    }

                    eventId = concurrentEvent.id;
                } else {
                    throw new Error(`Failed to create event: ${eventInsertError.message}`);
                }
            } else {
                eventId = newEvent.id;

                console.log(`Created new event with ID: ${eventId}`);
            }
        }

        // Step 3: Insert the student's participation.
        const {
            error: participationInsertError,
        } = await supabase
            .from("ie_participations")
            .insert({
                nim: student.nim,
                event_id: eventId,
                program_department: student.program_department,
            });

        if (participationInsertError) {
            if (participationInsertError.code === "23505") {
                throw new Error(
                    "This student is already registered for this event."
                );
            }

            throw new Error(
                `Failed to insert IE participation: ${participationInsertError.message}`
            );
        }

        console.log(`Successfully inserted participation for student ${nim}.`);
        console.log(`Successfully inserted participation for student ${nim} and synchronized their statuses.`);

        return {
            success: true,
            message: `Successfully inserted participation for student ${nim} and synchronized their statuses.`
        }
    } catch(error) {
        console.error("Single update failed:", error);

        return {
        success: false,
        message:
            error instanceof Error
            ? error.message
            : "An unexpected error occurred while updating student status.",
        };
    }
}