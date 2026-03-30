"use client";

import { motion } from "framer-motion";

interface Props {
  id: string;
  name: string;
  warranty: string;
}

export default function ProductCard({ id, name, warranty }: Props) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="bg-gray-900 border border-gray-800 rounded-xl p-5"
    >
      <h3 className="text-white font-semibold">{name}</h3>

      <p className="text-gray-400 text-sm mt-1">Product ID: {id}</p>

      <p className="text-green-400 text-sm mt-3">Warranty: {warranty}</p>
    </motion.div>
  );
}
