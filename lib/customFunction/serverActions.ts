"use server"

import { supabaseServer } from "../supabase/server";

import * as XLSX from 'xlsx';
import papa from "papaparse";

type supabaseInsertRows = Array<Record<string, any>>;


async function syncStudentIeStatuses(
    supabase: Awaited<ReturnType<typeof supabaseServer>>,
    inputNims: string[]
) {
    const currentYear = Number(
        new Intl.DateTimeFormat("en-US", {
            timeZone: "Asia/Jakarta",
            year: "numeric",
        }).format(new Date())
    );

    // Remove duplicate NIMs and empty values.
    const uniqueNims = [
        ...new Set(
            inputNims
                .map((nim) => String(nim).trim())
                .filter(Boolean)
        ),
    ];

    if (uniqueNims.length === 0) {
        return;
    }

    // Process NIMs in batches to avoid excessively large queries.
    const batchSize = 200;

    for (let i = 0; i < uniqueNims.length; i += batchSize) {
        const nimBatch = uniqueNims.slice(i, i + batchSize);

        // Find students who attended an event in the current year.
        const { data: currentYearRecords, error: fetchError } =
            await supabase
                .from("ie_participations")
                .select("nim")
                .in("nim", nimBatch)
                .eq("event_year", currentYear);

        if (fetchError) {
            throw new Error(
                `Failed to fetch current-year IE participations: ${fetchError.message}`
            );
        }

        const currentYearNims = new Set(
            (currentYearRecords ?? []).map((record) => record.nim)
        );

        const attendedThisYear = nimBatch.filter((nim) =>
            currentYearNims.has(nim)
        );

        const attendedPreviousYearsOnly = nimBatch.filter(
            (nim) => !currentYearNims.has(nim)
        );

        // Update students who attended at least one event this year.
        if (attendedThisYear.length > 0) {
            const { error } = await supabase
                .from("students")
                .update({
                    ie_status: true,
                    ie_status_wisuda: true,
                })
                .in("nim", attendedThisYear);

            if (error) {
                throw new Error(
                    `Failed to update current-year student statuses: ${error.message}`
                );
            }
        }

        // Update students who have participation records,
        // but none in the current year.
        if (attendedPreviousYearsOnly.length > 0) {
            const { error } = await supabase
                .from("students")
                .update({
                    ie_status_wisuda: true,
                })
                .in("nim", attendedPreviousYearsOnly);

            if (error) {
                throw new Error(
                    `Failed to update historical student statuses: ${error.message}`
                );
            }
        }
    }
}

export async function handleFormUploadBulkAction(formData: FormData) {
    try {
        const file = formData.get("inputFile") as File;

        if (!file || file.size === 0) {
            throw new Error("No file uploaded.");
        }

        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        let recordsToInsert: supabaseInsertRows = [];
        
        if (fileExtension === "csv") {
            const textContent = await file.text();
            const parsed = papa.parse(textContent, {
                header: true,
                dynamicTyping: false,
                skipEmptyLines: true
            });

            recordsToInsert = parsed.data as supabaseInsertRows;
        } else if (fileExtension === "xls" || fileExtension === "xlsx") {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Parse workbook from buffer
            const workbook = XLSX.read(buffer, {type: "buffer"});
            const sheetName = workbook.SheetNames[0];
            const workSheet = workbook.Sheets[sheetName];

            // convert to an array of literals object
            recordsToInsert = XLSX.utils.sheet_to_json(workSheet, {defval: ""}) as supabaseInsertRows;
        }

        let castedRecordsToInsert = recordsToInsert.map((row) => {
            const rawEventYear = row["event_year"];
            const rawNim = row["nim"];

            return {
                ...row,
                nim: rawNim !== undefined && rawNim !== null ? String(rawNim).trim() : "", 
                event_year: rawEventYear ? parseInt(rawEventYear, 10) : 0
            };
        });

        console.log("Parsed data:\n", castedRecordsToInsert);

        const supabase = await supabaseServer();
        const {error: insertError} = await supabase
            .from("ie_participations")
            .insert(castedRecordsToInsert);
        if (insertError) {
            throw new Error(
                `Failed to insert IE participations: ${insertError.message}`
            );
        }

        // Synchronize the affected students after a successful insertion.
        const affectedNims = castedRecordsToInsert.map(
            (record) => record.nim
        );

        await syncStudentIeStatuses(supabase, affectedNims);

        console.log(`Successfully inserted ${castedRecordsToInsert.length} participation records and synchronized student statuses.`);
    } catch(error) {
        console.error("Failded to parse file:", error);
    }finally {
        console.log("insert are successfull.");
    }
}

