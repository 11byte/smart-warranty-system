"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [role, setRole] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedName = localStorage.getItem("name"); // optional

    setRole(storedRole);
    setName(storedName || "User");
  }, []);

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");

    router.push("/");
  };

  return (
    <nav className="w-full border-b border-gray-800 bg-gray-950 sticky top-0 z-50 backdrop-blur">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <ShieldCheck className="text-blue-500" />
          <span className="font-semibold text-lg text-white">Authify</span>
        </Link>

        {/* NAV LINKS */}
        <div className="flex items-center gap-8 text-gray-400">
          <NavItem href="/home">Home</NavItem>
          <NavItem href="/dashboard">Dashboard</NavItem>

          {/* 🔥 AUTH SECTION */}
          {!role ? (
            /* LOGIN BUTTON */
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="ml-4 px-5 py-2 rounded-full border border-blue-500 text-blue-500 hover:bg-blue-500/10 transition-all"
              >
                Login
              </motion.button>
            </Link>
          ) : (
            /* USER PROFILE */
            <div
              className="relative ml-4"
              onMouseEnter={() => setOpen(true)}
              onMouseLeave={() => setOpen(false)}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 border border-gray-800 cursor-pointer"
              >
                <User size={16} className="text-blue-400" />
                <span className="text-sm text-white">{name}</span>
              </motion.div>

              {/* DROPDOWN */}
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-40 bg-gray-900 border border-gray-800 rounded-xl shadow-lg overflow-hidden"
                  >
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-gray-800 transition"
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

/* ================= NAV ITEM ================= */

function NavItem({ href, children }: any) {
  return (
    <Link href={href} className="relative group">
      <span className="group-hover:text-white transition">{children}</span>

      <motion.span
        layoutId="underline"
        className="absolute left-0 -bottom-1 h-[2px] w-0 bg-blue-500 group-hover:w-full transition-all"
      />
    </Link>
  );
}
