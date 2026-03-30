"use client";

import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function RegisterProductForm() {
  const [form, setForm] = useState({
    name: "",
    serial: "",
    warranty: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

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
      setResult(res.data);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-900 border border-gray-800 p-6 rounded-xl max-w-lg"
    >
      <h2 className="text-lg font-semibold mb-6">Register New Product</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="Warranty (in days)"
          className="w-full p-3 bg-gray-950 border border-gray-800 rounded"
          onChange={handleChange}
        />

        <button
          disabled={loading}
          className="w-full bg-blue-600 py-3 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Registering..." : "Register Product"}
        </button>
      </form>

      {/* RESULT */}
      {result && (
        <div className="mt-6 bg-gray-950 border border-gray-800 p-4 rounded">
          <p className="text-green-400 text-sm">✅ Product Registered</p>

          <p className="text-xs text-gray-400 mt-2">
            Product ID: {result.productId}
          </p>
        </div>
      )}
    </motion.div>
  );
}