export async function handleSubmitSingleUpdate(formData: FormData) {
    const nim         = formData.get("nim") as string;
    const studentName = formData.get("studentName") as string;
    const major       = formData.get("major") as string;
    const campus      = formData.get("campus") as string;
    const eventName   = formData.get("eventName") as string;
    const eventYear   = Number(formData.get("eventYear"));

    console.log("nim:", nim);
    console.log("studentName:", studentName);
    console.log("major:", major);
    console.log("campus:", campus);
    console.log("eventName:", eventName);
    console.log("eventYear:", eventYear);

    const supabase = await supabaseServer();

    const {error} = await supabase
        .from("ie_participations")
        .insert({
            nim: nim,
            event_name: eventName,
            event_year: eventYear,
            campus_location: campus,
            program_department: major
        });
    
    if (error) {
        console.error("Feiled To Insert to the IE Participations", error);
        throw new Error(error.message);
    }

    await syncStudentIeStatuses(supabase, [nim]);

    console.log(`Successfully inserted participation for student ${nim} and synchronized their statuses.`);
}

async function newSyncStudentIeStatuses(
    supabase: Awaited<ReturnType<typeof supabaseServer>>,
    inputNims: string[]
) {
    // Get the current year using the Jakarta timezone.
    const currentYear = Number(
        new Intl.DateTimeFormat("en-US", {
            timeZone: "Asia/Jakarta",
            year: "numeric",
        }).format(new Date())
    );

    // Remove duplicate NIMs and empty values.
    const uniqueNims = [
        ...new Set(
            inputNims
                .map((nim) => String(nim).trim())
                .filter(Boolean)
        ),
    ];

    if (uniqueNims.length === 0) {
        return;
    }

    // Process NIMs in batches to avoid excessively large queries.
    const batchSize = 200;

    for (let i = 0; i < uniqueNims.length; i += batchSize) {
        const nimBatch = uniqueNims.slice(i, i + batchSize);

        // Step 1: Fetch participation records for these students.
        const {
            data: participationRecords,
            error: participationError,
        } = await supabase
            .from("ie_participations")
            .select("nim, event_id")
            .in("nim", nimBatch);

        if (participationError) {
            throw new Error(
                `Failed to fetch IE participations: ${participationError.message}`
            );
        }

        // Step 2: Extract unique event IDs.
        const eventIds = [
            ...new Set(
                (participationRecords ?? []).map(
                    (record) => record.event_id
                )
            ),
        ];

        // Track students who have attended at least one event.
        const studentsWithParticipation = new Set(
            (participationRecords ?? []).map(
                (record) => record.nim
            )
        );

        // Track students who attended an event this year.
        const currentYearNims = new Set<string>();

        // Step 3: Fetch event years from event_detail.
        if (eventIds.length > 0) {
            const {
                data: eventRecords,
                error: eventError,
            } = await supabase
                .from("event_detail")
                .select("id, event_year")
                .in("id", eventIds);

            if (eventError) {
                throw new Error(
                    `Failed to fetch event details: ${eventError.message}`
                );
            }

            // Map event IDs to their respective years.
            const eventYearMap = new Map(
                (eventRecords ?? []).map(
                    (event) => [event.id, event.event_year]
                )
            );

            // Identify students who attended an event this year.
            for (const participation of participationRecords ?? []) {
                const eventYear = eventYearMap.get(
                    participation.event_id
                );

                if (eventYear === currentYear) {
                    currentYearNims.add(participation.nim);
                }
            }
        }

        // Step 4: Separate students into three groups.
        const attendedThisYear = nimBatch.filter(
            (nim) => currentYearNims.has(nim)
        );

        const attendedPreviousYearsOnly = nimBatch.filter(
            (nim) =>
                studentsWithParticipation.has(nim) &&
                !currentYearNims.has(nim)
        );

        // Step 5: Update students who attended an event this year.
        if (attendedThisYear.length > 0) {
            const { error } = await supabase
                .from("students")
                .update({
                    ie_status: true,
                    ie_status_wisuda: true,
                })
                .in("nim", attendedThisYear);

            if (error) {
                throw new Error(
                    `Failed to update current-year student statuses: ${error.message}`
                );
            }
        }

        // Step 6: Update students who attended only in previous years.
        if (attendedPreviousYearsOnly.length > 0) {
            const { error } = await supabase
                .from("students")
                .update({
                    ie_status: false,
                    ie_status_wisuda: true,
                })
                .in("nim", attendedPreviousYearsOnly);

            if (error) {
                throw new Error(
                    `Failed to update historical student statuses: ${error.message}`
                );
            }
        }
    }
}

