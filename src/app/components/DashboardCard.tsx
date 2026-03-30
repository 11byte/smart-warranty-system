"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  title: string;
  description: string;
  icon: ReactNode;
}

export default function DashboardCard({ title, description, icon }: Props) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
      className="p-6 rounded-xl bg-gray-900 border border-gray-800 cursor-pointer"
    >
      <div className="mb-4 text-blue-500">{icon}</div>

      <h3 className="text-white text-lg font-semibold">{title}</h3>

      <p className="text-gray-400 text-sm mt-2">{description}</p>
    </motion.div>
  );
}
