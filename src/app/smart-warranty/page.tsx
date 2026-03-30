"use client";

import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldX, Clock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SmartWarrantyList() {
  const [products, setProducts] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/product/smart-warranty",
    );
    setProducts(res.data);
  };

  return (
    <div className="bg-gray-950 min-h-screen text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-3xl font-semibold">Smart Warranty Hub</h1>

          <p className="text-gray-400 mt-2">
            View and manage all blockchain-backed product warranties
          </p>
        </motion.div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 gap-6">
          {products.map((p, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03 }}
              onClick={() => router.push(`/smart-warranty/${p.productId}`)}
              className="cursor-pointer bg-gray-900 border border-gray-800 rounded-xl p-6 transition hover:shadow-[0_0_25px_rgba(59,130,246,0.25)]"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">{p.name}</h3>

                <ArrowRight className="text-gray-500" size={16} />
              </div>

              {/* INFO */}
              <p className="text-xs text-gray-500 mb-4">{p.productId}</p>

              {/* STATUS */}
              <div className="flex justify-between text-sm">
                {/* AUTH */}
                <div className="flex items-center gap-2">
                  {p.authentic ? (
                    <>
                      <ShieldCheck className="text-green-500" size={16} />
                      <span className="text-green-400 text-xs">Authentic</span>
                    </>
                  ) : (
                    <>
                      <ShieldX className="text-red-500" size={16} />
                      <span className="text-red-400 text-xs">Fake</span>
                    </>
                  )}
                </div>

                {/* WARRANTY */}
                <div className="flex items-center gap-2">
                  <Clock className="text-blue-500" size={16} />
                  <span className="text-xs capitalize">{p.warrantyStatus}</span>
                </div>
              </div>

              {/* EXPIRY */}
              <p className="text-xs text-gray-500 mt-4">
                Expires: {formatDate(p.expiry)}
              </p>

              {/* PROGRESS BAR */}
              <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    p.warrantyStatus === "valid" ? "bg-green-500" : "bg-red-500"
                  }`}
                  style={{ width: "70%" }} // can make dynamic later
                />
              </div>
            </motion.div>
          ))}

          {products.length === 0 && (
            <p className="text-gray-500 text-center col-span-2">
              No products found
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= UTILS ================= */

function formatDate(ts: number) {
  if (!ts) return "-";
  return new Date(ts * 1000).toLocaleDateString();
}
