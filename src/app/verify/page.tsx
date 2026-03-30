"use client";

import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldX, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VerifyListPage() {
  const [products, setProducts] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await axios.get("http://localhost:5000/api/product/verified");
    setProducts(res.data);
  };

  return (
    <div className="bg-gray-950 min-h-screen text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold">Verified Products</h1>
          <p className="text-gray-400 mt-2">
            All products validated through blockchain
          </p>
        </div>

        {/* LIST */}
        <div className="grid md:grid-cols-2 gap-6">
          {products.map((p, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 cursor-pointer"
              onClick={() => router.push(`/verify/${p.productId}`)}
            >
              {/* STATUS */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  {p.authentic ? (
                    <ShieldCheck className="text-green-500" />
                  ) : (
                    <ShieldX className="text-red-500" />
                  )}

                  <p className="text-sm">
                    {p.authentic ? "Authentic" : "Unverified"}
                  </p>
                </div>

                <ArrowRight size={16} />
              </div>

              {/* DETAILS */}
              <h2 className="text-lg font-medium">{p.name}</h2>

              <p className="text-gray-400 text-sm mt-1">Serial: {p.serial}</p>

              <p className="text-gray-500 text-xs mt-3 break-all">
                ID: {p.productId}
              </p>
            </motion.div>
          ))}
        </div>

        {/* EMPTY */}
        {products.length === 0 && (
          <p className="text-gray-500 mt-10 text-center">No products found</p>
        )}
      </div>
    </div>
  );
}
