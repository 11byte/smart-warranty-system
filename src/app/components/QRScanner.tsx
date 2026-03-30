"use client";

import { useEffect, useRef } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";

export default function QRScanner({ onScan }: any) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const codeReader = useRef(new BrowserQRCodeReader());

  useEffect(() => {
    let controls: any;

    const start = async () => {
      try {
        const devices = await BrowserQRCodeReader.listVideoInputDevices();

        const backCam = devices.find((d) =>
          d.label.toLowerCase().includes("back"),
        );

        const deviceId = backCam?.deviceId || devices[0]?.deviceId;

        controls = await codeReader.current.decodeFromVideoDevice(
          deviceId,
          videoRef.current!,
          (result, err) => {
            if (result) {
              onScan(result.getText());
            }
          },
        );
      } catch (err) {
        console.error("ZXing camera error:", err);
      }
    };

    start();

    return () => {
      // ✅ NEW WAY
      if (controls) {
        controls.stop();
      }
    };
  }, []);

  return (
    <div className="relative w-80 h-80 rounded-xl overflow-hidden border border-gray-800">
      <video ref={videoRef} className="w-full h-full object-cover" />

      {/* overlay */}
      <div className="absolute inset-0 border-2 border-blue-500 rounded-xl pointer-events-none" />
    </div>
  );
}
