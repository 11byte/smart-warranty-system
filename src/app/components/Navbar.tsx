"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="w-full border-b border-gray-800 bg-gray-950 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <ShieldCheck className="text-blue-500" />
          <span className="font-semibold text-lg text-white">Authify</span>
        </Link>

        <div className="flex items-center gap-8 text-gray-400">
          {/* <NavItem href="/scan">Scan</NavItem> */}
          <NavItem href="/home">Home</NavItem>
          <NavItem href="/dashboard">Dashboard</NavItem>
        </div>
      </div>
    </nav>
  );
}

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
