"use client";

import Navbar from "../../components/Navbar";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  ShieldX,
  Clock,
  Cpu,
  Database,
  Wrench,
} from "lucide-react";

export default function SmartWarranty() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await axios.get(
      `http://localhost:5000/api/product/smart-warranty/${id}`,
    );
    setData(res.data);
  };

  if (!data) return <div className="text-white p-10">Loading...</div>;

  const warrantyPercent = (data.remainingDays / data.totalDays) * 100;

  return (
    <div className="bg-gray-950 min-h-screen text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* HEADER */}
        <h1 className="text-3xl font-semibold mb-10">
          Smart Warranty Intelligence
        </h1>

        {/* TOP STATUS */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card
            label="Authenticity"
            value={data.authentic ? "Verified" : "Fake"}
            icon={data.authentic ? <ShieldCheck /> : <ShieldX />}
            color={data.authentic ? "green" : "red"}
          />

          <Card
            label="Warranty Status"
            value={data.warrantyStatus}
            icon={<Clock />}
          />

          <Card
            label="Remaining Days"
            value={`${data.remainingDays} days`}
            icon={<Clock />}
          />
        </div>

        {/* WARRANTY PROGRESS */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-12">
          <h2 className="mb-4 font-semibold">Warranty Health</h2>

          <div className="w-full bg-gray-800 h-4 rounded-full">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${warrantyPercent}%` }}
              className="h-full bg-green-500 rounded-full"
            />
          </div>

          <p className="text-sm text-gray-400 mt-2">
            {data.remainingDays} days remaining
          </p>
        </div>

        {/* BLOCKCHAIN DETAILS */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-12">
          <h2 className="mb-4 font-semibold flex items-center gap-2">
            <Database size={16} /> Blockchain Proof
          </h2>

          <p className="text-xs text-gray-500 break-all">{data.txHash}</p>

          <div className="flex items-center gap-2 mt-4 text-green-400 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
            Verified on blockchain
          </div>
        </div>

        {/* PRODUCT DETAILS */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-12">
          <h2 className="mb-4 font-semibold">Product Info</h2>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <Info label="Product ID" value={data.product.productId} />
            <Info label="Name" value={data.product.name} />
            <Info label="Manufacturer" value={data.product.manufacturer} />
            <Info label="Serial" value={data.product.serial} />
            <Info label="Created At" value={formatDate(data.createdAt)} />
            <Info label="Expiry Date" value={formatDate(data.expiry)} />
          </div>
        </div>

        {/* SERVICE ANALYTICS */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-12">
          <h2 className="mb-6 font-semibold">Service History</h2>

          <div className="space-y-4">
            {data.repairs.map((r: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-between border-b border-gray-800 pb-3"
              >
                <div>
                  <p className="text-sm">{r.issue || "Repair"}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(r.timestamp)}
                  </p>
                </div>

                <Wrench className="text-blue-500" size={16} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI INSIGHT */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="mb-4 font-semibold">AI Insight</h2>

          <p className="text-sm text-gray-400">
            {data.riskScore > 70
              ? "High risk: Possible fraud or abnormal repair frequency detected."
              : data.riskScore > 40
                ? "Moderate risk: Monitor service usage."
                : "Low risk: Product lifecycle is healthy and normal."}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Card({ label, value, icon, color = "blue" }: any) {
  const colors: any = {
    blue: "text-blue-500",
    green: "text-green-500",
    red: "text-red-500",
    yellow: "text-yellow-500",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex justify-between"
    >
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-xl font-semibold mt-1">{value}</p>
      </div>

      <div className={colors[color]}>{icon}</div>
    </motion.div>
  );
}

function Info({ label, value }: any) {
  return (
    <p>
      <span className="text-gray-400">{label}:</span> <span>{value}</span>
    </p>
  );
}

/* ================= UTILS ================= */

function formatDate(ts: number) {
  if (!ts) return "-";
  return new Date(ts * 1000).toLocaleDateString();
}
