"use client";

import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Wrench,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
} from "lucide-react";

/* ================= TYPES ================= */

interface Repair {
  productId: string;
  issue: string;
  status: string;
  timestamp: number;
}

/* ================= MAIN ================= */

export default function ServicePage() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [filtered, setFiltered] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, filter, repairs]);

  const fetchData = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/product/service/analytics"
      );

      setStats(res.data);
      setRepairs(res.data.recent || []);
      setFiltered(res.data.recent || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let data = [...repairs];

    if (search) {
      data = data.filter((r) =>
        r.productId.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filter === "completed") {
      data = data.filter((r) => r.status === "completed");
    } else if (filter === "pending") {
      data = data.filter((r) => r.status !== "completed");
    }

    setFiltered(data);
  };

  return (
    <div className="bg-gray-950 min-h-screen text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-semibold">
            Service Intelligence Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Track repairs, monitor product health & service lifecycle
          </p>
        </div>

        {/* STATS */}
        {stats && (
          <div className="grid md:grid-cols-3 gap-6">
            <StatCard
              label="Total Repairs"
              value={stats.total_repairs}
              icon={<Wrench />}
            />
            <StatCard
              label="Completed"
              value={stats.completed}
              icon={<CheckCircle />}
              color="green"
            />
            <StatCard
              label="Pending"
              value={stats.pending}
              icon={<Clock />}
              color="yellow"
            />
          </div>
        )}

        {/* SEARCH + FILTER */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 w-full">
            <Search size={16} />
            <input
              placeholder="Search by product ID..."
              className="bg-transparent outline-none text-sm w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* LIST */}
        {loading ? (
          <p className="text-gray-500">Loading service data...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500">No service records found</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex justify-between"
              >
                <div>
                  <p className="text-sm font-medium">{r.issue}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Product: {r.productId}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(r.timestamp)}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={r.status} />
                  <Wrench size={16} className="text-blue-400" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* SMART INSIGHT */}
        {stats && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="mb-3 font-semibold flex items-center gap-2">
              <AlertTriangle size={16} /> Service Insight
            </h2>

            <p className="text-sm text-gray-400">
              {getInsight(stats)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ label, value, icon, color = "blue" }: any) {
  const colors: any = {
    blue: "text-blue-500",
    green: "text-green-500",
    yellow: "text-yellow-500",
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex justify-between">
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
      <div className={colors[color]}>{icon}</div>
    </div>
  );
}

function StatusBadge({ status }: any) {
  const map: any = {
    completed: "bg-green-500/20 text-green-400",
    scheduled: "bg-yellow-500/20 text-yellow-400",
    pending: "bg-yellow-500/20 text-yellow-400",
  };

  return (
    <span className={`text-xs px-2 py-1 rounded ${map[status]}`}>
      {status}
    </span>
  );
}

/* ================= UTILS ================= */

function formatDate(ts: number) {
  return new Date(ts * 1000).toLocaleString();
}

function getInsight(stats: any) {
  if (stats.pending > stats.completed)
    return "High pending service load — consider prioritizing maintenance.";

  if (stats.total_repairs > 10)
    return "Frequent repairs detected — potential product reliability issues.";

  return "Service activity is within normal operational range.";
}