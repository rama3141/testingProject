"use server"

import { supabaseServer } from "../supabase/server";

import * as XLSX from 'xlsx';
import papa from "papaparse";

type supabaseInsertRows = Array<Record<string, any>>;


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
        const {data, error} = await supabase.from("ie_participations").insert(castedRecordsToInsert).select();
        if (error) {
            console.error("Error at inserting data to ie_participations:", error);
        }
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

    const {data, error} = await supabase.from("ie_participations")
        .insert({
            nim: nim,
            event_name: eventName,
            event_year: eventYear,
            campus_location: campus,
            program_department: major
        }).select();
    
    if (error) {
        console.error("Feiled To Insert to the IE Participations", error);
        throw new Error(error.message);
    }

    console.log("Successfully inserted:", data);
}