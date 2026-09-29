import Image from "next/image";
import Link from "next/link";

import previousArrowIcon from "@/public/previousArrowIcon.png"


const csvData = [
    {eventName: "Seminar Nasional Teknologi Digital",  date: "18 Mei 2026", campusLocation: "Anggrek",    status: true},
    {eventName: "BINUS Festival 2026",                 date: "12 Apr 2026", campusLocation: "Alam Sutra", status: true},
    {eventName: "Workshop UI/UX untuk Produk Digital", date: "22 Feb 2026", campusLocation: "Semarang",   status: true},
    {eventName: "Pengabdian Masyarakat Kemanggisan",   date: "16 Nov 2025", campusLocation: "Bekasi",     status: false}
];


export default async function StudentProfilePage({params}: {params: Promise<{nimId: string}>;}) {
    const nimId = (await params).nimId;
    return (
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
                        <h1 className="text-[18px]">Aditya Pratama</h1>
                        <p className="text-[13px] text-[#64748B]">2602154321</p>
                    </div>

                    <div className="w-[290px] h-[44px] flex gap-[48px]"> {/* Untuk IE status current year, dan IE status wisuda */}
                        <div className="w-[136px] h-[44px]"> {/*Untuk IE status (current year)*/}
                            <p className="text-[12px] text-[#64748B]">IE Status (Current Year)</p>
                            <div className="w-[56px] h-[21px] bg-[#DCFCE7] rounded-2xl flex items-center justify-center">
                                <p className="text-[11px] text-[#15803D] font-bold">TRUE</p>
                            </div>
                        </div>
                        <div className="w-[106px] h-[44px]"> {/*Untuk IE status wisuda */}
                            <p className="text-[12px] text-[#64748B]">IE Status (Wisuda)</p>
                            <div className="w-[56px] h-[21px] bg-[#FEF2F2] rounded-2xl flex items-center justify-center">
                                <p className="text-[11px] text-[#B42318] font-bold">FALSE</p>
                            </div>    
                        </div>
                    </div>
                </div>

                <div className="mt-[24px]"> {/* Garis pembatas */}
                    <hr className="w-[1172px] border border-[#E2E8F0]"/>
                </div>

                <div className="flex w-[1172px] h-[38px] mt-[24px] gap-[48px]"> {/* bagian program department, dan campus*/}
                    <div className="w-[562px] h-[38px]"> {/* Bagian Program Department */}
                        <p className="text-[12px] text-[#64748B]">Program Department</p>
                        <p className="text-[14px] text-[#0F172A] font-semibold">Informatika</p>
                    </div>
                    <div className="w-[562px] h-[38px]"> {/* Baigan Campus */}
                        <p className="text-[12px] text-[#64748B]">Campus</p>
                        <p className="text-[14px] text-[#0F172A] font-semibold">Kemanggisan</p>
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
                                <th className="w-[374px] pt-[14px] pb-[15px] text-left border border-[#ddd]">
                                    <p className="ml-[24px] text-[#64748B] text-[11px]">EVENT NAME</p>
                                </th>
                                <th className="w-[304px] pt-[14px] pb-[15px] text-left border border-[#ddd]">
                                    <p className="ml-[24px] text-[#64748B] text-[11px]">DATE</p>
                                </th>
                                <th className="w-[304px] pt-[14px] pb-[15px] text-left border border-[#ddd]">
                                    <p className="ml-[24px] text-[#64748B] text-[11px]">CAMPUS LOCATION</p>
                                </th>
                                <th className="w-[236px] pt-[14px] pb-[15px] text-left border border-[#ddd]">
                                    <p className="ml-[24px] text-[#64748B] text-[11px]">STATUS</p> 
                                </th>
                            </tr>
                        </thead>
                        
                        <tbody>
                            {csvData.map((student) => (
                            <tr key={student.eventName}>
                                <td className="h-[58px] border border-[#ddd] pt-[19.5px] pb-[19.5px] text-left">
                                    <p className="ml-[24px] text-[14px] font-semibold text-[#0F172A]">{student.eventName}</p>    
                                </td>
                                <td className="h-[58px] border border-[#ddd] pt-[21px] pb-[18px] text-left">
                                    <p className="ml-[24px] text-[14px] text-[#64748B]">{student.date}</p>
                                </td>
                                <td className="h-[58px] border border-[#ddd] pt-[15px] pb-[24px] text-left">
                                    <p className="ml-[24px] text-[14px] text-[#64748B]">{student.campusLocation}</p>
                                </td>
                                <td className="h-[58px] border border-[#ddd] pt-[13px] pb-[22px] text-left">
                                    <div className={`flex w-[57px] h-[23px] ml-[24px] ${student.status ? "bg-[#DCFCE7]" : "bg-[#F3F4F6]"} rounded-3xl justify-center items-center`}>
                                        <p className={`text-[12px] font-bold ${student.status ? "text-[#166534]" : "text-[#B42318]"}`}>{student.status ? "TRUE" : "FALSE"}</p>
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
    ); 
}