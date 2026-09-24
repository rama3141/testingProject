"use client";
import Image from "next/image";

import { CameraCapture } from "@/components/CameraCapture";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

import { useActionState, useEffect, useState, useRef } from "react";

import takePhotoIcon from "@/public/take_photo_icon.png"
import addFileIcon from "@/public/add_file_icon.png"
import scanIcon from "@/public/scan_ocr_icon.png"
import saveInputIcon from "@/public/save_file_icon.png"
import resetInputIcon from "@/public/reset_input_icon.png"

// TODO(squad-2): sambungkan Save ke Supabase via lib/api-service/cards.ts (+ upload `image` ke Storage)
const EMPTY_DRAFT = {
  full_name: "",
  job_title: "",
  company: "",
  email1: "",
  email2: "",
  phone1: "",
  phone2: "",
  address: "",
  notes: "",
};

const formFields = [
  { id: "firstName"  , label: "First name"        , type: "text", placeholder: "First name"            },
  { id: "lastName"   , label: "Last name"         , type: "text", placeholder: "Last name"             },
  { id: "job"        , label: "Job"               , type: "text", placeholder: "Job title"             },
  { id: "institution", label: "Institution"       , type: "text", placeholder: "Company or institution"},
  { id: "email1"     , label: "Email 1"           , type: "text", placeholder: "name@example.com"      },
  { id: "email2"     , label: "Email 2 (Optional)", type: "text", placeholder: "name@example.com"      },
  { id: "phone1"     , label: "Phone 1"           , type: "text", placeholder: "+62 8xx xxxx xxxx"     },
  { id: "phone2"     , label: "Phone 2 (Optional)", type: "text", placeholder: "+62 8xx xxxx xxxx"     },
  { id: "address"    , label: "Address"           , type: "text", placeholder: "Address"               },
  { id: "notes"      , label: "Notes"             , type: "text", placeholder: "Notes"                 }
];

