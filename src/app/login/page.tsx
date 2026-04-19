"use client";

import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Factory, User } from "lucide-react";
import axios from "axios";

export default function LoginPage() {
  const [role, setRole] = useState<"user" | "manufacturer">("user");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
        role, // 🔥 ADD THIS
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("email", res.data.email);

      if (res.data.role === "manufacturer") {
        router.push("/home");
      } else {
        router.push("/home");
      }
    } catch (err: any) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="bg-gray-950 min-h-screen text-white">
      <Navbar />

      <div className="flex items-center justify-center h-[80vh] px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8"
        >
          {/* HEADER */}
          <div className="text-center mb-8">
            <ShieldCheck className="mx-auto text-blue-500 mb-3" />
            <h1 className="text-2xl font-semibold">Login</h1>
            <p className="text-gray-400 text-sm mt-2">
              Access your role-based dashboard
            </p>
          </div>

          {/* ROLE TOGGLE */}
          <div className="flex bg-gray-800 rounded-full p-1 mb-8 relative">
            {/* SLIDER */}
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 300 }}
              className={`absolute top-1 bottom-1 w-1/2 rounded-full bg-blue-500/20`}
              style={{
                left: role === "user" ? "4px" : "50%",
              }}
            />

            {/* USER */}
            <button
              onClick={() => setRole("user")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full z-10 ${
                role === "user" ? "text-white" : "text-gray-400"
              }`}
            >
              <User size={16} />
              User
            </button>

            {/* MANUFACTURER */}
            <button
              onClick={() => setRole("manufacturer")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full z-10 ${
                role === "manufacturer" ? "text-white" : "text-gray-400"
              }`}
            >
              <Factory size={16} />
              Manufacturer
            </button>
          </div>

          {/* INPUTS */}
          <div className="space-y-5 mb-6">
            {/* EMAIL */}
            <div className="relative group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-950/60 backdrop-blur border border-gray-800 rounded-xl px-4 pt-5 pb-2 text-sm text-white placeholder-transparent focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Email"
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
                className="w-full bg-gray-950/60 backdrop-blur border border-gray-800 rounded-xl px-4 pt-5 pb-2 text-sm text-white placeholder-transparent focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Password"
              />
              <label className="absolute left-4 top-2 text-xs text-gray-400 group-focus-within:text-blue-400 transition">
                Password
              </label>
            </div>
          </div>

          {/* LOGIN BUTTON */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogin}
            className="w-full bg-blue-600 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Continue as {role === "user" ? "User" : "Manufacturer"}
          </motion.button>

          {/* FOOTER */}
          <p className="text-xs text-gray-500 text-center mt-6">
            Role-based access ensures secure operations across the platform
          </p>
          {/* REGISTER LINK */}
          <p className="text-sm text-gray-400 text-center mt-6">
            Don’t have an account?{" "}
            <span
              onClick={() => router.push("/register")}
              className="text-blue-500 cursor-pointer hover:underline"
            >
              Register
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