export async function newHandleFormUploadBulkAction(previousState: unknown, formData: FormData) {
    try {
        // ==================================================
        // STEP 1: Read and parse the uploaded file
        // ==================================================

        const file = formData.get("inputFile") as File;

        if (!file || file.size === 0) {
            throw new Error("Please upload a valid CSV or Excel file.");
        }

        const fileExtension = file.name.split(".").pop()?.toLowerCase();

        let rawRecords: Record<string, unknown>[] = [];

        if (fileExtension === "csv") {
            const textContent = await file.text();

            const parsed = papa.parse<Record<string, unknown>>(
                textContent,
                {
                    header: true,
                    dynamicTyping: false,
                    skipEmptyLines: true,
                }
            );

            if (parsed.errors.length > 0) {
                throw new Error(
                    `Failed to parse CSV: ${parsed.errors[0].message}`
                );
            }

            rawRecords = parsed.data;
        } else if (
            fileExtension === "xls" ||
            fileExtension === "xlsx"
        ) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const workbook = XLSX.read(buffer, {
                type: "buffer",
            });

            const sheetName = workbook.SheetNames[0];

            if (!sheetName) {
                throw new Error("The uploaded Excel file has no worksheets.");
            }

            const worksheet = workbook.Sheets[sheetName];

            rawRecords = XLSX.utils.sheet_to_json<
                Record<string, unknown>
            >(worksheet, {
                defval: "",
            });
        } else {
            throw new Error(
                "Unsupported file format. Please upload CSV, XLS, or XLSX."
            );
        }

        if (rawRecords.length === 0) {
            throw new Error("The uploaded file contains no data.");
        }

        // ==================================================
        // STEP 2: Normalize and validate imported records
        // ==================================================

        type ImportedRecord = {
            nim: string;
            event_name: string;
            event_year: number;
            event_location: string | null;
            program_department: string | null;
        };

        const recordsToImport: ImportedRecord[] = rawRecords.map(
            (row, index) => {
                const nim = String(row["nim"] ?? "").trim();

                const eventName = String(
                    row["event_name"] ?? ""
                ).trim();

                const rawYear = String(
                    row["event_year"] ?? ""
                ).trim();

                const eventYear = Number(rawYear);

                // Support both the old CSV column name and the
                // new event_detail column name.
                const eventLocation = String(
                    row["event_location"] ??
                    row["campus_location"] ??
                    ""
                ).trim();

                const programDepartment = String(
                    row["program_department"] ??
                    row["major"] ??
                    ""
                ).trim();

                if (!nim) {
                    throw new Error(
                        `Row ${index + 2}: NIM is required.`
                    );
                }

                if (!eventName) {
                    throw new Error(
                        `Row ${index + 2}: Event name is required.`
                    );
                }

                if (
                    !rawYear ||
                    !Number.isInteger(eventYear) ||
                    eventYear <= 0
                ) {
                    throw new Error(
                        `Row ${index + 2}: Invalid event year.`
                    );
                }

                return {
                    nim,
                    event_name: eventName,
                    event_year: eventYear,
                    event_location: eventLocation || null,
                    program_department: programDepartment || null,
                };
            }
        );

        console.log(
            `Parsed ${recordsToImport.length} participation records.`
        );

        // ==================================================
        // STEP 3: Create the Supabase client
        // ==================================================

        const supabase = await supabaseServer();

        const batchSize = 200;

        // ==================================================
        // STEP 4: Verify that all students exist
        // ==================================================

        const uniqueNims = [
            ...new Set(recordsToImport.map((record) => record.nim)),
        ];

        const existingNims = new Set<string>();

        for (let i = 0; i < uniqueNims.length; i += batchSize) {
            const nimBatch = uniqueNims.slice(i, i + batchSize);

            const { data, error } = await supabase
                .from("students")
                .select("nim")
                .in("nim", nimBatch);

            if (error) {
                throw new Error(
                    `Failed to validate students: ${error.message}`
                );
            }

            for (const student of data ?? []) {
                existingNims.add(student.nim);
            }
        }

        const missingNims = uniqueNims.filter(
            (nim) => !existingNims.has(nim)
        );

        if (missingNims.length > 0) {
            throw new Error(
                `The following NIMs do not exist in students: ${
                    missingNims.slice(0, 20).join(", ")
                }${
                    missingNims.length > 20
                        ? `, and ${missingNims.length - 20} more`
                        : ""
                }. No participation records were imported.`
            );
        }

        // ==================================================
        // STEP 5: Collect unique events
        // ==================================================

        type EventRecord = {
            event_name: string;
            event_year: number;
            event_location: string | null;
        };

        const eventMap = new Map<string, EventRecord>();

        const getEventKey = (
            eventName: string,
            eventYear: number
        ) => JSON.stringify([eventName, eventYear]);

        for (const record of recordsToImport) {
            const key = getEventKey(
                record.event_name,
                record.event_year
            );

            const existing = eventMap.get(key);

            if (!existing) {
                eventMap.set(key, {
                    event_name: record.event_name,
                    event_year: record.event_year,
                    event_location: record.event_location,
                });

                continue;
            }

            // One event cannot have conflicting non-empty locations
            // under the current event identity rules.
            if (
                existing.event_location &&
                record.event_location &&
                existing.event_location !== record.event_location
            ) {
                throw new Error(
                    `Conflicting locations found for "${record.event_name}" ` +
                    `(${record.event_year}).`
                );
            }

            // Prefer a non-empty location if the first row was empty.
            if (!existing.event_location && record.event_location) {
                existing.event_location = record.event_location;
            }
        }

        const uniqueEvents = [...eventMap.values()];

        // ==================================================
        // STEP 6: Insert missing events
        // ==================================================

        // ignoreDuplicates handles an event that already exists,
        // including one created by another request concurrently.
        for (let i = 0; i < uniqueEvents.length; i += batchSize) {
            const eventBatch = uniqueEvents.slice(
                i,
                i + batchSize
            );

            const { error } = await supabase
                .from("event_detail")
                .upsert(eventBatch, {
                    onConflict: "event_name,event_year",
                    ignoreDuplicates: true,
                });

            if (error) {
                throw new Error(
                    `Failed to create events: ${error.message}`
                );
            }
        }

        // ==================================================
        // STEP 7: Retrieve event UUIDs
        // ==================================================

        const eventIdMap = new Map<string, string>();

        for (let i = 0; i < uniqueEvents.length; i += batchSize) {
            const eventBatch = uniqueEvents.slice(
                i,
                i + batchSize
            );

            const eventNames = [
                ...new Set(
                    eventBatch.map((event) => event.event_name)
                ),
            ];

            const eventYears = [
                ...new Set(
                    eventBatch.map((event) => event.event_year)
                ),
            ];

            const { data, error } = await supabase
                .from("event_detail")
                .select("id, event_name, event_year")
                .in("event_name", eventNames)
                .in("event_year", eventYears);

            if (error) {
                throw new Error(
                    `Failed to retrieve event IDs: ${error.message}`
                );
            }

            for (const event of data ?? []) {
                const key = getEventKey(
                    event.event_name,
                    event.event_year
                );

                eventIdMap.set(key, event.id);
            }
        }

        // Ensure every event has a UUID before inserting participations.
        for (const event of uniqueEvents) {
            const key = getEventKey(
                event.event_name,
                event.event_year
            );

            if (!eventIdMap.has(key)) {
                throw new Error(
                    `Could not find event "${event.event_name}" ` +
                    `(${event.event_year}).`
                );
            }
        }

        // ==================================================
        // STEP 8: Prepare participation records
        // ==================================================

        const participationsToInsert = recordsToImport.map(
            (record) => ({
                nim: record.nim,
                event_id: eventIdMap.get(
                    getEventKey(
                        record.event_name,
                        record.event_year
                    )
                )!,
                program_department: record.program_department,
            })
        );

        // ==================================================
        // STEP 9: Insert participation records
        // ==================================================

        let insertedOrProcessedCount = 0;

        for (
            let i = 0;
            i < participationsToInsert.length;
            i += batchSize
        ) {
            const participationBatch = participationsToInsert.slice(
                i,
                i + batchSize
            );

            const { error } = await supabase
                .from("ie_participations")
                .upsert(participationBatch, {
                    onConflict: "nim,event_id",
                    ignoreDuplicates: true,
                });

            if (error) {
                throw new Error(
                    `Failed to import participation records: ${error.message}`
                );
            }

            insertedOrProcessedCount += participationBatch.length;
        }

        // ==================================================
        // STEP 10: Synchronize student IE statuses
        // ==================================================

        await newSyncStudentIeStatuses(supabase, uniqueNims);

        console.log(
            `Bulk import completed. Processed ${insertedOrProcessedCount} ` +
            `participation rows and synchronized ${uniqueNims.length} students.`
        );
        return {
            success: true,
            message: `Bulk upload completed successfully. Processed ${insertedOrProcessedCount} participation records.`,
        };
    } catch (error) {
        console.error("Bulk import failed:", error);

        return {
            success: false,
            message:
            error instanceof Error
                ? error.message
                : "An unexpected error occurred during bulk import.",
        };
    }
}

