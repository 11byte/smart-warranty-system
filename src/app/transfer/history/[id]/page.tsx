"use client";

import Navbar from "../../../components/Navbar";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function OwnershipHistory({ params }: any) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await axios.get(
      `http://localhost:5000/api/product/ownership/${params.id}`,
    );
    setData(res.data);
  };

  return (
    <div className="bg-gray-950 min-h-screen text-white">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-semibold mb-10">Ownership Timeline</h1>

        <div className="relative border-l border-gray-800 pl-6 space-y-8">
          {data.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative"
            >
              {/* DOT */}
              <div className="absolute -left-[10px] top-2 w-3 h-3 bg-blue-500 rounded-full" />

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-sm">
                  <span className="text-gray-400">From:</span>{" "}
                  {short(item.from)}
                </p>

                <p className="text-sm mt-1">
                  <span className="text-gray-400">To:</span> {short(item.to)}
                </p>

                <p className="text-xs text-gray-500 mt-2">
                  {format(item.timestamp)}
                </p>

                <p className="text-xs text-blue-400 break-all mt-2">
                  {item.txHash}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= UTILS ================= */

function short(addr: string) {
  if (!addr) return "-";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function format(ts: number) {
  return new Date(ts * 1000).toLocaleString();
}
