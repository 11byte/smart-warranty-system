"use client";

import Navbar from "../../../../app/components/Navbar";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { motion } from "framer-motion";
import { Package } from "lucide-react";

export default function ProductHistory() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/product/list");
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  return (
    <div className="bg-gray-950 min-h-screen text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-semibold mb-10">Product History</h1>

        {/* Loading */}
        {loading && <p className="text-gray-400">Loading products...</p>}

        {/* Empty */}
        {!loading && products.length === 0 && (
          <p className="text-gray-400">No products found</p>
        )}

        {/* List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, i) => (
            <Link key={i} href={`/manufacturer/product/${product.productId}`}>
              <motion.div
                whileHover={{ scale: 1.04 }}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5 cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Package className="text-blue-500" />
                  <p className="font-semibold text-sm">{product.name}</p>
                </div>

                <p className="text-xs text-gray-400">
                  Serial: {product.serial}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Owner: {product.owner}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Created: {formatDate(product.createdAt)}
                </p>

                <p className="text-blue-400 text-xs mt-3">View Details →</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= UTIL ================= */

function formatDate(timestamp: number) {
  if (!timestamp) return "-";
  return new Date(timestamp * 1000).toLocaleDateString();
}
