"use client";

import Navbar from "../../../app/components/Navbar";
import { useState } from "react";
import axios from "axios";
import QRCode from "react-qr-code";
import { motion } from "framer-motion";

export default function RegisterProduct() {
  const [form, setForm] = useState({
    name: "",
    serial: "",
    warranty: "",
  });

  const [productId, setProductId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault(); // 🔥 FIX

    setLoading(true);
    setError("");

    try {
      const email = localStorage.getItem("email");

      if (!email) {
        setError("User not logged in");
        return;
      }

      const res = await axios.post(
        "http://localhost:5000/api/product/register",
        {
          ...form,
          email,
        },
      );

      setProductId(res.data.productId); // 🔥 FIX
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
    }

    setLoading(false);
  };

  return (
    <div className="bg-gray-950 min-h-screen text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-semibold mb-10">Register Product</h1>

        <div className="grid md:grid-cols-2 gap-10">
          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="bg-gray-900 border border-gray-800 p-6 rounded-xl space-y-5"
          >
            <input
              name="name"
              placeholder="Product Name"
              className="w-full p-3 bg-gray-950 border border-gray-800 rounded-lg focus:border-blue-500 outline-none"
              onChange={handleChange}
              required
            />

            <input
              name="serial"
              placeholder="Serial Number"
              className="w-full p-3 bg-gray-950 border border-gray-800 rounded-lg focus:border-blue-500 outline-none"
              onChange={handleChange}
              required
            />

            <input
              name="warranty"
              placeholder="Warranty (days)"
              className="w-full p-3 bg-gray-950 border border-gray-800 rounded-lg focus:border-blue-500 outline-none"
              onChange={handleChange}
            />

            <motion.button
              type="submit"
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              className="w-full bg-blue-600 py-3 rounded-lg hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register Product"}
            </motion.button>

            {error && <p className="text-red-400 text-sm">{error}</p>}
          </form>

          {/* QR DISPLAY */}
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl flex flex-col items-center justify-center">
            {productId ? (
              <>
                <p className="text-green-400 mb-4">✅ Product Registered</p>

                <QRCode value={productId} size={180} />

                <p className="text-xs text-gray-400 mt-4 break-all">
                  Product ID: {productId}
                </p>
              </>
            ) : (
              <p className="text-gray-400 text-sm text-center">
                QR will appear after registration
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
