"use client";

import Navbar from "../components/Navbar";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  QrCode,
  Wrench,
  History,
  CheckCircle,
  Clock,
  Activity,
} from "lucide-react";

export default function ServiceCenter() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/product/service/analytics",
    );
    setData(res.data);
  };

  if (!data) return <div className="text-white p-10">Loading...</div>;

  return (
    <div className="bg-gray-950 min-h-screen text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold">Service Center Dashboard</h1>
          <p className="text-gray-400 mt-2">
            Manage repairs, warranty validation, and service lifecycle
          </p>
        </div>

        {/* KPI CARDS */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <KPI
            label="Total Repairs"
            value={data.total_repairs}
            icon={<Wrench />}
          />

          <KPI
            label="Completed"
            value={data.completed}
            icon={<CheckCircle />}
            color="green"
          />

          <KPI
            label="Pending"
            value={data.pending}
            icon={<Clock />}
            color="yellow"
          />

          <KPI
            label="Activity"
            value={data.recent.length}
            icon={<Activity />}
          />
        </div>

        {/* QUICK ACTIONS */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold mb-6">Quick Actions</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <ActionCard
              href="/scan"
              title="Scan & Verify"
              desc="Check warranty authenticity instantly"
              icon={<QrCode />}
            />

            <ActionCard
              href="/service/log"
              title="Log Repair"
              desc="Add repair details to blockchain"
              icon={<Wrench />}
            />

            <ActionCard
              href="/service/history"
              title="Repair History"
              desc="View complete service lifecycle"
              icon={<History />}
            />
          </div>
        </div>

        {/* RECENT REPAIRS */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-6">Recent Repairs</h2>

          <div className="space-y-4">
            {data.recent.map((r: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-between border-b border-gray-800 pb-3"
              >
                <div>
                  <p className="text-sm">{r.issue || "Repair Logged"}</p>
                  <p className="text-xs text-gray-500">
                    Product ID: {r.productId}
                  </p>
                </div>

                <p className="text-xs text-gray-500">
                  {formatTime(r.timestamp)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* WARRANTY INSIGHT */}
        <div className="mt-12 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Warranty Insights</h2>

          <p className="text-sm text-gray-400">
            Products verified via blockchain ensure only genuine warranty claims
            are processed. Fraudulent repair attempts are automatically flagged
            during verification.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function KPI({ label, value, icon, color = "blue" }: any) {
  const colors: any = {
    blue: "text-blue-500",
    green: "text-green-500",
    yellow: "text-yellow-500",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex justify-between"
    >
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-2xl font-semibold mt-1">{value}</p>
      </div>

      <div className={colors[color]}>{icon}</div>
    </motion.div>
  );
}

function ActionCard({ href, title, desc, icon }: any) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.04 }}
        className="cursor-pointer bg-gray-900 border border-gray-800 rounded-xl p-6 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition"
      >
        <div className="text-blue-500 mb-4">{icon}</div>

        <h3 className="font-semibold">{title}</h3>
        <p className="text-gray-400 text-sm mt-2">{desc}</p>
      </motion.div>
    </Link>
  );
}

/* ================= UTILS ================= */

function formatTime(ts: number) {
  if (!ts) return "-";
  return new Date(ts * 1000).toLocaleTimeString();
}
