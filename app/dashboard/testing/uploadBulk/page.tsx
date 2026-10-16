"use client";
{/* class dari NextJS */}
import Image from "next/image";
import Link from "next/link";

{/* Untuk React hook */}
import React, { useActionState, useRef, useState } from "react";

{/* Untuk image, icon */}
import chooseFileIcon from "@/public/choose_file_icon.png"
import uploadIcon from "@/public/upload_icon.png"
 
import { handleFormUploadBulkAction } from "@/lib/customFunction/serverActions" 

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

// TODO(squad-1): ganti mock dengan query Supabase via lib/api-service/ie.ts

export default function IEPage({students,}: IEMonitoringClientProps) {
  const         [selectedFile, setSelectedFile] = useState<File | null>(null);
  const                            fileInputRef = useRef<HTMLInputElement>(null);
  const   [isResetFIleName, setIsResetFIleName] = useState(false);
 
  function handleChooseFile() {
    fileInputRef.current?.click();
    console.log(fileInputRef);
    setIsResetFIleName(false);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    } 

    setSelectedFile(file);
  }

  return (
    <>
    <div className="w-full ml-[7.847vw] mt-[72px] mb-[348px]"> {/*move all content 7.847% of screen width from the browser left*/} 
        <form action={handleFormUploadBulkAction} className="flex items-center gap-9"> {/*Upload file part*/}
          {/* hidden file input*/}
          <input
            ref={fileInputRef}
            name="inputFile"
            type="file"
            accept=".csv, .xls, .xlsx"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* choose file button */}
          <button
            type="submit"
            onClick={handleChooseFile}
            className="flex h-[58px] w-[148px] items-center justify-center gap-2 rounded-xl border-2 border-[#2563EB] px-4 font-semibold text-[#1E293B]"
          >
            {selectedFile && !isResetFIleName ? (
              <span className="max-w-[100px] truncate">
                {selectedFile.name}
              </span>
            ): (
              <>
                <span>Choose File</span>
                <Image src={chooseFileIcon} alt="chooseFileIcon" width={28} height={28}/>
              </>
            )}
          </button>

          {/* upload file button */}
          <button
            type="submit"
            disabled={!selectedFile}
            onClick={() => setIsResetFIleName(true)}
            className="flex h-[58px] w-[180px] items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex gap-[12px]">
              <div>
                <Image src={uploadIcon} alt="uploadIcon"/>
              </div>
              <div>
                <p>Upload bulk</p>
              </div>
            </div>
          </button>
        </form> {/*Upload file part*/}

    </div>   
    </>
  );
}