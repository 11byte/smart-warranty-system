"use client";

import Navbar from "../components/Navbar";
import QRScanner from "../components/QRScanner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ScanLine, Loader2, Camera, Upload, ShieldCheck } from "lucide-react";
import { useState } from "react";
import axios from "axios";

import { BrowserQRCodeReader } from "@zxing/browser";

export default function ScanPage() {
  const router = useRouter();

  const [manualId, setManualId] = useState("");
  const [status, setStatus] = useState<any>("idle");
  const [message, setMessage] = useState("");
  const [scannerActive, setScannerActive] = useState(false);

  /* ================= VERIFY ================= */

  const verifyProduct = async (id: string) => {
    setManualId(id);
    setStatus("verifying");
    setMessage("Validating on blockchain...");

    try {
      const res = await axios.get(
        `http://localhost:5000/api/product/verify/${id}`,
      );

      if (res.data.authentic) {
        setStatus("success");
        setMessage("Product Verified");

        setTimeout(() => router.push(`/verify/${id}`), 1200);
      } else {
        setStatus("error");
        setMessage(res.data.reason || "Fake product");
      }
    } catch {
      setStatus("error");
      setMessage("Verification failed");
    }
  };

  /* ================= CAMERA ================= */

  const handleScan = (result: string) => {
    verifyProduct(result);
  };

  /* ================= FILE UPLOAD (WORKING) ================= */

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const codeReader = new BrowserQRCodeReader();

      const result = await codeReader.decodeFromImageUrl(
        URL.createObjectURL(file),
      );

      verifyProduct(result.getText());
    } catch (err) {
      setStatus("error");
      setMessage("QR not detected");
    }
  };

  return (
    <div className="bg-gray-950 min-h-screen text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold mb-10 flex items-center gap-2">
          <ScanLine className="text-blue-500" />
          Scan Product
        </h1>

        <div className="grid md:grid-cols-2 gap-10">
          {/* LEFT */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 text-center">
            {!scannerActive ? (
              <button
                onClick={() => setScannerActive(true)}
                className="px-6 py-3 border border-blue-500 rounded-full text-blue-500 hover:bg-blue-500/10"
              >
                <Camera size={18} className="inline mr-2" />
                Start Camera
              </button>
            ) : (
              <QRScanner onScan={handleScan} />
            )}

            {/* STATUS */}
            {status === "verifying" && (
              <div className="flex justify-center mt-4 gap-2 text-blue-400">
                <Loader2 className="animate-spin" size={16} />
                {message}
              </div>
            )}

            {status === "success" && (
              <p className="text-green-400 mt-4">✅ {message}</p>
            )}

            {status === "error" && (
              <p className="text-red-400 mt-4">❌ {message}</p>
            )}

            {/* UPLOAD */}
            <div className="mt-6">
              <label className="cursor-pointer text-blue-400 flex items-center justify-center gap-2">
                <Upload size={16} />
                Upload QR Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* RIGHT */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h2 className="text-lg mb-4 flex items-center gap-2">
              <ShieldCheck className="text-green-500" />
              Manual Verification
            </h2>

            <div className="flex gap-3">
              <input
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="Enter Product ID"
                className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2"
              />

              <button
                onClick={() => verifyProduct(manualId)}
                className="bg-blue-600 px-5 py-2 rounded-lg"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
