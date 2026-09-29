"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import takePhotoIcon  from "@/public/take_photo_icon.png"

// Akses webcam/kamera HP via getUserMedia. Hanya jalan di HTTPS atau localhost.
export function CameraCapture({ onCapture }: { onCapture: (file: File) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Browser tidak mendukung kamera (butuh HTTPS atau localhost). Pakai upload foto / input manual.");
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
      setActive(true);
    } catch {
      setError("Kamera tidak bisa diakses. Cek izin kamera di browser, atau pakai upload foto / input manual.");
    }
  }

  function stop() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
  }

  function turnActive() {
    setActive(true);
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
        onCapture(new File([blob], `card-${Date.now()}.jpg`, { type: "image/jpeg" }));
        stop();
      },
      "image/jpeg",
      0.9
    );
  }

  {/* Matikan kamera saat keluar dari halaman */}
  useEffect(() => stop, []);

  return (
    <div>
      <div className="w-[132px]">
        <div>
          <button
            type="button"
            onClick={start}
            className="w-[132px] h-[42px] border rounded-xl border-[#CAD5E2] shadow-2xs"
          >
            <div className="flex items-center gap-[6px]">
              <div>
                <Image src={takePhotoIcon} alt="takePhotoIcon"/>                  
              </div> 
              <div>
                <p className="text-[#314158] text-[14px] font-semibold">Camera</p>
              </div>
            </div>
          </button>
        </div>

        <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            hidden={!active}
            style={{ width: "600px", maxWidth: "600px", borderRadius: 8 }}
            className="mt-[42px]"
        />

        {error && <p className="muted">{error}</p>}
      </div>

      {/* <div> */}
        {active ? (
          // <>
            <div className="flex gap-[87px] mt-4">
              <div className="w-[130px] h-[40px] border border-[#155DFC] rounded-xl"> {/* button take photo */}
                <button 
                  type="button" 
                  onClick={capture} 
                  className=""
                >
                  <p className="text-[14px] text-[#1447E6] font-semibold">Take Photo</p>
                </button>
              </div>

              <div className="w-[104px] h-[40px] border border-[#CAD5E2] rounded-xl"> {/* button cancel */}
                <button 
                  type="button" 
                  onClick={stop}
                >
                  Cancel
                </button>
              </div>
            </div>
          // </>
        ) : (
          null
        )}
      {/* </div> */}
    </div>
  );
}
