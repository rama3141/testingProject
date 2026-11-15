"use client";

import Image from "next/image";
import Link from "next/link";

import { useRef, useState, useActionState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation"; 

import previousArrowIcon from "@/public/previousArrowIcon.png"
import edit_icon from "@/public/edit_icon.png"
import delete_icon from "@/public/delete_icon.png"

import {
    handleDeleteStudentParticipation,
    handleEditStudentParticipation
} from "@/lib/customFunction/ieServerActions";

import ToastNotification from "../ToastNotification";

type Student = {
  nim: string;
  binusian_id: string | null;
  binusian_batch: string | null;
  student_name: string;
  academic_career: string | null;
  program_code: string | null;
  program_department: string | null;
  program_department_realization: string | null;
  faculty_code: string | null;
  faculty_school: string | null;
  faculty_school_realization: string | null;
  campus_code: string | null;
  campus: string | null;
  graduation_status: string | null;
  ie_status: boolean;
  ie_status_wisuda: boolean;
};

type IEParticipation = {
    id: string;
    nim: string;
    event_id: string;
    program_department: string | null;
    created_by: string | null;
    created_at: string;

    event: {
        id: string;
        event_name: string;
        event_year: number;
        event_location: string | null;
    };
};

type StudentProfileClientProps = {
  student: Student;
  participations: IEParticipation[];
};

const actionButtonStyle: React.CSSProperties = {
  padding: 0,
  fontSize: 11,
  lineHeight: 1,
  border: 0,
};

type ToastState = {
  type: "success" | "error";
  message: string;
};

export default function StudentProfilePage({student, participations,}: StudentProfileClientProps) {
    const router = useRouter();
    //-----------------------------------------------------------------------------------------------------
    const                                   [selectedParticipation, setSelectedParticipation] = useState<IEParticipation | null>(null); // Selected participation to delete
    //-----------------------------------------------------------------------------------------------------
    const       [showDeleteParticipationConfirmation, setShowDeleteParticipationConfirmation] = useState(false); // Delete confirmation modal
    const [deleteParticipationState, deleteParticipationAction, isDeleteParticipationPending] = useActionState(handleDeleteStudentParticipation, {success: false,message: ""});
    //-----------------------------------------------------------------------------------------------------
    const           [showEditParticipationConfirmation, setShowEditParticipationConfirmation] = useState(false);
    const                           [showEditParticipationForm, setShowEditParticipationForm] = useState(false);
    const       [editParticipationState, editParticipationAction, isEditParticipationPending] = useActionState(handleEditStudentParticipation, {success: false, message: ""});
    //-----------------------------------------------------------------------------------------------------
    const                                                                   [toast, setToast] = useState<ToastState | null>(null);
    //-----------------------------------------------------------------------------------------------------
    const closeToast = useCallback(() => {
        setToast(null);
    }, []);

    // Refresh page after successful delete
    useEffect(() => {
        if (deleteParticipationState?.success === true) {
            router.refresh();
        }
    }, [deleteParticipationState, router]);

    // Handle Delete Toast Notification
    useEffect(() => {
        if (!deleteParticipationState.message) return;
        if (deleteParticipationState?.success === true) {
            setToast({
                type: "success",
                message: deleteParticipationState.message
            });
            setSelectedParticipation(null);
        } else if (deleteParticipationState?.success === false) {
            setToast({
                type: "error",
                message: deleteParticipationState.message
            });
            setSelectedParticipation(null);
        }
    }, [deleteParticipationState]);

    // Refresh page after successful edit
    useEffect(() => {
        if (editParticipationState?.success === true) {
            router.refresh();
        }
    }, [editParticipationState, router]);

    // Handle Edit Toast Notification
    useEffect(() => {
        if (!editParticipationState.message) return;
        if (editParticipationState.success === true) {
            setToast({
                type: "success",
                message: editParticipationState.message
            });
            setShowEditParticipationForm(false);
            setSelectedParticipation(null);
        } else if (editParticipationState.success === false) {
            setToast({
                type: "error",
                message: editParticipationState.message
            });
        }
    }, [editParticipationState]);

    return (
        <>
        <div className="w-full ml-[7.847vw] mt-[121px] mb-[224px]"> {/* mt-[72 + 49] */}
            <div className="flex w-[167px] h-[19px] gap-[8px] items-center"> {/* Untuk link ke previous page, bisa dibilang ke page IE Monitoring awal */}
                <div> {/* Icon Arrow ke kiri */}
                    <Image src={previousArrowIcon} alt="previousArrowIcon"/>
                </div>
                <div> {/* Untuk link ke previous page, dengan text "Back to IE Monitoring" */}
                    <Link href={`.`}>
                        <p className="text-[14px] text-[#64748B]">Back to IE Monitoring</p>
                    </Link>
                </div>
            </div>

            <div className="w-[1220px] h-[236px] mt-[24px] bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl shadow-2xs px-[24px]"> {/* Bagian identitas mahasiswa */}
                <div className="w-[1172px] h-[44px] mt-[24px] flex"> {/* Bagian nama, nim, IE status current year, dan IE status wisuda dari mahasiswa */}
                    <div className="w-[882px] h-[44px]"> {/* Nama mahasiswa dan NIM-nya */}
                        <h1 className="text-[18px]">{student.student_name}</h1>
                        <p className="text-[13px] text-[#64748B]">{student.nim}</p>
                    </div>

                    <div className="w-[290px] h-[44px] flex gap-[48px]"> {/* Untuk IE status current year, dan IE status wisuda */}
                        <div className="w-[136px] h-[44px]"> {/*Untuk IE status (current year)*/}
                            <p className="text-[12px] text-[#64748B]">IE Status (Current Year)</p>
                            {student.ie_status ? 
                                <div className="w-[56px] h-[21px] bg-[#DCFCE7] rounded-2xl flex items-center justify-center">
                                    <p className="text-[11px] text-[#15803D] font-bold">TRUE</p>
                                </div> 
                                :
                                <div className="w-[56px] h-[21px] bg-[#FEF2F2] rounded-2xl flex items-center justify-center">
                                    <p className="text-[11px] text-[#B42318] font-bold">FALSE</p>
                                </div>      
                            }
                        </div>
                        <div className="w-[106px] h-[44px]"> {/*Untuk IE status wisuda */}
                            <p className="text-[12px] text-[#64748B]">IE Status (Wisuda)</p>
                            {student.ie_status_wisuda ?
                                <div className="w-[56px] h-[21px] bg-[#DCFCE7] rounded-2xl flex items-center justify-center">
                                    <p className="text-[11px] text-[#15803D] font-bold">TRUE</p>
                                </div> 
                                :
                                <div className="w-[56px] h-[21px] bg-[#FEF2F2] rounded-2xl flex items-center justify-center">
                                    <p className="text-[11px] text-[#B42318] font-bold">FALSE</p>
                                </div>                                
                            }    
                        </div>
                    </div>
                </div>

                <div className="mt-[24px]"> {/* Garis pembatas */}
                    <hr className="w-[1172px] border border-[#E2E8F0]"/>
                </div> 
 
                <div className="flex w-[1172px] h-[38px] mt-[24px] gap-[48px]"> {/* bagian program department, dan campus*/}
                    <div className="w-[562px] h-[38px]"> {/* Bagian Program Department */}
                        <p className="text-[12px] text-[#64748B]">Program Department</p>
                        <p className="text-[14px] text-[#0F172A] font-semibold">{student.program_department}</p>
                    </div>
                    <div className="w-[562px] h-[38px]"> {/* Baigan Campus */}
                        <p className="text-[12px] text-[#64748B]">Campus</p>
                        <p className="text-[14px] text-[#0F172A] font-semibold">{student.campus}</p>
                    </div>
                </div>
            </div>

            <div className="w-[1220px] border border-[#E2E8F0] rounded-xl shadow-2xs mt-[24px]"> {/* Bagian Participation History */}
                <div className="flex h-[34px] bg-[#FFFFFF] gap-[886px] px-[24px] mt-[20px] mb-[20px]"> {/* Bagian title "Participation Historly", dan button "add IE event" */}
                    <div className="w-[164px] h-[21px] mt-[6.5px]"> {/* Bagian title "Participation History" */}
                        <h1 className="text-[17px] text-[#0F172A]">Participation History</h1>
                    </div>
                    <div className="flex w-[120px] h-[34px] bg-[#2563EB] rounded-xl justify-center items-center"> {/* Bagian button "add IE event" */}
                        <p className="text-[#FFFFFF] text-[13px] font-semibold">+ Add IE Event</p>
                    </div>
                </div>

                <div className="mt-[20px] border-[#E2E8F0]"> {/* Bagian tabel */}
                    <table>
                        <thead>
                            <tr className="bg-[#F8FAFC] h-[42px]">
                                <th className="w-[374px] pt-[14px] pb-[15px] text-left border-b border-t border-[#ddd]">
                                    <p className="ml-[24px] text-[#64748B] text-[11px]">EVENT NAME</p>
                                </th>
                                <th className="w-[304px] pt-[14px] pb-[15px] text-left border-b border-t border-[#ddd]">
                                    <p className="ml-[24px] text-[#64748B] text-[11px]">EVENT YEAR</p>
                                </th>
                                <th className="w-[304px] pt-[14px] pb-[15px] text-left border-b border-t border-[#ddd]">
                                    <p className="ml-[24px] text-[#64748B] text-[11px]">EVENT LOCATION</p>
                                </th>
                                <th className="w-[100px] pt-[14px] pb-[15px] text-center border-b border-t border-[#ddd]">                                  
                                    <p className="text-[#64748B] text-[11px]">ACTION</p>
                                </th>
                            </tr>
                        </thead>
                        
                        <tbody>
                            {participations.map((event) => (
                            <tr key={event.id}>
                                <td className="h-[58px] border-b border-[#ddd] pt-[19.5px] pb-[19.5px] text-left">
                                    <p className="ml-[24px] text-[14px] font-semibold text-[#0F172A]">{event.event.event_name}</p>    
                                </td>
                                <td className="h-[58px] border-b border-[#ddd] pt-[21px] pb-[18px] text-left">
                                    <p className="ml-[24px] text-[14px] text-[#64748B]">{event.event.event_year}</p>
                                </td>
                                <td className="h-[58px] border-b border-[#ddd] pt-[15px] pb-[24px] text-left">
                                    <p className="ml-[24px] text-[14px] text-[#64748B]">{event.event.event_location ?? "Not specified"}</p>
                                </td>
                                <td className="h-[53px] border-b border-[#ddd] px-[10px] align-middle">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            type="button"
                                            title="Edit event"
                                            className="inline-flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-[6px] bg-[#f0f4f8] text-[#43546b] hover:bg-[#e2eaf3] hover:cursor-pointer"
                                            style={actionButtonStyle}
                                            onClick={() => {
                                                setSelectedParticipation(event);
                                                setShowEditParticipationForm(true);
                                            }}
                                        >
                                            <Image src={edit_icon} alt="editIcon"/>
                                        </button>
                                        <button
                                            type="button"
                                            title="Delete event"
                                            className="inline-flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-[6px] bg-[#ffe6e6] text-[#fa2828] hover:bg-[#ffd4d4] hover:cursor-pointer"
                                            style={actionButtonStyle}
                                            onClick={() => {
                                                setSelectedParticipation(event);
                                                setShowDeleteParticipationConfirmation(true);
                                            }}
                                        >
                                            <Image src={delete_icon} alt="deleteIcon"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="ml-[24px] mt-[14px] mb-[14px]">
                    <p className="text-[12px] text-[#64748B]">Showing 4 of 4 participation records</p>
                </div>
            </div>
        </div>

        {showDeleteParticipationConfirmation && selectedParticipation ? 
            (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
                    <div className="w-[420px] rounded-xl bg-white p-6 shadow-xl">

                        {/* Modal Header */}
                        <h2 className="text-[18px] font-semibold text-[#0F172A]">Delete IE Event?</h2>

                        {/* Modal Description */}
                        <p className="mt-3 text-[14px] leading-6 text-[#64748B]">
                            Are you sure you want to delete this student's
                            participation in:
                        </p>

                        {/* Selected Event */}
                        <div className="mt-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                            <p className="text-[14px] font-semibold text-[#0F172A]">{selectedParticipation.event.event_name}</p>
                            <p className="mt-1 text-[13px] text-[#64748B]">
                                {selectedParticipation.event.event_year}
                                {" · "}
                                {selectedParticipation.event.event_location ?? "Not specified"}
                            </p>
                        </div>

                        <p className="mt-3 text-[12px] text-[#DC2626]">This action cannot be undone.</p>

                        {/* Modal Actions */}
                        <form action={deleteParticipationAction}>
                            <input
                                type="hidden"
                                name="participationId"
                                value={selectedParticipation.id}
                            />

                            <div className="mt-6 flex justify-end gap-3">
                                {/* Cancel Button */}
                                <button
                                    type="button"
                                    disabled={isDeleteParticipationPending}
                                    onClick={() => {
                                        setShowDeleteParticipationConfirmation(false);
                                        setSelectedParticipation(null);
                                    }}
                                    className="h-[38px] rounded-lg border border-[#CBD5E1] px-4 text-[13px] font-semibold text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                {/* Delete Button */}
                                <button
                                    type="submit"
                                    disabled={isDeleteParticipationPending}
                                    className="h-[38px] min-w-[120px] rounded-lg bg-[#DC2626] px-4 text-[13px] font-semibold text-white hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isDeleteParticipationPending ? "Deleting..." : "Delete Event"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )
            :
            null
        }

        {/* Edit IE Event Modal */}
        {showEditParticipationForm && selectedParticipation ? 
            (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
                    <div className="w-[480px] rounded-xl bg-white p-6 shadow-xl">
                        {/* Modal Header */}
                        <h2 className="text-[18px] font-semibold text-[#0F172A]">Edit IE Event</h2>
                        <p className="mt-2 text-[13px] text-[#64748B]">Update the student's event participation information.</p>

                        {/* Edit Form */}
                        <form action={editParticipationAction}>
                            {/* Participation UUID */}
                            <input
                                type="hidden"
                                name="participationId"
                                value={selectedParticipation.id}
                            />

                            {/* Event Name */}
                            <div className="mt-5">
                                <label
                                    htmlFor="editEventName"
                                    className="mb-2 block text-[13px] font-semibold text-[#334155]"
                                >
                                    Event Name
                                </label>

                                <input
                                    id="editEventName"
                                    type="text"
                                    name="eventName"
                                    defaultValue={selectedParticipation.event.event_name}
                                    required
                                    maxLength={255}
                                    disabled={isEditParticipationPending}
                                    className="h-[42px] w-full rounded-lg border border-[#CBD5E1] px-3 text-[13px] text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] disabled:bg-[#F8FAFC]"
                                />
                            </div>

                            {/* Event Year */}
                            <div className="mt-4">
                                <label
                                    htmlFor="editEventYear"
                                    className="mb-2 block text-[13px] font-semibold text-[#334155]"
                                >
                                    Event Year
                                </label>

                                <input
                                    id="editEventYear"
                                    type="number"
                                    name="eventYear"
                                    defaultValue={selectedParticipation.event.event_year}
                                    min={1900}
                                    max={2200}
                                    required
                                    disabled={isEditParticipationPending}
                                    className="h-[42px] w-full rounded-lg border border-[#CBD5E1] px-3 text-[13px] text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] disabled:bg-[#F8FAFC]"
                                />
                            </div>

                            {/* Event Location */}
                            <div className="mt-4">
                                <label
                                    htmlFor="editEventLocation"
                                    className="mb-2 block text-[13px] font-semibold text-[#334155]"
                                >
                                    Event Location
                                </label>

                                <input
                                    id="editEventLocation"
                                    type="text"
                                    name="eventLocation"
                                    defaultValue={selectedParticipation.event.event_location ?? ""}
                                    maxLength={255}
                                    disabled={isEditParticipationPending}
                                    placeholder="Enter event location"
                                    className="h-[42px] w-full rounded-lg border border-[#CBD5E1] px-3 text-[13px] text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] disabled:bg-[#F8FAFC]"
                                />
                            </div>

                            {/* Modal Actions */}
                            <div className="mt-7 flex justify-end gap-3">
                                {/* Cancel Button */}
                                <button
                                    type="button"
                                    disabled={isEditParticipationPending}
                                    onClick={() => {
                                        setShowEditParticipationForm(false);
                                        setSelectedParticipation(null);
                                    }}
                                    className="h-[38px] rounded-lg border border-[#CBD5E1] px-4 text-[13px] font-semibold text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                {/* Update Button */}
                                <button
                                    type="submit"
                                    disabled={isEditParticipationPending}
                                    className="h-[38px] min-w-[120px] rounded-lg bg-[#2563EB] px-4 text-[13px] font-semibold text-white hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isEditParticipationPending ? "Updating..." : "Update Event"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )
            :
            null
        }
        
        {toast ? 
            (
                <ToastNotification
                type={toast.type}
                message={toast.message}
                onClose={closeToast}
                />
            )
            :
            null
        }
        </>
    ); 
}