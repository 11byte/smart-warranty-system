"use client";

import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  ShieldX,
  Clock,
  ArrowRight,
  Search,
  Filter,
} from "lucide-react";
import { useRouter } from "next/navigation";

/* ================= TYPES ================= */

interface Product {
  productId: string;
  name: string;
  authentic: boolean;
  warrantyStatus: string;
  expiry: number;
  remainingDays: number;
  totalDays: number;
}

/* ================= COMPONENT ================= */

export default function SmartWarrantyList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, filter, products]);

  const fetchData = async () => {
    try {
      const email = localStorage.getItem("email");

      const res = await axios.get(
        `http://localhost:5000/api/product/smart-warranty?email=${email}`
      );

      setProducts(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let data = [...products];

    // search
    if (search) {
      data = data.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // filter
    if (filter === "valid") {
      data = data.filter((p) => p.warrantyStatus === "valid");
    } else if (filter === "expired") {
      data = data.filter((p) => p.warrantyStatus === "expired");
    }

    // sort: nearest expiry first
    data.sort((a, b) => a.expiry - b.expiry);

    setFiltered(data);
  };

  return (
    <div className="bg-gray-950 min-h-screen text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-semibold">Smart Warranty Hub</h1>

          <p className="text-gray-400 mt-2">
            Intelligent tracking of your blockchain-backed warranties
          </p>
        </motion.div>

        {/* SEARCH + FILTER */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 w-full">
            <Search size={16} className="text-gray-500" />
            <input
              placeholder="Search products..."
              className="bg-transparent outline-none text-sm w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2">
            <Filter size={16} className="text-gray-500" />
            <select
              className="bg-transparent text-sm outline-none"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="valid">Valid</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-center text-gray-500">Loading warranties...</div>
        )}

        {/* GRID */}
        {!loading && (
          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map((p, i) => {
              const progress =
  p.totalDays > 0
    ? (p.remainingDays / p.totalDays) * 100
    : 0;

              return (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.03 }}
                  onClick={() =>
                    router.push(`/smart-warranty/${p.productId}`)
                  }
                  className="cursor-pointer bg-gray-900 border border-gray-800 rounded-xl p-6 transition hover:shadow-[0_0_25px_rgba(59,130,246,0.25)]"
                >
                  {/* HEADER */}
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">{p.name}</h3>
                    <ArrowRight className="text-gray-500" size={16} />
                  </div>

                  {/* ID */}
                  <p className="text-xs text-gray-500 mb-4">
                    {p.productId}
                  </p>

                  {/* STATUS */}
                  <div className="flex justify-between text-sm">
                    {/* AUTH */}
                    <div className="flex items-center gap-2">
                      {p.authentic ? (
                        <>
                          <ShieldCheck
                            className="text-green-500"
                            size={16}
                          />
                          <span className="text-green-400 text-xs">
                            Authentic
                          </span>
                        </>
                      ) : (
                        <>
                          <ShieldX
                            className="text-red-500"
                            size={16}
                          />
                          <span className="text-red-400 text-xs">
                            Fake
                          </span>
                        </>
                      )}
                    </div>

                    {/* WARRANTY */}
                    <div className="flex items-center gap-2">
                      <Clock className="text-blue-500" size={16} />
                      <span className="text-xs capitalize">
                        {p.warrantyStatus}
                      </span>
                    </div>
                  </div>

                  {/* EXPIRY */}
                  <p className="text-xs text-gray-400 mt-4">
                    Expires: {formatDate(p.expiry)}
                  </p>

                  {/* SMART INSIGHT */}
                  <p className="text-xs mt-2 text-blue-400">
                    {getSmartInsight(p)}
                  </p>

                  {/* PROGRESS */}
                  <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        p.warrantyStatus === "valid"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* FOOTER */}
                  <div className="mt-4 text-xs text-gray-500">
                    {p.remainingDays} days remaining
                  </div>
                </motion.div>
              );
            })}

            {filtered.length === 0 && (
              <div className="col-span-2 text-center text-gray-500 py-20">
                No warranties found. Try adjusting filters.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= UTILS ================= */

function formatDate(ts: number) {
  if (!ts) return "-";
  return new Date(ts * 1000).toLocaleDateString();
}


function getSmartInsight(p: Product) {
  if (p.warrantyStatus === "expired") return "Warranty expired";

  if (p.remainingDays < 0) return "Warranty expired";
  if (p.remainingDays < 7) return "⚠️ Expiring very soon";
  if (p.remainingDays < 30) return "Expiring within a month";

  return "Warranty active";
}