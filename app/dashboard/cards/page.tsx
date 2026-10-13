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

type DraftKey = keyof typeof EMPTY_DRAFT;

// `key` memetakan tiap input ke kolom draft/DB. First name + Last name sama-sama
// menunjuk full_name karena OCR dan kolom DB menyimpan nama sebagai satu string.
const formFields = [
  { id: "firstName"  , key: "full_name", label: "First name"        , type: "text", placeholder: "First name"            },
  { id: "lastName"   , key: "full_name", label: "Last name"         , type: "text", placeholder: "Last name"             },
  { id: "job"        , key: "job_title", label: "Job"               , type: "text", placeholder: "Job title"             },
  { id: "institution", key: "company"  , label: "Institution"       , type: "text", placeholder: "Company or institution"},
  { id: "email1"     , key: "email1"   , label: "Email 1"           , type: "text", placeholder: "name@example.com"      },
  { id: "email2"     , key: "email2"   , label: "Email 2 (Optional)", type: "text", placeholder: "name@example.com"      },
  { id: "phone1"     , key: "phone1"   , label: "Phone 1"           , type: "text", placeholder: "+62 8xx xxxx xxxx"     },
  { id: "phone2"     , key: "phone2"   , label: "Phone 2 (Optional)", type: "text", placeholder: "+62 8xx xxxx xxxx"     },
  { id: "address"    , key: "address"  , label: "Address"           , type: "text", placeholder: "Address"               },
  { id: "notes"      , key: "notes"    , label: "Notes"             , type: "text", placeholder: "Notes"                 }
] as const satisfies readonly { id: string; key: DraftKey; label: string; type: string; placeholder: string }[];

