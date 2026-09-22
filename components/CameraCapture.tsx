"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

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

  // Matikan kamera saat keluar dari halaman
  useEffect(() => stop, []);

  return (
    <div>
      <video
        ref={videoRef}
        playsInline
        muted
        hidden={!active}
        style={{ width: "100%", maxWidth: 640, borderRadius: 8 }}
      />
      <div className="row">
        {!active ? (
          <Button type="button" variant="outline" onClick={start}>
            Buka kamera
          </Button>
        ) : (
          <>
            <Button type="button" onClick={capture}>
              Ambil foto
            </Button>
            <Button type="button" variant="outline" onClick={stop}>
              Tutup kamera
            </Button>
          </>
        )}
      </div>
      {error && <p className="muted">{error}</p>}
    </div>
  );
}
