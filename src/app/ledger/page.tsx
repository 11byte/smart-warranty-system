"use client";

import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldX } from "lucide-react";
import { useRouter } from "next/navigation";
import HashText from "../components/HashText";

export default function LedgerUltra() {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [liveBlocks, setLiveBlocks] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    const res = await axios.get("http://localhost:5000/api/product/ledger");
    setBlocks(res.data);

    // 🔥 simulate live mining
    simulateLive(res.data);
  };

  const simulateLive = (data: any[]) => {
    let i = 0;

    const interval = setInterval(() => {
      setLiveBlocks((prev) => [...prev, data[i]]);
      i++;

      if (i >= data.length) clearInterval(interval);
    }, 500);
  };

  return (
    <div className="bg-gray-950 min-h-screen text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-semibold mb-12">Live Blockchain Ledger</h1>

        <div className="relative space-y-12">
          {liveBlocks.map((block, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="relative"
            >
              {/* CHAIN LINE */}
              {i !== liveBlocks.length - 1 && (
                <div className="absolute left-1/2 top-full w-[2px] h-12 bg-blue-500 animate-pulse" />
              )}

              {/* BLOCK */}
              <div
                onClick={() =>
                  router.push(`/manufacturer/product/${block.productId}`)
                }
                className="cursor-pointer bg-gray-900 border border-blue-500/30 rounded-xl p-6 hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] transition"
              >
                {/* HEADER */}
                <div className="flex justify-between mb-3">
                  <p className="text-blue-400 text-sm">Block #{block.index}</p>

                  {block.authentic ? (
                    <div className="flex items-center gap-1 text-green-400 text-xs animate-pulse">
                      <ShieldCheck size={14} />
                      Verified
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-400 text-xs">
                      <ShieldX size={14} />
                      Invalid
                    </div>
                  )}
                </div>

                {/* HASH ANIMATION */}
                <HashText text={block.hash} />

                {/* DETAILS */}
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Product</p>
                    <p>{block.name}</p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs">Time</p>
                    <p>{formatDate(block.timestamp)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= UTILS ================= */

function formatDate(timestamp: number) {
  if (!timestamp) return "-";
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString();
}
