import { NextResponse } from "next/server";

// TODO(squad-1): parse CSV (kolom: NIM,Name,Program_Department,CampusLocation,EventName),
// validasi, dry-run, lalu insert ke ie_participations + flip ie_status. Lihat PRD §4.
export async function POST() {
  return NextResponse.json(
    { todo: "squad-1: implement bulk validation + insert", expectedColumns: ["NIM", "Name", "Program_Department", "CampusLocation", "EventName"] },
    { status: 501 }
  );
}