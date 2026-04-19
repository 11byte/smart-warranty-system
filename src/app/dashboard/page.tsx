"use client";

import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Package, ShieldCheck, AlertTriangle, Activity } from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);

    fetchData();
  }, []);
  const fetchData = async () => {
    const res = await axios.get("http://localhost:5000/api/product/analytics");
    setData(res.data);
  };

  if (!data) return <div className="text-white p-10">Loading...</div>;
  if (!role) {
    return (
      <div className="bg-gray-950 min-h-screen text-white">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <p className="text-gray-400">Please login first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 min-h-screen text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* HEADER */}
        <h1 className="text-3xl font-semibold">
          {role === "manufacturer"
            ? "Manufacturer Dashboard"
            : "User Dashboard"}
        </h1>

        <p className="text-gray-400 mt-2">
          {role === "manufacturer"
            ? "Monitor product lifecycle, fraud detection, and blockchain activity"
            : "Track your product verifications and warranty insights"}
        </p>

        {/* KPI CARDS */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {role === "manufacturer" ? (
            <>
              <KPI
                label="Total Products"
                value={data.total}
                icon={<Package />}
              />

              <KPI
                label="Verified"
                value={data.verified}
                icon={<ShieldCheck />}
                color="green"
              />

              <KPI
                label="Fraud Detected"
                value={data.fake}
                icon={<AlertTriangle />}
                color="red"
              />

              <KPI
                label="System Activity"
                value={data.recent.length}
                icon={<Activity />}
              />
            </>
          ) : (
            <>
              <KPI
                label="Products Scanned"
                value={data.total}
                icon={<Package />}
              />

              <KPI
                label="Successful Verifications"
                value={data.verified}
                icon={<ShieldCheck />}
                color="green"
              />

              <KPI
                label="Fraud Alerts"
                value={data.fake}
                icon={<AlertTriangle />}
                color="red"
              />

              <KPI
                label="Recent Activity"
                value={data.recent.length}
                icon={<Activity />}
              />
            </>
          )}
        </div>

        {/* CHARTS */}
        {role === "manufacturer" ? (
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Verification Ratio */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="mb-4">Verification Ratio</h2>

              <div className="w-full bg-gray-800 h-4 rounded-full">
                <div
                  style={{
                    width: `${(data.verified / data.total) * 100}%`,
                  }}
                  className="h-full bg-green-500 rounded-full"
                />
              </div>
            </div>

            {/* Fraud */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="mb-4">Fraud Risk</h2>

              <div className="w-full bg-gray-800 h-4 rounded-full">
                <div
                  style={{
                    width: `${(data.fake / data.total) * 100}%`,
                  }}
                  className="h-full bg-red-500 rounded-full"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-12">
            <h2 className="mb-4">Your Verification Success</h2>

            <div className="w-full bg-gray-800 h-4 rounded-full">
              <div
                style={{
                  width: `${(data.verified / data.total) * 100}%`,
                }}
                className="h-full bg-blue-500 rounded-full"
              />
            </div>

            <p className="text-sm text-gray-400 mt-2">
              You verified {data.verified} products
            </p>
          </div>
        )}

        {/* ACTIVITY FEED */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-6">
            {role === "manufacturer" ? "Global Activity Feed" : "Your Activity"}
          </h2>

          <div className="space-y-4">
            {data.recent.map((a: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-between border-b border-gray-800 pb-3"
              >
                <div>
                  <p className="text-sm">
                    {a.event === "Verified"
                      ? "✅ Verified"
                      : "❌ Fraud Detected"}
                  </p>
                  <p className="text-xs text-gray-500">{a.product}</p>
                </div>

                <p className="text-xs text-gray-500">{formatTime(a.time)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= KPI ================= */

function KPI({ label, value, icon, color = "blue" }: any) {
  const colorMap: any = {
    blue: "text-blue-500",
    green: "text-green-500",
    red: "text-red-500",
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

      <div className={colorMap[color]}>{icon}</div>
    </motion.div>
  );
}

/* ================= UTILS ================= */

function formatTime(ts: number) {
  if (!ts) return "-";
  return new Date(ts * 1000).toLocaleTimeString();
}