export async function newHandleSubmitSingleUpdate(previousState: unknown, formData: FormData) {
    try{
        const nim = String(formData.get("nim") ?? "").trim();
        const studentName = String(formData.get("studentName") ?? "").trim();
        const major = String(formData.get("major") ?? "").trim();
        const campus = String(formData.get("campus") ?? "").trim();
        const eventName = String(formData.get("eventName") ?? "").trim();
        const eventYear = Number(formData.get("eventYear"));

        // Validate the required form fields.
        if (!nim || !eventName || !Number.isInteger(eventYear) || eventYear <= 0) {
            throw new Error("Please provide a valid NIM, event name, and event year.");
        }

        console.log("NIM:", nim);
        console.log("Student Name:", studentName);
        console.log("Major:", major);
        console.log("Campus:", campus);
        console.log("Event Name:", eventName);
        console.log("Event Year:", eventYear);

        const supabase = await supabaseServer();

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
            throw new Error(
                `Failed to find event: ${eventLookupError.message}`
            );
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
                        throw new Error(
                            "The event already exists, but its ID could not be retrieved."
                        );
                    }

                    eventId = concurrentEvent.id;
                } else {
                    throw new Error(
                        `Failed to create event: ${eventInsertError.message}`
                    );
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
                nim,
                event_id: eventId,
                program_department: major || null,
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

        console.log(
            `Successfully inserted participation for student ${nim}.`
        );

        await newSyncStudentIeStatuses(supabase, [nim]);
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