"use client";

import Navbar from "../../../app/components/Navbar";
import { useState } from "react";
import axios from "axios";
import QRCode from "react-qr-code";

export default function RegisterProduct() {
  const [form, setForm] = useState({
    name: "",
    serial: "",
    warranty: "",
  });

  const [productId, setProductId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/product/register",
        form,
      );

      setProductId(res.data.productId);

      // redirect after short delay
      setTimeout(() => {
        window.location.href = `/manufacturer/product/${res.data.productId}`;
      }, 1000);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="bg-gray-950 min-h-screen text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-semibold mb-10">Register Product</h1>

        <div className="grid md:grid-cols-2 gap-10">
          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="bg-gray-900 border border-gray-800 p-6 rounded-xl space-y-4"
          >
            <input
              name="name"
              placeholder="Product Name"
              className="w-full p-3 bg-gray-950 border border-gray-800 rounded"
              onChange={handleChange}
            />

            <input
              name="serial"
              placeholder="Serial Number"
              className="w-full p-3 bg-gray-950 border border-gray-800 rounded"
              onChange={handleChange}
            />

            <input
              name="warranty"
              placeholder="Warranty (days)"
              className="w-full p-3 bg-gray-950 border border-gray-800 rounded"
              onChange={handleChange}
            />

            <button
              className="w-full bg-blue-600 py-3 rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register Product"}
            </button>
          </form>

          {/* QR DISPLAY */}
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl flex flex-col items-center justify-center">
            {productId ? (
              <>
                <p className="text-green-400 mb-4">✅ Product Registered</p>

                <QRCode value={productId} size={160} />

                <p className="text-xs text-gray-400 mt-4">
                  Product ID: {productId}
                </p>
              </>
            ) : (
              <p className="text-gray-400 text-sm">
                QR will appear after registration
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
