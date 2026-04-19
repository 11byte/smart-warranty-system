"use client";

import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Factory, ShieldCheck } from "lucide-react";
import axios from "axios";

export default function RegisterPage() {
  const [role, setRole] = useState<"user" | "manufacturer">("user");
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");

  const handleRegister = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
        role,
        company,
      });

      router.push("/login");
    } catch (err: any) {
      alert(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="bg-gray-950 min-h-screen text-white">
      <Navbar />

      <div className="flex items-center justify-center h-[85vh] px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8"
        >
          {/* HEADER */}
          <div className="text-center mb-8">
            <ShieldCheck className="mx-auto text-blue-500 mb-3" />
            <h1 className="text-2xl font-semibold">Create Account</h1>
            <p className="text-gray-400 text-sm mt-2">
              Join the smart warranty ecosystem
            </p>
          </div>

          {/* ROLE TOGGLE */}
          <div className="flex bg-gray-800 rounded-full p-1 mb-8 relative">
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 300 }}
              className="absolute top-1 bottom-1 w-1/2 rounded-full bg-blue-500/20"
              style={{
                left: role === "user" ? "4px" : "50%",
              }}
            />

            <button
              onClick={() => setRole("user")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 z-10 ${
                role === "user" ? "text-white" : "text-gray-400"
              }`}
            >
              <User size={16} />
              User
            </button>

            <button
              onClick={() => setRole("manufacturer")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 z-10 ${
                role === "manufacturer" ? "text-white" : "text-gray-400"
              }`}
            >
              <Factory size={16} />
              Manufacturer
            </button>
          </div>

          {/* FORM */}
          <div className="space-y-5 mb-6">
            {/* NAME */}
            <div className="relative group">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Full Name"
                className="w-full bg-gray-950/60 backdrop-blur border border-gray-800 rounded-xl px-4 pt-5 pb-2 text-sm text-white placeholder-transparent focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all hover:border-blue-500/50"
              />
              <label className="absolute left-4 top-2 text-xs text-gray-400 group-focus-within:text-blue-400 transition">
                Full Name
              </label>
            </div>

            {/* EMAIL */}
            <div className="relative group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email"
                className="w-full bg-gray-950/60 backdrop-blur border border-gray-800 rounded-xl px-4 pt-5 pb-2 text-sm text-white placeholder-transparent focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all hover:border-blue-500/50"
              />
              <label className="absolute left-4 top-2 text-xs text-gray-400 group-focus-within:text-blue-400 transition">
                Email Address
              </label>
            </div>

            {/* PASSWORD */}
            <div className="relative group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
                className="w-full bg-gray-950/60 backdrop-blur border border-gray-800 rounded-xl px-4 pt-5 pb-2 text-sm text-white placeholder-transparent focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all hover:border-blue-500/50"
              />
              <label className="absolute left-4 top-2 text-xs text-gray-400 group-focus-within:text-blue-400 transition">
                Password
              </label>
            </div>

            {/* COMPANY (ONLY FOR MANUFACTURER) */}
            {role === "manufacturer" && (
              <div className="relative group">
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Company Name"
                  className="w-full bg-gray-950/60 backdrop-blur border border-gray-800 rounded-xl px-4 pt-5 pb-2 text-sm text-white placeholder-transparent focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all hover:border-blue-500/50"
                />
                <label className="absolute left-4 top-2 text-xs text-gray-400 group-focus-within:text-blue-400 transition">
                  Company Name
                </label>
              </div>
            )}
          </div>

          {/* REGISTER BUTTON */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRegister}
            className="w-full bg-blue-600 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Register as {role === "user" ? "User" : "Manufacturer"}
          </motion.button>

          {/* LOGIN LINK */}
          <p className="text-sm text-gray-400 text-center mt-6">
            Already have an account?{" "}
            <span
              onClick={() => router.push("/login")}
              className="text-blue-500 cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
