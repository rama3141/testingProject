"use client";
{/* class dari NextJS */}
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation"

{/* Untuk React hook */}
import React, { useRef, useState, useActionState, useEffect, useCallback} from "react";

{/* Untuk image, icon */}
import studentCountIcon from "@/public/people_icon.png"
import clockIcon from "@/public/clock_icon.png"
import chooseFileIcon from "@/public/choose_file_icon.png"
import uploadIcon from "@/public/upload_icon.png"
import searchIcon from "@/public/search_icon.png"
import singleUpdateIcon from "@/public/single_update_icon.png"
import registerStudenrIcon from "@/public/register_student_icon.png"

{/* navbar dropdown dari shadCN */}
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

{/* untuk custom function */}
import { 
  getStudentByNim,
  handleSubmitSingleUpdate, 
  handleFormUploadBulkAction,
  handleRegisterStudentBulk 
} from "@/lib/customFunction/ieServerActions";

import { handleResetAllTableData } from "@/lib/customFunction/developerServerActions";

{/* Untuk Pop Up massage */}
import ToastNotification from "./ToastNotification";

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

type IEMonitoringClientProps = {
  students: Student[];
};

type ToastState = {
  type: "success" | "error";
  message: string;
};

const singleUpdateFormFields = [
  { id: "nim"        , label: "NIM (Student ID)", type: "text", placeholder: "Enter NIM..."               },
  { id: "studentName", label: "Student Name"    , type: "text", placeholder: "Student name"               },
  { id: "major"      , label: "Major"           , type: "text", placeholder: "Informatika"                },
  { id: "campus"     , label: "Event Location"  , type: "text", placeholder: "Event campus"               },
  { id: "eventName"  , label: "Event Name"      , type: "text", placeholder: "e.g., Global Seminar Series"},
  { id: "eventYear"  , label: "Event Year"      , type: "text", placeholder: "2026"                       }
];

const majorOptions = [
  "Computer Science",
  "Information Systems",
  "Mobile Application and Technology",
  "Information Technology",
  "Digital Business",
  "Business Management",
  "Visual Communication Design"
];

const campusOptions = [
  "Kemanggisan",
  "Alam Sutera"
];

const batchOptions = [
  "2022",
  "2023",
  "2024",
  "2025",
  "2026"
];

const ieStatusOptions = [
  "true",
  "false"
];

/* 
penamaan singkat :
IEP = IE Participation
SU  = Single Update
SR  = Student Registration
*/