export default function CardsPage() {
  {/* Inisialisasi React hook ⬇️*/}
    {/* Bagian selain camera */}
  const       [draft, setDraft] = useState(EMPTY_DRAFT);
  const       [image, setImage] = useState<File | null>(null);
  const   [preview, setPreview] = useState<string | null>(null);
  const   [loading, setLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const            fileInputRef = useRef<HTMLInputElement>(null);
  {/* Inisialisasi React hook ⬆️*/}


  {/* Function untuk selain camera ⬇️*/}
    {/* Free the unused old preview object URL */}
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function selectImage(file: File) {
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setOcrError(null);
  }
  
  async function runOcr() {
    if (!image) {
      return;
    }

    setLoading(true);
    setOcrError(null);

    try {
      const fd = new FormData();
      fd.append("image", image);
      const res = await fetch("/api/cards/ocr", {method: "POST", body: fd});
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setOcrError(body.error ?? "OCR Failed. Please input manually.");
        return;
      }
      setDraft({...EMPTY_DRAFT, ...body.draft});
    } catch {
      setOcrError("OCR failed (connection). Please input manually.");
    } finally {
      setLoading(false);
    }
  }

  {/* Only delete the photo that taken (needed for retake the photo), Form content not affected. */}
  function removeImage() {
    setImage(null);
    setPreview(null);
    setOcrError(null);
  }

  function resetAll() {
    setDraft(EMPTY_DRAFT);
    setImage(null);
    setPreview(null);
    setOcrError(null);
  }
  {/* Function untuk selain camera ⬆️*/}

  return (
    <>
    <div className="w-full ml-[7.847vw]"> {/* move all content 7.847% of screen width from the browser left */}
      
      <div className="items-center w-[1214px] h-[63px] mt-[32px]"> {/* upper content */}
        <h1 className="text-[32px] font-bold">Profile Register</h1>
        <p className="text-[#62748E] text-[13px]">Scan a business card for a draft contact, correct any details, and save.h</p>
      </div>

      <div className="mt-[24px] w-[1214px] border rounded-xl border-[#E2E8F0] shadow-2xs"> {/* Upload Card, Part 1*/}
        <div className="mt-[20px] px-[20px]"> {/* upload card text */}
          <h3 className="text-[16px] font-bold">1. Upload card</h3>
        </div>

        <div className="mt-[16px] px-[20px]"> {/* choose file, take photo and scan ocr box*/}

          <div className="flex gap-[12px]"> {/* choose file, and take photo button */}
            <div> {/* take photo button */}
              <CameraCapture onCapture={selectImage}/>
            </div>

            <div className="flex"> {/* choose file button */}
              <div>
                <input
                  ref={fileInputRef} 
                  type="file"
                  accept="image/*"
                  onChange={
                    (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        selectImage(file);
                      }
                      e.target.value = "";
                    }
                  }
                  className="hidden"
                />

                <button  
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-[132px] h-[42px] border rounded-xl border-[#CAD5E2] shadow-2xs"
                >
                  <div className="flex items-center gap-[8px]">
                    <div>
                      <Image src={addFileIcon} alt="addFileIcon"/>
                    </div>
                    <div>
                      <p className="text-[14px] text-[#314158] font-semibold">Choose file</p>                    
                    </div>
                  </div>
                </button> 
              </div>

              {/* Filename pop up after file selected */}
              <div className="ml-[5px] mt-[10px]">
                <p className="text-[14px] text-[#314158]">
                  {image ? image.name : "No file selected."}
                </p>
              </div>

              {/* {preview ? <img src={preview} alt="test"/> : null} */}
            </div>
          </div>
          
          {/* untuk tampilkan image yang dipilih, atau dicapture dengan camera */}
          <div className="mt-[24px]">
            {/* {preview ? <img src={preview} alt="previewImage" /> : null}  */}
            {
                preview ? (
                <div style={{ position: "relative", display: "inline-block" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Preview kartu nama" style={{ maxWidth: 320, borderRadius: 8, display: "block" }} />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label="Hapus foto"
                    title="Hapus foto (ambil ulang)"
                    onClick={removeImage}
                    disabled={loading}
                    style={{ position: "absolute", top: 6, right: 6 }}
                  >
                    <X />
                  </Button>
                </div>
              ) : null
            }
          </div>

          {/* scan ocr button */}
          {preview ?
            ( // Kalau url preview sudah ada, execute code ini
              <div className="mt-[28px] mb-[8px]"> {/* tombol scan ocr */}
                <button
                  type="button"
                  className="flex w-[132px] h-[40px] border rounded-xl border-[#CAD5E2] bg-[#155DFC] shadow-2xs"
                >
                  <div className="flex items-center gap-[8px]">
                    <div>
                      <Image src={scanIcon} alt="scanIcon"/>
                    </div>
                    <div>
                      <span className="text-[14px] font-semibold text-[#FFFFFF]">Scan OCR</span>
                    </div>
                  </div>

                </button>  
              </div>
            ) : ( // kalau url preview masih belum ada, code dalam kurung ini akan dieksekusi
              <div className="mt-[28px] mb-[8px]">
                <button
                  type="button"
                  className="flex w-[132px] h-[40px] border rounded-xl border-[#CAD5E2] bg-[#CAD5E2] shadow-2xs"
                >
                  <div className="flex items-center gap-[8px]">
                    <div>
                      <Image src={scanIcon} alt="scanIcon"/>
                    </div>
                    <div>
                      <span className="text-[14px] font-semibold text-[#FFFFFF]">Scan OCR</span>
                    </div>
                  </div>

                </button>  
              </div>
            )
          }
        </div>
      </div>

      <div className="w-[1214px] border rounded-xl border-[#E2E8F0] shadow-2xs mt-[32px] mb-[54px]"> {/* Form, Part 2 */}
        <div className="px-[20px] mt-[20px]"> {/* For "2. Form" text */} 
          <h1 className="text-[16px] font-semibold">2. Form</h1>
        </div>

        <div className="flex w-[1173px] mt-[16px]"> {/* Form label, input, and submit, reset button */}
          <form className="px-[20px]">
            <div className="flex gap-[16px]"> {/*  First name and Last name part */}
              <div>
                <label htmlFor={formFields[0].id} className="text-[14px] text-[#314158]">{formFields[0].label}</label>
                <div className="w-[578px] h-[44px] border border-[#CAD5E2] rounded-xl">
                  <input 
                    type={formFields[0].type} id={formFields[0].id} name={formFields[0].id}
                    placeholder={formFields[0].placeholder}
                    className="outline-none w-[578px]"
                    required
                  />    
                </div>
              </div>

              <div>
                <label htmlFor={formFields[1].id} className="text-[14px] text-[#314158]">{formFields[1].label}</label>
                <div className="w-[578px] h-[44px] border border-[#CAD5E2] rounded-xl">
                  <input 
                    type={formFields[1].type} id={formFields[1].id} name={formFields[1].id}
                    placeholder={formFields[1].placeholder}
                    className="outline-none w-[578px]"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-[16px] mt-[14px]"> {/* job and institution part */}
              <div>
                <label htmlFor={formFields[2].id} className="text-[14px] text-[#314158]">{formFields[2].label}</label>
                <div className="w-[578px] h-[44px] border border-[#CAD5E2] rounded-xl">
                  <input 
                    type={formFields[2].type} id={formFields[2].id} name={formFields[2].id}
                    placeholder={formFields[2].placeholder}
                    className="outline-none w-[578px]"
                    required
                  />    
                </div>
              </div>

              <div>
                <label htmlFor={formFields[3].id} className="text-[14px] text-[#314158]">{formFields[3].label}</label>
                <div className="w-[578px] h-[44px] border border-[#CAD5E2] rounded-xl">
                  <input 
                    type={formFields[3].type} id={formFields[3].id} name={formFields[3].id}
                    placeholder={formFields[3].placeholder}
                    className="outline-none w-[578px]"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-[16px] mt-[14px]"> {/* email 1 and email 2 part */}
              <div>
                <label htmlFor={formFields[4].id} className="text-[14px] text-[#314158]">{formFields[4].label}</label>
                <div className="w-[578px] h-[44px] border border-[#CAD5E2] rounded-xl">
                  <input 
                    type={formFields[4].type} id={formFields[4].id} name={formFields[4].id}
                    placeholder={formFields[4].placeholder}
                    className="outline-none w-[578px]"
                    required
                  />    
                </div>
              </div>

              <div>
                <label htmlFor={formFields[5].id} className="text-[14px] text-[#314158]">{formFields[5].label}</label>
                <div className="w-[578px] h-[44px] border border-[#CAD5E2] rounded-xl">
                  <input 
                    type={formFields[5].type} id={formFields[5].id} name={formFields[5].id}
                    placeholder={formFields[5].placeholder}
                    className="outline-none w-[578px]"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-[16px] mt-[14px]"> {/* phone 1 and phone 2 part */}
              <div>
                <label htmlFor={formFields[6].id} className="text-[14px] text-[#314158]">{formFields[6].label}</label>
                <div className="w-[578px] h-[44px] border border-[#CAD5E2] rounded-xl">
                  <input 
                    type={formFields[6].type} id={formFields[6].id} name={formFields[6].id}
                    placeholder={formFields[6].placeholder}
                    className="outline-none w-[578px]"
                    required
                  />    
                </div>
              </div>

              <div>
                <label htmlFor={formFields[7].id} className="text-[14px] text-[#314158]">{formFields[7].label}</label>
                <div className="w-[578px] h-[44px] border border-[#CAD5E2] rounded-xl">
                  <input 
                    type={formFields[7].type} id={formFields[7].id} name={formFields[7].id}
                    placeholder={formFields[7].placeholder}
                    className="outline-none w-[578px]"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mt-[14px]"> {/* address part */}
              <label htmlFor={formFields[8].id} className="text-[14px] text-[#314158]">{formFields[8].label}</label>
              <div className="w-[1173px] h-[44px] border border-[#CAD5E2] rounded-xl">
                <input 
                  type={formFields[8].type} id={formFields[8].id} name={formFields[8].id}
                  placeholder={formFields[8].placeholder}
                  className="outline-none w-[1150px]"
                  required
                />    
              </div>
            </div>

            <div className="mt-[14px]"> {/* notes part */}
              <label htmlFor={formFields[9].id} className="text-[14px] text-[#314158]">{formFields[9].label}</label>
              <div className="w-[1173px] h-[90px] border border-[#CAD5E2] rounded-xl">
                <input 
                  type={formFields[9].type} id={formFields[9].id} name={formFields[9].id}
                  placeholder={formFields[9].placeholder}
                  className="outline-none w-[1150px]"
                  required
                />    
              </div>
            </div>

            <div className="flex mt-[32px] gap-[12px] mb-[22px]">
              <div>
                <button
                  type="button"
                  className="w-[104px] h-[40px] bg-[#155DFC] border rounded-xl border-[#CAD5E2] shadow-2xs"
                >
                  <div className="flex items-center gap-[6px]">
                    <div>
                      <Image src={saveInputIcon} alt="saveInputIcon"/>                  
                    </div> 
                    <div>
                      <p className="text-[#FFFFFF] text-[14px] font-semibold">Save</p>
                    </div>
                  </div>
                </button>
              </div>
              <div>
                <button
                  type="button"
                  className="w-[104px] h-[40px] border rounded-xl border-[#CAD5E2] shadow-2xs"
                >
                  <div className="flex items-center gap-[6px]">
                    <div>
                      <Image src={resetInputIcon} alt="resetInputIcon"/>                  
                    </div> 
                    <div>
                      <p className="text-[#314158] text-[14px] font-semibold">Reset</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
    </>
  )
}

{/* // export default function CardsPage() { 
//   const [draft, setDraft] = useState(EMPTY_DRAFT);
//   const [image, setImage] = useState<File | null>(null);
//   const [preview, setPreview] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [ocrError, setOcrError] = useState<string | null>(null);

//   // Bebaskan object URL preview lama
//   useEffect(() => {
//     return () => {
//       if (preview) URL.revokeObjectURL(preview);
//     };
//   }, [preview]);

//   function selectImage(file: File) {
//     setImage(file);
//     setPreview(URL.createObjectURL(file));
//     setOcrError(null);
//   }

//   async function runOcr() {
//     if (!image) return;
//     setLoading(true);
//     setOcrError(null);
//     try {
//       const fd = new FormData();
//       fd.append("image", image);
//       const res = await fetch("/api/cards/ocr", { method: "POST", body: fd });
//       const body = await res.json().catch(() => ({}));
//       if (!res.ok) {
//         setOcrError(body.error ?? "OCR gagal. Silakan input manual.");
//         return;
//       }
//       setDraft({ ...EMPTY_DRAFT, ...body.draft });
//     } catch {
//       setOcrError("OCR gagal (koneksi). Silakan input manual.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   // Hapus foto saja (untuk ambil ulang); isi form tetap
//   function removeImage() {
//     setImage(null);
//     setPreview(null);
//     setOcrError(null);
//   }

//   function resetAll() {
//     setDraft(EMPTY_DRAFT);
//     setImage(null);
//     setPreview(null);
//     setOcrError(null);
//   }

//   return (
//     <>
//       <h1>Name Cards</h1>
//       <p className="muted">
//         Alur: foto/upload → draft OCR → koreksi manual → save. Form kosong di bawah = fallback manual kalau OCR
//         gagal (PRD §5).
//       </p>
//       <div className="card">
//         <h3>1. Foto kartu nama</h3>
//         <CameraCapture onCapture={selectImage} />
//         <p className="muted">atau upload file:</p>
//         <input
//           type="file"
//           accept="image/*"
//           onChange={(e) => {
//             const file = e.target.files?.[0];
//             if (file) selectImage(file);
//             e.target.value = "";
//           }}
//         />
//         {preview && (
//           <div style={{ position: "relative", display: "inline-block" }}>
//             {/* eslint-disable-next-line @next/next/no-img-element */}
//             <img src={preview} alt="Preview kartu nama" style={{ maxWidth: 320, borderRadius: 8, display: "block" }} />
//             <Button
//               type="button"
//               variant="outline"
//               size="icon-sm"
//               aria-label="Hapus foto"
//               title="Hapus foto (ambil ulang)"
//               onClick={removeImage}
//               disabled={loading}
//               style={{ position: "absolute", top: 6, right: 6 }}
//             >
//               <X />
//             </Button>
//           </div>
//         )}
//         <div className="row">
//           <Button type="button" variant="outline" onClick={runOcr} disabled={!image || loading}>
//             {loading ? "Memproses..." : "Scan OCR"}
//           </Button>
//         </div>
//         {ocrError && <p className="muted">{ocrError}</p>}
//       </div>
//       <div className="card">
//         <h3>2. Form (draft OCR / manual)</h3>
//         <form
//           onSubmit={(e) => {
//             e.preventDefault();
//             alert("TODO(squad-2): save ke Supabase. Payload: " + JSON.stringify(draft));
//           }}
//         >
//           {(
//             [
//               ["full_name", "Nama"],
//               ["job_title", "Jabatan"],
//               ["company", "Institusi"],
//               ["email1", "Email 1"],
//               ["email2", "Email 2 (opsional)"],
//               ["phone1", "Phone 1"],
//               ["phone2", "Phone 2 (opsional)"],
//               ["address", "Alamat"],
//               ["notes", "Catatan"],
//             ] as const
//           ).map(([k, label]) => (
//             <label key={k}>
//               {label}
//               <input
//                 value={draft[k]}
//                 onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
//               />
//             </label>
//           ))}
//           <div className="row">
//             <Button type="submit" variant="outline">Save (stub)</Button>
//             <Button type="button" variant="outline" onClick={resetAll}>
//               Reset (input manual baru)
//             </Button>
//           </div>
//         </form>
//       </div>
//     </>
//   );
// }
