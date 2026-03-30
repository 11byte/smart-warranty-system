"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import {
  LayoutDashboard,
  Factory,
  Wrench,
  QrCode,
  Package,
  ShieldCheck,
} from "lucide-react";

const links = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Manufacturer",
    href: "/manufacturer",
    icon: Factory,
  },
  {
    name: "Service Center",
    href: "/service-center",
    icon: Wrench,
  },
  {
    name: "Scan Product",
    href: "/scan",
    icon: QrCode,
  },
  {
    name: "Products",
    href: "/manufacturer/product/history",
    icon: Package,
  },
  {
    name: "Verification Logs",
    href: "/verify",
    icon: ShieldCheck,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-950 border-r border-gray-800 h-screen p-6 flex flex-col">
      {/* Logo */}

      <div className="mb-10">
        <h1 className="text-xl font-semibold text-white">Authify</h1>
        <p className="text-xs text-gray-500">Smart Warranty System</p>
      </div>

      {/* Navigation */}

      <nav className="flex flex-col gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;

          return (
            <Link key={link.href} href={link.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:bg-gray-900"
                }`}
              >
                <Icon size={18} />

                {link.name}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}

      <div className="mt-auto text-xs text-gray-500 pt-6 border-t border-gray-800">
        Blockchain Product Verification
      </div>
    </aside>
  );
}