// Form punya dua input nama, draft hanya punya full_name. Token pertama dianggap
// first name, sisanya last name — heuristik, jadi hasil OCR tetap perlu dicek user.
function splitFullName(full: string) {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

function joinFullName(firstName: string, lastName: string) {
  return [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
}

export default function CardsPage() {
  {/* Inisialisasi React hook ⬇️*/}
    {/* Bagian selain camera */}
  const       [draft, setDraft] = useState(EMPTY_DRAFT);
  // Input nama dipegang mentah di state sendiri supaya user bisa mengetik spasi;
  // draft.full_name tetap jadi nilai kanonik yang dikirim ke DB.
  const [nameParts, setNameParts] = useState({ firstName: "", lastName: "" });
  const       [image, setImage] = useState<File | null>(null);
  const   [preview, setPreview] = useState<string | null>(null);
  const   [loading, setLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const            fileInputRef = useRef<HTMLInputElement>(null);

    {/* Bagian camera */}
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraAtive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
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

  function setField(key: DraftKey, value: string) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function setNamePart(part: "firstName" | "lastName", value: string) {
    const next = { ...nameParts, [part]: value };
    setNameParts(next);
    setField("full_name", joinFullName(next.firstName, next.lastName));
  }

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
      const merged = {...EMPTY_DRAFT, ...body.draft};
      setDraft(merged);
      setNameParts(splitFullName(merged.full_name));
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
    setNameParts({ firstName: "", lastName: "" });
    setImage(null);
    setPreview(null);
    setOcrError(null);
  }
  {/* Function untuk selain camera ⬆️*/}

  {/* Function untuk selain camera ⬇️*/}
  async function start() {
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Browser tidak mendukung kamera (butuh HTTPS atau localhost). Pakai upload foto / input manual.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch {
      setCameraError("Kamera tidak bisa diakses. Cek izin kamera di browser, atau pakai upload foto / input manual.");
    }
  }

  function stop() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraActive(false);
  }

  function turnCameraToOff() {
    setIsCameraActive(false);
  }

  function capture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file: File = new File([blob], `card-${Date.now()}.jpg`, {type: "image/jpeg"});
        selectImage(file);
        stop();
      },
      "image/jpeg",
      0.9
    );
  }

    {/* Matikan kamera saat keluar dari halaman */}
  useEffect(() => stop, []);
  {/* Function untuk selain camera ⬆️*/}

  return (
    <>
    <div className="w-full ml-[7.847vw] mt-[72px]"> {/* move all content 7.847% of screen width from the browser left */}
      
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
              <button
                type="button"
                onClick={start}
                className="w-[132px] h-[42px] border rounded-xl border-[#CAD5E2] shadow-2xs"
              >
                <div className="px-[20px] flex items-center gap-[6px]">
                  <div>
                    <Image src={takePhotoIcon} alt="takePhotoIcon"/>                  
                  </div> 
                  <div>
                    <p className="text-[#314158] text-[14px] font-semibold">Camera</p>
                  </div>
                </div>
              </button>
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
                  disabled={isCameraAtive}
                  onClick={() => {stop(); fileInputRef.current?.click();}} /* Camera dimatikan ketika user klik tombol ini */
                  className="w-[132px] h-[42px] border rounded-xl border-[#CAD5E2] shadow-2xs"
                >
                  <div className="px-[5px] flex items-center gap-[8px]">
                    <div>
                      <Image src={addFileIcon} alt="addFileIcon"/>
                    </div>
                    <div>
                      <p className="text-[14px] text-[#314158] font-semibold">Choose file</p>                    
                    </div>
                  </div>
                </button> 
              </div>

              {/* file name nya muncul kalau sudah select file*/}
              <div className="ml-[5px] mt-[10px]">
                <p className="text-[14px] text-[#314158]">
                  {image ? image.name : "No file selected."}
                </p>
              </div>
            </div>
          </div>

          <div> {/* Untuk tampilkan frame yang perlu di take, button take photo, dan button cancel */}
            <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                hidden={!isCameraAtive}
                style={{ width: "600px", maxWidth: "600px", borderRadius: 8 }}
                className="mt-[24px]"
            />

            {cameraError && <p className="muted">{cameraError}</p>}

            {isCameraAtive ? (
              // <>
                <div className="flex mt-4">
                  <div> {/* button take photo */}
                    <button 
                      type="button" 
                      onClick={capture} 
                      className="w-[130px] h-[40px] border border-[#155DFC] rounded-xl"
                    >
                      <p className="text-[14px] text-[#1447E6] font-semibold">Take Photo</p>
                    </button>
                  </div>

                  <div> {/* button cancel, digeser ke kiri sejauh (600 - 130 - 104)px*/}
                    <button 
                      type="button" 
                      onClick={stop}
                      className="ml-[366px] w-[104px] h-[40px] border border-[#CAD5E2] rounded-xl"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              // </>
            ) : (
              null
            )}
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
          <div className="mt-[28px] mb-[8px]"> {/* tombol scan ocr */}
            <button
              type="button"
              onClick={runOcr}
              disabled={!image || loading}
              className={`flex w-[132px] h-[40px] border rounded-xl border-[#CAD5E2] ${preview ? "bg-[#155DFC]" : "bg-[#CAD5E2]"} shadow-2xs disabled:opacity-60`}
            >
              <div className="px-[12px] flex items-center gap-[8px]">
                <div>
                  <Image src={scanIcon} alt="scanIcon"/>
                </div>
                <div>
                  <span className="text-[14px] font-semibold text-[#FFFFFF]">{loading ? "Scanning..." : "Scan OCR"}</span>
                </div>
              </div>
            </button>  

            {ocrError ? (
              <p className="mt-[8px] text-[13px] text-[#C10007]">{ocrError}</p>
            ) : null}
          </div>

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
                    value={nameParts.firstName}
                    onChange={(e) => setNamePart("firstName", e.target.value)}
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
                    value={nameParts.lastName}
                    onChange={(e) => setNamePart("lastName", e.target.value)}
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
                    value={draft[formFields[2].key]}
                    onChange={(e) => setField(formFields[2].key, e.target.value)}
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
                    value={draft[formFields[3].key]}
                    onChange={(e) => setField(formFields[3].key, e.target.value)}
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
                    value={draft[formFields[4].key]}
                    onChange={(e) => setField(formFields[4].key, e.target.value)}
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
                    value={draft[formFields[5].key]}
                    onChange={(e) => setField(formFields[5].key, e.target.value)}
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
                    value={draft[formFields[6].key]}
                    onChange={(e) => setField(formFields[6].key, e.target.value)}
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
                    value={draft[formFields[7].key]}
                    onChange={(e) => setField(formFields[7].key, e.target.value)}
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
                  value={draft[formFields[8].key]}
                  onChange={(e) => setField(formFields[8].key, e.target.value)}
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
                  value={draft[formFields[9].key]}
                  onChange={(e) => setField(formFields[9].key, e.target.value)}
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
                  onClick={resetAll}
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