"use client";

import Navbar from "../../app/components/Navbar";
import { motion } from "framer-motion";
import { Package, ShieldCheck, Wrench, Clock, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import ProtectedRoute from "../components/ProtectedRoute";

export default function ManufacturerDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/product/");
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  /* ================= ANALYTICS ================= */

  const totalProducts = products.length;

  const now = Math.floor(Date.now() / 1000);

  const activeWarranty = products.filter((p) => p.warrantyExpiry > now).length;

  const expiredWarranty = products.filter(
    (p) => p.warrantyExpiry <= now,
  ).length;

  const stats = [
    {
      label: "Total Products",
      value: totalProducts,
      icon: <Package size={18} />,
    },
    {
      label: "Active Warranty",
      value: activeWarranty,
      icon: <ShieldCheck size={18} />,
    },
    {
      label: "Expired Warranty",
      value: expiredWarranty,
      icon: <Clock size={18} />,
    },
  ];

  return (
    <ProtectedRoute allowedRole="manufacturer">
      <div className="bg-gray-950 min-h-screen text-white">
        <Navbar />

        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-3xl font-semibold">Manufacturer Dashboard</h1>
              <p className="text-gray-400 mt-2">
                Monitor product lifecycle, warranty, and blockchain activity.
              </p>
            </div>

            <Link href="/manufacturer/product/history">
              <button className="flex items-center gap-2 px-5 py-2 rounded-full border border-blue-500 text-blue-500 hover:bg-blue-500/10 transition">
                View Products <ArrowRight size={16} />
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-900 border border-gray-800 p-6 rounded-xl"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{s.label}</p>
                    <p className="text-2xl font-semibold mt-1">{s.value}</p>
                  </div>
                  <div className="text-blue-500">{s.icon}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Warranty Distribution */}
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
              <h2 className="text-sm text-gray-400 mb-4">
                Warranty Distribution
              </h2>

              <div className="flex items-center gap-6">
                <Circle
                  value={activeWarranty}
                  label="Active"
                  color="bg-green-500"
                />
                <Circle
                  value={expiredWarranty}
                  label="Expired"
                  color="bg-red-500"
                />
              </div>
            </div>

            {/* Product Growth */}
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
              <h2 className="text-sm text-gray-400 mb-4">Product Timeline</h2>

              <div className="space-y-3">
                {products.slice(0, 5).map((p, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-xs text-gray-400"
                  >
                    <span>{p.name}</span>
                    <span>{formatDate(p.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Products */}
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-6">Recent Products</h2>

            {loading && <p className="text-gray-400">Loading...</p>}

            <div className="space-y-4">
              {products.slice(0, 5).map((p, i) => (
                <Link key={i} href={`/manufacturer/product/${p.productId}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex justify-between items-center border-b border-gray-800 pb-3 cursor-pointer"
                  >
                    <div>
                      <p className="text-gray-200 text-sm">{p.name}</p>
                      <p className="text-gray-500 text-xs">{p.serial}</p>
                    </div>

                    <p className="text-xs text-gray-500">
                      {formatDate(p.createdAt)}
                    </p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

/* ================= COMPONENTS ================= */

function Circle({ value, label, color }: any) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-16 h-16 rounded-full ${color} flex items-center justify-center text-white font-semibold`}
      >
        {value}
      </div>
      <p className="text-xs text-gray-400 mt-2">{label}</p>
    </div>
  );
}

/* ================= UTILS ================= */

function formatDate(timestamp: number) {
  if (!timestamp) return "-";
  return new Date(timestamp * 1000).toLocaleDateString();
}