export default function IEPage({students,}: IEMonitoringClientProps) { 
  const router = useRouter(); 
  //-----------------------------------------------------------------------------------------------------
  const                                                     [ieParticipationSelectedFile, setIeParticipationSelectedFile] = useState<File | null>(null);
  const                                                                                       ieParticipationFileInputRef = useRef<HTMLInputElement>(null);
  const                                               [isResetIeParticipationFileName, setIsResetIeParticipationFileName] = useState(false);
  const                         [showIeParticipationUploadBulkConfirmation, setShowIeParticipationUploadBulkConfirmation] = useState(false);
  const                                                                                  ieParticipationUploadBulkFormRef = useRef<HTMLFormElement>(null);
  const [processingIeParticipationBulkState, processingIeParticipationBulkAction, isProcessingIeParticipationBulkPending] = useActionState(handleFormUploadBulkAction, null);
  //-----------------------------------------------------------------------------------------------------
  const                                                                           [showSingleUpdate, setShowSingleUpdate] = useState(false);
  const                                                   [showSingleUpdateConfirmation, setShowSingleUpdateConfirmation] = useState(false);
  const                                                                                               singleUpdateFormRef = useRef<HTMLFormElement>(null);
  const                                                                                 singleUpdateBypassConfirmationRef = useRef(false);
  const                                                                                                     [nim, setNim] = useState("");
  const                                                                                     [studentName, setStudentName] = useState("");
  const                                                                                                 [major, setMajor] = useState("");
  const                                                                     [studentLookupStatus, setStudentLookupStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const                                                                   [studentLookupMessage, setStudentLookupMessage] = useState("");
  const                                                    [singleUpdateState, singleUpdateAction, isSingleUpdatePending] = useActionState(handleSubmitSingleUpdate, null);
  //-----------------------------------------------------------------------------------------------------
  const                                                   [showStudentRegistModalDialog, setshowStudentRegistModalDialog] = useState(false);
  const                                                         [studentRegistSelectedFile, setStudentRegistSelectedFile] = useState<File | null>(null);
  const                                                                                         studentRegistFileInputRef = useRef<HTMLInputElement>(null);
  const                                                   [isResetStudentRegistFileName, setIsResetStudentRegistFileName] = useState(false);
  const                             [showStudentRegistUploadBulkConfirmation, setShowStudentRegistUploadBulkConfirmation] = useState(false);
  const                                                                                    studentRegistUploadBulkFormRef = useRef<HTMLFormElement>(null);
  const       [processingStudentRegistBulkState, processingStudentRegistBulkAction, isProcessingStudentRegistBulkPending] = useActionState(handleRegisterStudentBulk, null);
  //-----------------------------------------------------------------------------------------------------
  const                                                                                 [selectedMajor, setSelectedMajor] = useState<string | null>(null);
  const                                                                               [selectedCampus, setSelectedCampus] = useState<string | null>(null);
  const                                                                                 [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const                                                                           [selectedIEStatus, setSelectedIEStatus] = useState<boolean | null>(null);
  const                                                                                     [searchQuery, setSearchQuery] = useState("");
  //-----------------------------------------------------------------------------------------------------
  const [showResetAllTableDataConfirmation, setShowResetAllTableDataConfirmation] = useState(false);
  const [processingResetAllTableDataState, processingResetAllTableDataAction, isProcessingResetAllTableDataPending] = useActionState(handleResetAllTableData, null);
  //-----------------------------------------------------------------------------------------------------
  const                                                                                                 [toast, setToast] = useState<ToastState | null>(null);
  //-----------------------------------------------------------------------------------------------------
  
  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  function handleIeParticipationChooseFile() {
    ieParticipationFileInputRef.current?.click();
    console.log(ieParticipationFileInputRef);
    setIsResetIeParticipationFileName(false);
  }

  function handleStudentRegistChooseFile() {
    studentRegistFileInputRef.current?.click();
    console.log(studentRegistFileInputRef);
    setIsResetStudentRegistFileName(false);
  }

  function handleIeParticipationFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIeParticipationSelectedFile(file);
  }

  function handleStudentRegistFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setStudentRegistSelectedFile(file);
  }

  const filteredStudents = students.filter((student) => {
    // Search by NIM or student name
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesSearch =
      normalizedQuery === "" ||
      student.nim.toLowerCase().includes(normalizedQuery) ||
      student.student_name.toLowerCase().includes(normalizedQuery);

    const matchesMajor =
      selectedMajor === null ||
      student.program_department === selectedMajor;

    const matchesCampus =
      selectedCampus === null ||
      student.campus === selectedCampus;

    const matchesBatch =
      selectedBatch === null ||
      student.binusian_batch === selectedBatch;

    const matchesIEStatus =
      selectedIEStatus === null ||
      student.ie_status === selectedIEStatus;

    return (
      matchesSearch &&
      matchesMajor &&
      matchesCampus &&
      matchesBatch &&
      matchesIEStatus
    );
  });



  useEffect(() => {
    if (singleUpdateState?.success === true) {
      router.refresh();
    }
  }, [singleUpdateState, router]);

  useEffect(() => {
    if (processingIeParticipationBulkState?.success === true) {
      router.refresh();
    }
  }, [processingIeParticipationBulkState, router]);

  useEffect(() => {
    if (processingStudentRegistBulkState?.success === true) {
      router.refresh();
    }
  }, [processingStudentRegistBulkState, router])

  useEffect(() => { // ONLY FOR DEVELOPER / HANYA UNTUK DEVELOPER, NOT A REAL FEATURE AT DEPLOYED STAGE.
    if (processingResetAllTableDataState?.success === true) {
      router.refresh();
    }
  }, [processingResetAllTableDataState, router])



  useEffect(() => {
    if (singleUpdateState?.success === true) {
      setToast({
        type: "success",
        message:
          singleUpdateState.message ??
          "Student status updated successfully.",
      });
    } else if (singleUpdateState?.success === false) {
      setToast({
        type: "error",
        message:
          singleUpdateState.message ??
          "Failed to update student status.",
      });
    }
  }, [singleUpdateState]);

  useEffect(() => {
    if (processingIeParticipationBulkState?.success === true) {
      setToast({
        type: "success",
        message:
          processingIeParticipationBulkState.message ??
          "Bulk upload completed successfully.",
      });
      setIsResetIeParticipationFileName(true);
      setIeParticipationSelectedFile(null);
    } else if (processingIeParticipationBulkState?.success === false) {
      setToast({
        type: "error",
        message:
          processingIeParticipationBulkState.message ??
          "Bulk upload failed.",
      });
      setIsResetIeParticipationFileName(true);
      setIeParticipationSelectedFile(null);
    }
  }, [processingIeParticipationBulkState]);

  useEffect(() => {
    if (processingStudentRegistBulkState?.success === true) {
      setToast({
        type: "success",
        message:
          processingStudentRegistBulkState.message ??
          "Bulk upload completed successfully.",
      });
      setIsResetIeParticipationFileName(true);
      setIeParticipationSelectedFile(null);
    } else if (processingStudentRegistBulkState?.success === false) {
      setToast({
        type: "error",
        message:
          processingStudentRegistBulkState.message ??
          "Bulk upload failed.",
      });
      setIsResetIeParticipationFileName(true);
      setIeParticipationSelectedFile(null);
    }
  }, [processingStudentRegistBulkState]); 

  useEffect(() => { // ONLY FOR DEVELOPER / HANYA UNTUK DEVELOPER, NOT A REAL FEATURE AT DEPLOYED STAGE.
    if (processingResetAllTableDataState?.success === true) {
      setShowResetAllTableDataConfirmation(false);
      setToast({
        type: "success",
        message:
          processingResetAllTableDataState.message ??
          "Success at reseting all table data.",
      });
    } else if (processingResetAllTableDataState?.success === false) {
      setToast({
        type: "error",
        message:
          processingResetAllTableDataState.message ??
          "Reset table data failed.",
      });
    }
  }, [processingResetAllTableDataState]); 

  useEffect(() => {
    // Clear the previous result whenever the NIM is incomplete.
    if (!/^\d{10}$/.test(nim)) {
      setStudentName("");
      setMajor("");
      setStudentLookupMessage("");
      setStudentLookupStatus("idle");
      return;
    }

    let ignoreResult = false;

    async function lookupStudent() {
      setStudentLookupStatus("loading");
      setStudentLookupMessage("Searching for student...");

      // Clear the previous student's information while searching.
      setStudentName("");
      setMajor("");

      try {
        const result = await getStudentByNim(nim);

        // Ignore a result if the NIM changed while the request was running.
        if (ignoreResult) return;

        if (result.success && result.student) {
          setStudentName(result.student.studentName);
          setMajor(result.student.major); 

          setStudentLookupStatus("success");
          setStudentLookupMessage("Student found.");
        } else {
          setStudentName("");
          setMajor("");

          setStudentLookupStatus("error");
          setStudentLookupMessage(result.message);
        }
      } catch (error) {
        if (ignoreResult) return;

        console.error("Student lookup error:", error);

        setStudentName("");
        setMajor("");

        setStudentLookupStatus("error");
        setStudentLookupMessage(
          "Unable to search for the student. Please try again."
        );
      }
    }

    lookupStudent();

    return () => {
      ignoreResult = true;
    };
  }, [nim]);

  const completedIE = students.filter( (student) => student.ie_status ).length;
  const completedIEPercentage = (students.length === 0 ? 0 : Math.round((completedIE / students.length) * 100));

  return (
    <>
    <div className="w-[1400px] ml-[7.847vw] mt-[72px] mb-[348px]"> {/*move all content 7.847% of screen width from the browser left*/} 
      
      <div className="flex items-center justify-between w-[866px] h-[100px] py-3"> {/* upper content */}
        <div> {/*Left Section*/}
          <h1 className="text-[32px] font-bold">IE Monitoring</h1>
          <p className="text-[14px] text-gray-500">Track and manage student IE completion status</p>
        </div>
        <div className="flex"> {/*Right Section*/}
          <div className="flex h-[70px] items-center gap-3 px-4 border border-[#E2E8F0] rounded-2xl"> {/*Total Students*/}
            <div className="flex h-15 w-15 items-center justify-center"> {/*People Icon*/}
              <Image src={studentCountIcon} alt="PeopleIcon" width={60} height={60}/>
            </div> 
            <div> {/*description*/}
              <div className="font-bold text-[24px]">{students.length}</div>
              <div className="text-[13px] text-gray-500">Total</div>
              <div className="text-[13px] text-gray-500">Students</div>
            </div>
          </div>
          <div className="flex h-[70px] items-center gap-3 px-4 border border-[#E2E8F0] rounded-2xl"> {/*Completed IE*/}
            <div> {/*Clock Icon*/}
              <Image src={clockIcon} alt="ClockIcon" width={60} height={60}></Image>
            </div>
            <div> {/*description*/}
              <div className="font-bold text-[24px]">{completedIEPercentage}%</div>
              <div className="text-[13px] text-gray-500">Completed IE</div>
              <div className="text-[13px] text-gray-500">(Year)h</div>
            </div>
          </div>
        </div> 
      </div> {/* upper content */}

      <div className="mt-4 flex gap-[157px]"> {/* Bagian Upload Bulk dan Single Update */}
        <form
          ref={ieParticipationUploadBulkFormRef} 
          action={processingIeParticipationBulkAction} 
          className="flex items-center gap-9"
        > {/*Bagian Upload Bulk*/}
          {/* hidden file input*/}
          <input
            ref={ieParticipationFileInputRef}
            name="ieParticipationInputFile"
            type="file"
            accept=".csv, .xls, .xlsx"
            className="hidden"
            onChange={handleIeParticipationFileChange}
          />

          {/* choose file button */}
          <button
            type="button"
            onClick={handleIeParticipationChooseFile}
            className="flex h-[58px] w-[148px] items-center justify-center gap-2 rounded-xl border-2 border-[#2563EB] px-4 font-semibold text-[#1E293B] hover:cursor-pointer"
          >
            {ieParticipationSelectedFile && !isResetIeParticipationFileName ? (
              <span className="max-w-[100px] truncate">
                {ieParticipationSelectedFile.name}
              </span>
            ): (
              <>
                <span>Choose File</span>
                <Image src={chooseFileIcon} alt="chooseFileIcon" width={28} height={28}/>
              </>
            )}
          </button>

          {/* upload Bulk button */}
          <button
            type="button"
            disabled={!ieParticipationSelectedFile || isProcessingIeParticipationBulkPending || isResetIeParticipationFileName}
            onClick={() => setShowIeParticipationUploadBulkConfirmation(true)}
            className={`flex h-[58px] w-[180px] items-center justify-center gap-2 rounded-xl px-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer 
                       ${isProcessingIeParticipationBulkPending ? "bg-[#636465]" : "bg-[#2563EB]"}`}
          >
            <div className="flex gap-[12px]">
              <div>
                <Image src={uploadIcon} alt="uploadIcon"/>
              </div>
              <div>
                <p>{isProcessingIeParticipationBulkPending ? "processing..." : "Upload bulk"}</p>
              </div>
            </div>
          </button>
        </form> {/*Bagian Upload Bulk*/}

        <div className="flex gap-[32px]"> {/* Single Update */}
          <button
            type="button"
            onClick={() => {
              singleUpdateBypassConfirmationRef.current = false;
              setShowSingleUpdateConfirmation(false);
              setShowSingleUpdate(true)
            }}
            className="w-[180px] h-[56px] border border-[#CAD5E2] rounded-xl shadow-2xl hover:cursor-pointer"
          >
            <div className="flex justify-center items-center gap-[8px]">
              <div>
                <Image src={singleUpdateIcon} alt="singleUpdateIcon"/>
              </div>
              <div> 
                <p className="font-semibold text-[13.8px]">Single Update</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setshowStudentRegistModalDialog(true)
            }}
            className="w-[180px] h-[56px] border border-[#CAD5E2] rounded-xl shadow-2xl hover:cursor-pointer"
          >
            <div className="flex justify-center items-center gap-[8px]">
              <div>
                <Image src={registerStudenrIcon} alt="singleUpdateIcon"/>
              </div>
              <div> 
                <p className="font-semibold text-[13.8px]">Register Student</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowResetAllTableDataConfirmation(true);
            }}
            className="inline-flex h-[56px] shrink-0 items-center justify-center rounded-[6px] bg-[#fa2828] hover:cursor-pointer hover:bg-[#771010]"
          >
            <div className="flex justify-center items-center gap-[8px]">
              <div> 
                <p className="font-semibold text-[13.8px] text-[#FFFFFF]">Reset Data</p>
                <p className="font-bold text-[8px] text-[#FFD700]">(Only for developer)</p>
              </div>
            </div>
          </button>
        </div> {/* Single Update */}
      </div> {/* Bagian Upload Bulk dan Single Update */}
      
      <div className="flex mt-[32px] gap-[20px]"> {/* Searching Bar, Filter dropdown, dan reset filter*/}
        <div className="flex gap-[378px]"> {/* Searchnig bar dan filter*/}
          <div className="border w-[400px] h-[44px] rounded-xl relative border-[#E2E8F0]"> {/* Search Bar Text Input*/}
            <div className="px-[20px] py-[2px]">
              <input 
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)} 
                placeholder="Search by NIM or name..."
                className="outline-none w-[380px]"
              />
            </div>
            {/* <input type="text" placeholder="Search by NIM or name..."/> */}
            <div className="absolute top-[10px] px-[5px]"> {/* Search bar icon */}
              <Image src={searchIcon} alt="searchIcon"/>
            </div>
          </div>
          
          <div> {/*Filters Dropdown*/}
            <NavigationMenu>
              <NavigationMenuList className="gap-[8px]">
      
                <NavigationMenuItem className="w-[92px] border border-[#E2E8F0] rounded-xl">
                  <NavigationMenuTrigger>Major</NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-[#FFFFFF] rounded-lg">
                    {majorOptions.map((option) => (
                      <NavigationMenuLink 
                        key={option}
                        onClick={() => setSelectedMajor(option)}
                        className="cursor-pointer font-bold hover:bg-blue-500 hover:text-white hover:font-bold"
                      >
                        {option}
                      </NavigationMenuLink>
                    ))}
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem className="w-[109px] border border-[#E2E8F0] rounded-xl">
                  <NavigationMenuTrigger>Campus</NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-[#FFFFFF] rounded-lg">
                    {campusOptions.map((option) => (
                      <NavigationMenuLink 
                        key={option}
                        onClick={() => setSelectedCampus(option)}
                        className="cursor-pointer font-bold hover:bg-blue-500 hover:text-white hover:font-bold"
                      >
                        {option}
                      </NavigationMenuLink>
                    ))}
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem className="w-[93px] border border-[#E2E8F0] rounded-xl">
                  <NavigationMenuTrigger>Batch</NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-[#FFFFFF] rounded-lg">
                    {batchOptions.map((option) => (
                      <NavigationMenuLink 
                        key={option}
                        onClick={() => setSelectedBatch(option)}
                        className="cursor-pointer font-bold hover:bg-blue-500 hover:text-white hover:font-bold"
                      >
                        {option}
                      </NavigationMenuLink>
                    ))}
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem className="w-[103px] border border-[#E2E8F0] rounded-xl">
                  <NavigationMenuTrigger>IE Status</NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-[#FFFFFF] rounded-lg">
                    {ieStatusOptions.map((option) => (
                      <NavigationMenuLink
                        key={option}
                        onClick={() => setSelectedIEStatus(option === "true")}
                        className="cursor-pointer font-bold hover:bg-blue-500 hover:text-white hover:font-bold"
                      >
                        {option.toUpperCase()}
                      </NavigationMenuLink>
                    ))}
                  </NavigationMenuContent>
                </NavigationMenuItem>

              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setSearchQuery("");
            setSelectedMajor(null);
            setSelectedCampus(null);
            setSelectedBatch(null);
            setSelectedIEStatus(null);
          }}
          className="rounded-lg px-3 py-2 bg-[#ec0c0c] "
        >
          <p className="font-bold text-[#FFFFFF] text-[12px]">Clear Filters</p>
        </button>
      </div>

      <div className="mt-[8px] w-[1214px] overflow-hidden border border-[#E2E8F0] rounded-xl">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8FAFC] text-[13px] text-[#64748B]">
              <th className="w-[100px] p-[8px] text-left">NIM</th> 
              <th className="w-[200px] p-[8px] text-left">NAME</th> 
              <th className="w-[200px] p-[8px] text-left">MAJOR</th> 
              <th className="w-[100px] p-[8px] text-left">CAMPUS</th> 
              <th className="w-[50px] p-[8px] text-left">IE STATUS</th>
              <th className="w-[100px] p-[8px] text-left">IE STATUS WISUDA</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.length > 0 ? 
              (
                filteredStudents.map((student) => (
                  <tr key={student.nim}>
                    <td className="border border-[#ddd] p-[8px] text-left">
                      <Link href={`./ie/${student.nim}`}>{student.nim}</Link>
                    </td>
                    <td className="border border-[#ddd] p-[8px] text-left">{student.student_name}</td>
                    <td className="border border-[#ddd] p-[8px] text-left">{student.program_department}</td>
                    <td className="border border-[#ddd] p-[8px] text-left">{student.campus}</td>
                    <td className="border border-[#ddd] p-[8px] text-left">
                      <div className={`flex w-[57px] h-[23px] ${student.ie_status ? "bg-[#DCFCE7]" : "bg-[#F3F4F6]"} rounded-3xl justify-center items-center`}>
                          <p className={`text-[12px] font-bold ${student.ie_status ? "text-[#166534]" : "text-[#B42318]"}`}>{student.ie_status ? "TRUE" : "FALSE"}</p>
                      </div>
                    </td>
                    <td className="border border-[#ddd] p-[8px] text-left">
                      <div className={`flex w-[57px] h-[23px] ${student.ie_status_wisuda ? "bg-[#DCFCE7]" : "bg-[#F3F4F6]"} rounded-3xl justify-center items-center`}>
                          <p className={`text-[12px] font-bold ${student.ie_status_wisuda ? "text-[#166534]" : "text-[#B42318]"}`}>{student.ie_status_wisuda ? "TRUE" : "FALSE"}</p>
                      </div>
                    </td>
                  </tr>
                ))  
              )
              :
              (
                <tr>
                  <td
                    colSpan={6}
                    className="border border-[#ddd] p-6 text-center text-gray-500"
                  >
                    No students found.
                  </td>
                </tr>
              )
            }
          </tbody>
        </table>
      </div>
    </div> 
    
    {/* Bagian pop up confirmation modal dialog untuk upload bulk */}
    {showIeParticipationUploadBulkConfirmation ? 
      (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowIeParticipationUploadBulkConfirmation(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-confirmation-title"
            className="w-[480px] overflow-hidden rounded-2xl bg-white shadow-xl"
          >
            {/* Modal Header */}
            <div className="flex h-[76px] items-center justify-between border-b border-[#E2E8F0] px-[28px]">
              <h2 id="upload-confirmation-title" className="text-[20px] font-semibold text-[#0F172A]">Confirm Bulk Upload</h2>

              <button
                type="button"
                onClick={() => setShowIeParticipationUploadBulkConfirmation(false)}
                aria-label="Close confirmation dialog"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-[28px] py-[28px]">
              <p className="text-[14px] leading-6 text-[#475569]">
                Are you sure you want to upload this file? The system will
                process its contents and update the IE Monitoring data.
              </p>

              {/* Selected File Information */}
              <div className="mt-[20px] rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-[16px]">
                <p className="text-[12px] font-semibold text-[#64748B]">
                  SELECTED FILE
                </p>

                <p
                  className="mt-[6px] break-words text-[14px] font-semibold text-[#0F172A]"
                >
                  {ieParticipationSelectedFile?.name ?? "No file selected"}
                </p>
              </div>

              <p className="mt-[16px] text-[12px] text-[#64748B]">
                Please make sure you have selected the correct file before
                proceeding.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex h-[76px] items-center justify-end gap-[12px] border-t border-[#E2E8F0] bg-[#F8FAFC] px-[28px]">
              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => setShowIeParticipationUploadBulkConfirmation(false)}
                className="h-[38px] rounded-xl border border-[#CAD5E2] bg-white px-[18px] text-[13px] font-semibold text-[#334155] hover:bg-slate-100"
              >
                Cancel
              </button>

              {/* Confirm Upload Button */}
              <button
                type="button"
                disabled={!ieParticipationSelectedFile}
                onClick={() => {
                  setShowIeParticipationUploadBulkConfirmation(false);
                  ieParticipationUploadBulkFormRef.current?.requestSubmit();
                }}
                className="h-[38px] rounded-xl bg-[#2563EB] px-[18px] text-[13px] font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirm Upload
              </button>
            </div>
          </div>
        </div>
      )
      :
      null
    }

    {/* Bagian Modal dialog untuk Single Update */}
    {showSingleUpdate ? 
      (
      <div className="fixed inset-0 z-50 bg-black/50">
        <div className="flex min-h-screen items-center justify-center">
          <div className="w-[520px] overflow-hidden rounded-2xl bg-white shadow-xl">
              {/* Bagian Ttile dan close button */}
              <div className="w-[520px] h-[80px] border border-[#E2E8F0] flex items-center">
                <div className="ml-[28px]"> {/* Title */}
                  <p className="text-[22px] text-[#0F172A] font-semibold">Single Update IE Status</p>
                </div> {/* Title */}
                
                <div className="ml-[192px]"> {/* button close */}
                  <button
                    type="button"
                    onClick={() => setShowSingleUpdate(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                  >
                    x
                  </button>
                </div> {/* button close */}
              </div>
              {/* Bagian Ttile dan close button */}

              {/* Bagian Form pengisian */} 
              <div className="mt-[10px]">
                <form 
                  ref={singleUpdateFormRef}
                  action={singleUpdateAction}
                  onSubmit={(event) => {
                    if (singleUpdateBypassConfirmationRef.current) {
                      singleUpdateBypassConfirmationRef.current = false;
                      return;
                    }

                    event.preventDefault();
                    setShowSingleUpdateConfirmation(true);
                  }}  
                >
                  <div className="px-[28px]">
                    <div className="w-[464px]"> {/* Bagian STUDENT INFORMATION */}
                      <div className="flex items-center gap-[8px]">
                        <h3 className="text-[#2563EB] text-[23px] font-bold">•</h3>
                        <h3 className="text-[#2563EB] text-[12px] font-bold">STUDENT INFORMATION</h3>
                      </div>
 
                      <div className="mt-[4px]"> {/* Bagian field NIM */}
                        <label 
                          htmlFor={singleUpdateFormFields[0].id} 
                          className="text-[13px] font-semibold"
                        >
                          {singleUpdateFormFields[0].label}
                        </label>
                        <div className="flex w-[464px] h-[42px] mt-[8px] border border-[#E2E8F0] rounded-xl">
                          <input
                            id={singleUpdateFormFields[0].id} 
                            type={singleUpdateFormFields[0].type}
                            name={singleUpdateFormFields[0].id}
                            placeholder={singleUpdateFormFields[0].placeholder}
                            value={nim}
                            onChange={(event) => {
                              const digitsOnly = event.target.value
                                .replace(/\D/g, "")
                                .slice(0, 10);

                              setNim(digitsOnly);
                            }}
                            inputMode="numeric"
                            pattern="[0-9]{10}"
                            maxLength={10}
                            minLength={10}
                            autoComplete="off"
                            required
                            className="outline-none w-[450px]"
                          />
                          <button
                            type="button"
                            aria-label="Student lookup runs automatically when the NIM reaches 10 digits"
                            className="hover:bg-[#edb10a] hover:cursor-pointer"
                          >
                            <Image src={searchIcon} alt="searchIcon"/>
                          </button>
                        </div>
                      </div> {/* Bagian field NIM */}

                      <div className="flex gap-[12px]"> {/* Bagian field Student Name & Major */}
                        <div> {/* Bagian field Student Name */}
                          <label 
                            htmlFor={singleUpdateFormFields[1].id}
                            className="text-[13px] font-semibold"
                          >
                            {singleUpdateFormFields[1].label}
                          </label>
                          <div className="w-[226px] h-[42px] border border-[#E2E8F0] bg-[#F1F5F9] rounded-xl">
                            <input
                              id={singleUpdateFormFields[1].id} 
                              type={singleUpdateFormFields[1].type}
                              name={singleUpdateFormFields[1].id}
                              placeholder={singleUpdateFormFields[1].placeholder}
                              value={studentName}
                              readOnly
                              required
                              className="outline-none w-[200px]"
                            />
                          </div>
                        </div> {/* Bagian field Student Name */}
                        <div> {/* Bagian field Major */}
                          <label 
                            htmlFor={singleUpdateFormFields[2].id}
                            className="text-[13px] font-semibold"
                          >
                            {singleUpdateFormFields[2].label}
                          </label>
                          <div className="w-[226px] h-[42px] border border-[#E2E8F0] bg-[#F1F5F9] rounded-xl">
                            <input
                              id={singleUpdateFormFields[2].id}
                              type={singleUpdateFormFields[2].type}
                              name={singleUpdateFormFields[2].id}
                              placeholder={singleUpdateFormFields[2].placeholder}
                              value={major}
                              readOnly
                              required
                              className="outline-none w-[200px]"
                            />
                          </div>
                        </div> {/* Bagian field Major */}
                      </div> {/* Bagian field Student Name & Major */}
                      {studentLookupStatus !== "idle" && (
                        <p
                          role="status"
                          aria-live="polite"
                          className={`mt-2 text-[12px] ${
                            studentLookupStatus === "success"
                              ? "text-green-600"
                              : studentLookupStatus === "error"
                                ? "text-red-600"
                                : "text-slate-500"
                          }`}
                        >
                          {studentLookupMessage}
                        </p>
                      )}

                      {studentLookupStatus === "idle" && nim.length > 0 && (
                        <p className="mt-2 text-[12px] text-slate-500">
                          Enter {10 - nim.length} more digit{10 - nim.length === 1 ? "" : "s"}.
                        </p>
                      )}  
                    </div>{/* Bagian STUDENT INFORMATION */}

                    <div className="mt-[20px]"> {/* Bagian Garis Horizontal */}
                      <hr className="w-[464px] border border-[#E2E8F0]"/>
                    </div> {/* Bagian Garis Horizontal */}

                    <div className="mt-[4px] mb-[24px]"> {/* Bagian EVENT DETAILS */}
                      <div className="flex items-center gap-[8px]">
                        <h3 className="text-[#2563EB] text-[23px] font-bold">•</h3>
                        <h3 className="text-[#2563EB] text-[12px] font-bold">EVENT DETAILS</h3>
                      </div>

                      <div className="mt-[16px]"> {/* Bagian field Event Name */}
                        <label 
                          htmlFor={singleUpdateFormFields[4].id}
                          className="text-[13px] font-semibold"
                        >
                          {singleUpdateFormFields[4].label}
                        </label>
                        <div className="w-[464px] h-[42px] border border-[#E2E8F0] rounded-xl">
                          <input 
                            type={singleUpdateFormFields[4].type}
                            name={singleUpdateFormFields[4].id}
                            placeholder={singleUpdateFormFields[4].placeholder}
                            className="outline-none w-[450px]"
                            required 
                          />
                        </div>
                      </div> {/* Bagian field Event Name */}

                      <div className="mt-[16px]"> {/* Bagian field event location */}   
                        <label 
                          htmlFor={singleUpdateFormFields[3].id}
                          className="text-[13px] font-semibold"
                        >
                          {singleUpdateFormFields[3].label}
                        </label>
                        <div className="w-[464px] h-[42px] border border-[#E2E8F0] rounded-xl">
                          <input
                            type={singleUpdateFormFields[3].type}
                            name={singleUpdateFormFields[3].id}
                            placeholder={singleUpdateFormFields[3].placeholder}
                            className="outline-none w-[200px]"
                            required
                          />
                        </div>
                      </div> {/* Bagian field event location */}

                      <div className="mt-[16px]"> {/* Bagian field Event Year */}
                        <label 
                          htmlFor={singleUpdateFormFields[5].id}
                          className="text-[13px] font-semibold"
                        >
                          {singleUpdateFormFields[5].label}
                        </label>
                        <div className="w-[464px] h-[42px] border border-[#E2E8F0] rounded-xl">
                          <input
                            type={singleUpdateFormFields[5].type}
                            name={singleUpdateFormFields[5].id}
                            placeholder={singleUpdateFormFields[5].placeholder}
                            className="outline-none w-[450px]"
                            required
                          />
                        </div>
                      </div> {/* Bagian field Event Year */}
                    </div> {/* Bagian EVENT DETAILS */}
                  </div>

                  <div className="h-[76px] border border-[#E2E8F0] bg-[#F8FAFC] items-center justify-center"> {/* Bagian button "Update Status" */}
                   <div className="mt-[18px] ml-[370px]">
                      <button
                        type="submit"
                        disabled={isSingleUpdatePending}
                        className={`w-[122px] h-[36px] ${isSingleUpdatePending ? "bg-[#828489]" : "bg-[#2563EB]"} rounded-xl`}
                      >
                        {isSingleUpdatePending ? 
                          (<p className="text-[13px] text-[#FFFFFF] font-semibold">Updating...</p>) 
                          : 
                          (<p className="text-[13px] text-[#FFFFFF] font-semibold">Update Status</p>)
                        }
                      </button>
                    </div> 
                  </div>
                </form>
              </div>
              {/* Bagian Form pengisian */}             
          </div>
        </div>
      </div>
      )
      :
      null
    }

    {/* Single Update Confirmation Modal */}
    {showSingleUpdateConfirmation ? 
      (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowSingleUpdateConfirmation(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="single-update-confirmation-title"
            className="w-[480px] overflow-hidden rounded-2xl bg-white shadow-xl"
          >
            {/* Modal Header */}
            <div className="flex h-[76px] items-center justify-between border-b border-[#E2E8F0] px-[28px]">
              <h2
                id="single-update-confirmation-title"
                className="text-[20px] font-semibold text-[#0F172A]"
              >
                Confirm Single Update
              </h2>

              <button
                type="button"
                onClick={() => setShowSingleUpdateConfirmation(false)}
                aria-label="Close confirmation dialog"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-[28px] py-[28px]">
              <p className="text-[14px] leading-6 text-[#475569]">
                Are you sure you want to update this student's IE status?
                Please review the information before proceeding.
              </p>

              <div className="mt-[20px] rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-[16px]">
                <p className="text-[12px] font-semibold text-[#64748B]">
                  ACTION
                </p>

                <p className="mt-[6px] text-[14px] font-semibold text-[#0F172A]">
                  Update Student IE Status
                </p>

                <p className="mt-[6px] text-[12px] leading-5 text-[#64748B]">
                  The submitted student and event information will be
                  processed by the system.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex h-[76px] items-center justify-end gap-[12px] border-t border-[#E2E8F0] bg-[#F8FAFC] px-[28px]">
              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => setShowSingleUpdateConfirmation(false)}
                className="h-[38px] rounded-xl border border-[#CAD5E2] bg-white px-[18px] text-[13px] font-semibold text-[#334155] hover:bg-slate-100"
              >
                Cancel
              </button>

              {/* Confirm Update Button */}
              <button
                type="button"
                onClick={() => {
                  const form = singleUpdateFormRef.current;
                  if (!form) return;

                  // validate the form before allowing submission
                  if (!form.reportValidity()) return;
                  
                  // allow exactly one confirmed form 
                  singleUpdateBypassConfirmationRef.current = true;
                  singleUpdateFormRef.current?.requestSubmit();
                  form.requestSubmit();
                  setShowSingleUpdateConfirmation(false);
                }}
                className="h-[38px] rounded-xl bg-[#2563EB] px-[18px] text-[13px] font-semibold text-white hover:bg-blue-700"
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )
      :
      null
    }

    {showStudentRegistModalDialog ?
      (
      <div className="fixed inset-0 z-50 bg-black/50">
        <div className="flex min-h-screen items-center justify-center">
          <div className="w-[520px] overflow-hidden rounded-2xl bg-white shadow-xl">
              {/* Bagian Ttile dan close button */}
              <div className="w-[520px] h-[80px] border border-[#E2E8F0] flex items-center">
                <div className="ml-[28px]"> {/* Title */}
                  <p className="text-[22px] text-[#0F172A] font-semibold">Student Registration</p>
                </div> {/* Title */}
                
                <div className="ml-[192px]"> {/* button close */}
                  <button
                    type="button"
                    onClick={() => {
                      setshowStudentRegistModalDialog(false)
                      setStudentRegistSelectedFile(null)
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                  >
                    x
                  </button>
                </div> {/* button close */}
              </div>
              {/* Bagian Ttile dan close button */}

              <div className="mb-[32px]"> {/* Garis pembatas */}
                  <hr className="w-[520px] border border-[#E2E8F0]"/>
              </div>

              <div className="px-[28px] mb-[32px]">
                <form
                  ref={studentRegistUploadBulkFormRef} 
                  action={processingStudentRegistBulkAction} 
                  className="flex items-center gap-9"
                > {/*Bagian Upload Bulk*/}
                  {/* hidden file input*/}
                  <input
                    ref={studentRegistFileInputRef}
                    name="registerStudentInputFile"
                    type="file"
                    accept=".csv, .xls, .xlsx"
                    className="hidden"
                    onChange={handleStudentRegistFileChange}
                  />

                  {/* choose file button */}
                  <button
                    type="button"
                    onClick={handleStudentRegistChooseFile}
                    className="flex h-[58px] w-[148px] items-center justify-center gap-2 rounded-xl border-2 border-[#2563EB] px-4 font-semibold text-[#1E293B] hover:cursor-pointer"
                  >
                    {studentRegistSelectedFile && !isResetStudentRegistFileName ? (
                      <span className="max-w-[100px] truncate">
                        {studentRegistSelectedFile.name}
                      </span>
                    ): (
                      <>
                        <span>Choose File</span>
                        <Image src={chooseFileIcon} alt="chooseFileIcon" width={28} height={28}/>
                      </>
                    )}
                  </button>

                  {/* upload Bulk button */}
                  <button
                    type="button"
                    disabled={!studentRegistSelectedFile || isProcessingStudentRegistBulkPending || isResetStudentRegistFileName}
                    onClick={() => setShowStudentRegistUploadBulkConfirmation(true)}
                    className={`flex h-[58px] w-[180px] items-center justify-center gap-2 rounded-xl px-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer 
                              ${isProcessingStudentRegistBulkPending ? "bg-[#636465]" : "bg-[#2563EB]"}`}
                  >
                    <div className="flex gap-[12px]">
                      <div>
                        <Image src={uploadIcon} alt="uploadIcon"/>
                      </div>
                      <div>
                        <p>{isProcessingStudentRegistBulkPending ? "processing..." : "Upload bulk"}</p>
                      </div>
                    </div>
                  </button>
                </form> {/*Bagian Upload Bulk*/}
              </div>
          </div>
        </div>
      </div>
      )
      :
      null
    }

    {/* Bagian pop up confirmation modal dialog untuk upload bulk */}
    {showStudentRegistUploadBulkConfirmation ? 
      (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowStudentRegistUploadBulkConfirmation(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-confirmation-title"
            className="w-[480px] overflow-hidden rounded-2xl bg-white shadow-xl"
          >
            {/* Modal Header */}
            <div className="flex h-[76px] items-center justify-between border-b border-[#E2E8F0] px-[28px]">
              <h2 id="upload-confirmation-title" className="text-[20px] font-semibold text-[#0F172A]">Confirm Bulk Upload</h2>

              <button
                type="button"
                onClick={() => setShowStudentRegistUploadBulkConfirmation(false)}
                aria-label="Close confirmation dialog"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-[28px] py-[28px]">
              <p className="text-[14px] leading-6 text-[#475569]">
                Are you sure you want to upload this file? The system will
                process its contents and update the IE Monitoring data.
              </p>

              {/* Selected File Information */}
              <div className="mt-[20px] rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-[16px]">
                <p className="text-[12px] font-semibold text-[#64748B]">
                  SELECTED FILE
                </p>

                <p
                  className="mt-[6px] break-words text-[14px] font-semibold text-[#0F172A]"
                >
                  {studentRegistSelectedFile?.name ?? "No file selected"}
                </p>
              </div>

              <p className="mt-[16px] text-[12px] text-[#64748B]">
                Please make sure you have selected the correct file before
                proceeding.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex h-[76px] items-center justify-end gap-[12px] border-t border-[#E2E8F0] bg-[#F8FAFC] px-[28px]">
              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => setShowStudentRegistUploadBulkConfirmation(false)}
                className="h-[38px] rounded-xl border border-[#CAD5E2] bg-white px-[18px] text-[13px] font-semibold text-[#334155] hover:bg-slate-100"
              >
                Cancel
              </button>

              {/* Confirm Upload Button */}
              <button
                type="button"
                disabled={!studentRegistSelectedFile}
                onClick={() => {
                  setShowStudentRegistUploadBulkConfirmation(false);
                  studentRegistUploadBulkFormRef.current?.requestSubmit();
                }}
                className="h-[38px] rounded-xl bg-[#2563EB] px-[18px] text-[13px] font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirm Upload
              </button>
            </div>
          </div>
        </div>
      )
      :
      null
    }

    {showResetAllTableDataConfirmation ? 
      (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
          <div className="w-[420px] rounded-xl bg-white p-6 shadow-xl">

            {/* Modal Header */}
            <h2 className="text-[18px] font-semibold text-[#0F172A]">Reset All Table Data?</h2>

            {/* Modal Description */}
            <p className="mt-3 text-[14px] leading-6 text-[#64748B]">
              By confirm this reset button, all the table data will be deleted. Are you sure?
            </p>

            <p className="mt-3 text-[12px] text-[#DC2626]">This action cannot be undone.</p>

            {/* Modal Actions */}
            <div className="mt-6 flex justify-end gap-3">
              {/* Cancel Button */}
              <form action={processingResetAllTableDataAction}>
                <button
                  type="button"
                  disabled={isProcessingResetAllTableDataPending}
                  onClick={() => {
                      setShowResetAllTableDataConfirmation(false);
                  }}
                  className="h-[38px] rounded-lg border border-[#CBD5E1] px-4 text-[13px] font-semibold text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-50"
                >
                  Cancel
                </button>

                {/* Delete Button */}
                <button
                  type="submit"
                  disabled={isProcessingResetAllTableDataPending}
                  className="h-[38px] min-w-[120px] rounded-lg bg-[#DC2626] px-4 text-[13px] font-semibold text-white hover:bg-[#B91C1C] hover:cursor-pointer"
                >
                  {isProcessingResetAllTableDataPending ? "Reseting..." : "Confirm Reset"}
                </button>
              </form>
            </div>
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