"use client";

import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Loader2, Unlock, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function OwnershipPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  /* ================= INIT ================= */

  useEffect(() => {
    const wallet = localStorage.getItem("wallet");
    const email = localStorage.getItem("email");

    if (wallet && email) {
      setUser({ email, wallet });
      fetchProducts(wallet);
    }
  }, []);

  const fetchProducts = async (wallet: string) => {
    const res = await axios.get("http://localhost:5000/api/product/list");

    // 🔥 FILTER ONLY OWNED PRODUCTS
    const owned = res.data.filter((p: any) => p.owner === wallet);
    setProducts(owned);
  };

  /* ================= DISOWN ================= */

  const handleDisown = async (productId: string) => {
    if (!user) return;

    setLoadingId(productId);

    try {
      await axios.post("http://localhost:5000/api/product/disown", {
        productId,
        email: user.email,
      });

      // 🔥 REMOVE FROM UI
      setProducts((prev) => prev.filter((p) => p.productId !== productId));
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to release ownership");
    }

    setLoadingId(null);
  };

  /* ================= UI ================= */

  return (
    <div className="bg-gray-950 min-h-screen text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold">Your Owned Products</h1>
          <p className="text-gray-400 mt-2">
            Manage ownership of your verified products
          </p>
        </div>

        {/* EMPTY STATE */}
        {products.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <p>No owned products found</p>
            <p className="text-sm mt-2">Verify a product to claim ownership</p>
          </div>
        )}

        {/* PRODUCT LIST */}
        <div className="grid md:grid-cols-2 gap-6">
          {products.map((p) => (
            <motion.div
              key={p.productId}
              whileHover={{ scale: 1.02 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-green-500" size={18} />
                  <p className="text-sm">You are the owner</p>
                </div>
              </div>

              {/* DETAILS */}
              <div>
                <h2 className="text-lg font-medium">{p.name}</h2>
                <p className="text-gray-400 text-sm mt-1">Serial: {p.serial}</p>

                <p className="text-gray-500 text-xs mt-2 break-all">
                  ID: {p.productId}
                </p>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                {/* HISTORY */}
                <Link href={`/transfer/history/${p.productId}`}>
                  <button className="text-blue-400 text-sm hover:underline">
                    View History
                  </button>
                </Link>

                {/* DISOWN */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDisown(p.productId)}
                  disabled={loadingId === p.productId}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition disabled:opacity-50"
                >
                  {loadingId === p.productId ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <Unlock size={14} />
                  )}
                  Release
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
