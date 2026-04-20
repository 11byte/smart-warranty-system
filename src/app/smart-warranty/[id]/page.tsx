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
  Database,
  Wrench,
  AlertTriangle,
  Activity,
} from "lucide-react";

/* ================= MAIN ================= */

export default function SmartWarranty() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [now, setNow] = useState(Date.now());
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    const res = await axios.get(
      `http://localhost:5000/api/product/smart-warranty/${id}`
    );
    setData(res.data);
  };

  const handleService = async () => {
    setLoadingAction(true);
    await axios.post(
      "http://localhost:5000/api/product/service/schedule",
      {
        productId: data.product.productId,
        issue: "Auto preventive service",
      }
    );
    setLoadingAction(false);
    alert("Service scheduled");
  };

  const handleRenew = async () => {
    setLoadingAction(true);
    await axios.post(
      "http://localhost:5000/api/product/warranty/renew",
      {
        productId: data.product.productId,
      }
    );
    setLoadingAction(false);
    alert("Warranty renewed");
    fetchData();
  };

  if (!data)
    return <div className="text-white p-10">Loading intelligence...</div>;

  const percent =
    data.totalDays > 0
      ? (data.remainingDays / data.totalDays) * 100
      : 0;

  const daysLeft = Math.max(
    0,
    Math.floor((data.expiry * 1000 - now) / (1000 * 60 * 60 * 24))
  );

  const barColor =
    percent > 60 ? "bg-green-500" : percent > 30 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="bg-gray-950 min-h-screen text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-semibold">
            Smart Warranty Control Center
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Real-time lifecycle intelligence & automated actions
          </p>
        </div>

        {/* TOP GRID */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card
            label="Authenticity"
            value={data.authentic ? "Verified" : "Fake"}
            icon={data.authentic ? <ShieldCheck /> : <ShieldX />}
            color={data.authentic ? "green" : "red"}
          />

          <Card label="Status" value={data.warrantyStatus} icon={<Clock />} />

          <Card
            label="Remaining"
            value={`${daysLeft} days`}
            icon={<Clock />}
          />

          <Card
            label="Risk"
            value={getRiskLabel(data.riskScore)}
            icon={<AlertTriangle />}
            color={getRiskColor(data.riskScore)}
          />
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-8">
            {/* WARRANTY HEALTH */}
            <Panel title="Warranty Health" icon={<Activity size={16} />}>
              <div className="w-full bg-gray-800 h-4 rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  className={`h-full ${barColor} rounded-full`}
                />
              </div>

              <p className="text-sm text-gray-400 mt-2">
                {daysLeft} days remaining ({Math.round(percent)}%)
              </p>

              <p className="text-xs text-blue-400 mt-2">
                {getSmartSuggestion(daysLeft, data.riskScore)}
              </p>
            </Panel>

            {/* SERVICE HISTORY */}
            <Panel title="Service History" icon={<Wrench size={16} />}>
              {data.repairs.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No service records found
                </p>
              ) : (
                data.repairs.map((r: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between border-b border-gray-800 pb-2"
                  >
                    <div>
                      <p className="text-sm">{r.issue}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(r.timestamp)}
                      </p>
                    </div>
                    <Wrench size={14} className="text-blue-400" />
                  </div>
                ))
              )}
            </Panel>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">
            {/* ACTION CENTER */}
            <Panel title="Smart Actions">
              {(data.riskScore > 50 || daysLeft < 10) && (
                <button
                  onClick={handleService}
                  disabled={loadingAction}
                  className="w-full mb-3 bg-blue-600 hover:bg-blue-700 p-3 rounded-lg text-sm"
                >
                  🔧 Schedule Service
                </button>
              )}

              {(data.warrantyStatus === "expired" || daysLeft < 15) && (
                <button
                  onClick={handleRenew}
                  disabled={loadingAction}
                  className="w-full bg-green-600 hover:bg-green-700 p-3 rounded-lg text-sm"
                >
                  🛒 Renew Warranty
                </button>
              )}
            </Panel>

            {/* BLOCKCHAIN */}
            <Panel title="Blockchain Proof" icon={<Database size={16} />}>
              <p className="text-xs break-all text-gray-500">
                {data.txHash}
              </p>

              <p className="text-green-400 text-xs mt-2">
                Verified on chain
              </p>
            </Panel>

            {/* PRODUCT INFO */}
            <Panel title="Product Info">
              <Info label="ID" value={data.product.productId} />
              <Info label="Name" value={data.product.name} />
              <Info label="Serial" value={data.product.serial} />
              <Info label="Created" value={formatDate(data.createdAt)} />
              <Info label="Expiry" value={formatDate(data.expiry)} />
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= UI COMPONENTS ================= */

function Panel({ title, children, icon }: any) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 className="mb-4 font-semibold flex items-center gap-2">
        {icon} {title}
      </h2>
      {children}
    </div>
  );
}

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
        <p className="text-xl font-semibold">{value}</p>
      </div>
      <div className={colors[color]}>{icon}</div>
    </motion.div>
  );
}

function Info({ label, value }: any) {
  return (
    <p className="text-sm">
      <span className="text-gray-400">{label}: </span>
      <span>{value}</span>
    </p>
  );
}

/* ================= LOGIC ================= */

function getRiskLabel(score: number) {
  if (score > 70) return "High";
  if (score > 40) return "Moderate";
  return "Low";
}

function getRiskColor(score: number) {
  if (score > 70) return "red";
  if (score > 40) return "yellow";
  return "green";
}

function getSmartSuggestion(days: number, risk: number) {
  if (days <= 0) return "Warranty expired — immediate action required.";
  if (days < 7) return "Urgent: Expiring soon.";
  if (risk > 70) return "High failure risk detected.";
  if (risk > 40) return "Monitor usage.";
  return "System stable.";
}

function formatDate(ts: number) {
  if (!ts) return "-";
  return new Date(ts * 1000).toLocaleDateString();
}