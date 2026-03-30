"use client";

import Navbar from "../../../components/Navbar";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";

export default function ProductPage() {
  const { id } = useParams();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/product/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  /* ================= DOWNLOAD QR ================= */

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgData = serializer.serializeToString(svg);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.onload = () => {
      canvas.width = 200;
      canvas.height = 200;

      ctx?.drawImage(img, 0, 0);

      const pngFile = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.download = `${product.productId}.png`;
      link.href = pngFile;
      link.click();
    };

    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="bg-gray-950 min-h-screen text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-semibold mb-10">Product Details</h1>

        {/* Loading */}
        {loading && <p className="text-gray-400">Loading product...</p>}

        {/* Not Found */}
        {!loading && !product && (
          <p className="text-red-400">Product not found</p>
        )}

        {/* Product */}
        {product && (
          <div className="grid md:grid-cols-2 gap-10">
            {/* DETAILS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 border border-gray-800 p-6 rounded-xl space-y-4"
            >
              <Info label="Product ID" value={product.productId} />
              <Info label="Name" value={product.name} />
              <Info label="Serial" value={product.serial} />
              <Info label="Manufacturer" value={product.manufacturer} />
              <Info label="Owner" value={product.owner} />

              <Info
                label="Warranty Expiry"
                value={formatDate(product.warrantyExpiry)}
              />

              <Info label="Created At" value={formatDate(product.createdAt)} />
            </motion.div>

            {/* QR SECTION */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 border border-gray-800 p-6 rounded-xl flex flex-col items-center justify-center"
            >
              <h2 className="text-lg font-medium mb-4">Product QR Code</h2>

              <div ref={qrRef} className="bg-white p-4 rounded-xl">
                <QRCode value={product.productId} size={180} />
              </div>

              <button
                onClick={downloadQR}
                className="mt-5 px-5 py-2 rounded-full border border-blue-500 text-blue-500 hover:bg-blue-500/10 transition"
              >
                Download QR
              </button>

              <p className="text-xs text-gray-400 mt-4 text-center">
                Scan this QR to verify product authenticity and access
                blockchain records.
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= UI ================= */

function Info({ label, value }: any) {
  return (
    <p>
      <span className="text-gray-400">{label}:</span>{" "}
      <span className="text-white">{value}</span>
    </p>
  );
}

/* ================= UTILS ================= */

function formatDate(timestamp: number) {
  if (!timestamp) return "-";
  return new Date(timestamp * 1000).toLocaleDateString();
}
