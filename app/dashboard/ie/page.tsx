"use client";
import Image from "next/image";
import React, { useRef, useState } from "react";

import peopleIcon from "@/public/people_icon.png"
import clockIcon from "@/public/clock_icon.png"
import chooseFileIcon from "@/public/choose_file_icon.png"
import uploadIcon from "@/public/upload_icon.png"
import searchIcon from "@/public/search_icon.png"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"


// TODO(squad-1): ganti mock dengan query Supabase via lib/api-service/ie.ts
const MOCK = [
  { nim: "2600000001", name: "Contoh Mahasiswa 1", prodi: "Computer Science", campus: "Kemanggisan", ie: false },
  { nim: "2600000002", name: "Contoh Mahasiswa 2", prodi: "Information Systems", campus: "Alam Sutera", ie: true },
];

const csvData = [
  { nim: "2602154321", name: "Aditya Pratamav", major: "Informatika", campus: "Kemanggisan", eventName: "Informatics Global Seminar Series", ieStatus: true},
  { nim: "2602189012", name: "Siti Rahmawati", major: "Sistem Informasi", campus: "Alam Sutera", eventName: "Sari Tech Fest 2026", ieStatus: false},
  { nim: "2602194382", name: "Budi Santoso", major: "Teknik Komputer", campus: "Bandung", eventName: "IoT Hands-On Bootcamp", ieStatus: true},
  { nim: "2602148590", name: "Dewi Lestari", major: "Informatika", campus: "Kemanggisan", eventName: "Binus National Hackathon", ieStatus: false},
  { nim: "2602167341", name: "Rian Hidayat", major: "Sistem Informasi", campus: "Bandung", eventName: "Enterprise Architecture Colloquium", ieStatus: true},
  { nim: "2602139482", name: "Farhan Nurhalim", major: "Teknik Komputer", campus: "Alam Sutera", eventName: "Binus Robotics Expo 2026", ieStatus: false},
];

export default function IEPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleChooseFile() {
    fileInputRef.current?.click();
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
    <div className="w-full ml-[7.847vw]"> {/*move all content 7.847% of screen width from the browser left*/}
      
      <div className="flex items-center justify-between w-[866px] h-[100px] py-3"> {/* upper content */}
        <div> {/*Left Section*/}
          <h1 className="text-[32px] font-bold">IE Monitoring</h1>
          <p className="text-[14px] text-gray-500">Track and manage student IE completion status</p>
        </div>
        <div className="flex"> {/*Right Section*/}
          <div className="flex items-center gap-3 px-4 border border-[#E2E8F0] rounded-2xl"> {/*Total Students*/}
            <div className="flex h-15 w-15 items-center justify-center"> {/*People Icon*/}
              <Image src={peopleIcon} alt="PeopleIcon" width={60} height={60}/>
            </div>
            <div> {/*description*/}
              <div className="font-bold text-[24px]">6</div>
              <div className="text-[13px] text-gray-500">Total</div>
              <div className="text-[13px] text-gray-500">Students</div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 border border-[#E2E8F0] rounded-2xl"> {/*Completed IE*/}
            <div> {/*Clock Icon*/}
              <Image src={clockIcon} alt="ClockIcon" width={60} height={60}></Image>
            </div>
            <div> {/*description*/}
              <div className="font-bold text-[24px]">50%</div>
              <div className="text-[13px] text-gray-500">Completed IE</div>
              <div className="text-[13px] text-gray-500">(Year)h</div>
            </div>
          </div>
        </div> 
      </div> {/* upper content */}

      <div className="mt-4 flex items-center gap-9"> {/*Upload file part*/}
        {/* hidden file input*/}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv, .xls, .xlsx"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* choose file button */}
        <button
          type="button"
          onClick={handleChooseFile}
          className="flex h-[58px] w-[148px] items-center justify-center gap-2 rounded-xl border-2 border-[#2563EB] px-4 font-semibold text-[#1E293B]"
        >
          {selectedFile ? (
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
          type="button"
          disabled={!selectedFile}
          className="flex h-[58px] w-[180px] items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Upload Bulk
        </button>
      </div> {/*Upload file part*/}
      
      <div className="flex mt-[32px] gap-[378px]"> {/* Searching Bar & Filter*/}
          <div className="border w-[400px] h-[44px] rounded-xl relative border-[#E2E8F0]"> {/* Search Bar Text Input*/}
            <div className="px-[20px] py-[2px]">
              <input 
                type="text" 
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
                  <NavigationMenuContent>
                    <NavigationMenuLink>Link</NavigationMenuLink>
                    <NavigationMenuLink>Link</NavigationMenuLink>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem className="w-[109px] border border-[#E2E8F0] rounded-xl">
                  <NavigationMenuTrigger>Campus</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <NavigationMenuLink>Link</NavigationMenuLink>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem className="w-[93px] border border-[#E2E8F0] rounded-xl">
                  <NavigationMenuTrigger>Batch</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <NavigationMenuLink>Link</NavigationMenuLink>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem className="w-[103px] border border-[#E2E8F0] rounded-xl">
                  <NavigationMenuTrigger>IE Status</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <NavigationMenuLink>Link</NavigationMenuLink>
                  </NavigationMenuContent>
                </NavigationMenuItem>

              </NavigationMenuList>
            </NavigationMenu>
          </div>
      </div>

      <div className="mt-[8px] w-[1214px] rounded-xl">
        <table>
          <thead>
            <tr className="bg-[#F8FAFC] text-[13px] text-[#64748B] rounded-tl-xl rounded-tr-xl border">
              <th className="w-[100px] rounded-tl-xl">NIM</th> 
              <th className="w-[200px]">NAME</th> 
              <th className="w-[200px]">MAJOR</th> 
              <th className="w-[100px]">CAMPUS</th> 
              <th className="w-[250px]">EVENT NAME</th> 
              <th className="w-[50px] rounded-tr-xl">IE STATUS</th>
            </tr>
          </thead>

          <tbody>
            {csvData.map((m) => (
              <tr key={m.nim}>
                <td>{m.nim}</td>
                <td>{m.name}</td>
                <td>{m.major}</td>
                <td>{m.campus}</td>
                <td>{m.eventName}</td>
                <td>{m.ieStatus ? "TRUE" : "FALSE"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div> 
    </>
  );
}

// export default function IEPage() {
//   return (
//     <>
//       <strong>      
//         <h1 className="text-[32px]">IE Monitoring</h1>
//       </strong>
//       <p className="text-[16px]">
//         TODO(squad-1): search/filter + tabel master + bulk upload (kolom: NIM, Name, Program_Department, CampusLocation,
//         EventName) + rekap tahunan. Lihat PRD §4.
//       </p>
//       <form className="row" action="/api/ie/bulk" method="post" encType="multipart/form-data">
//         <Button variant="outline">
//           <input type="file" name="file" accept=".csv" />
//         </Button>
//         <Button type="submit" variant="outline">
//           Upload bulk (stub)
//         </Button>
//       </form>
//       <table>
//         <thead>
//           <tr>
//             <th>NIM</th>
//             <th>Nama</th>
//             <th>Prodi</th>
//             <th>Campus</th>
//             <th>IE</th>
//           </tr>
//         </thead>
//         <tbody>
//           {MOCK.map((m) => (
//             <tr key={m.nim}>
//               <td>{m.nim}</td>
//               <td>{m.name}</td>
//               <td>{m.prodi}</td>
//               <td>{m.campus}</td>
//               <td>{m.ie ? "TRUE" : "FALSE"}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </>
//   );
// }