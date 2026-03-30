"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "./components/Navbar";
import {
  ShieldCheck,
  QrCode,
  Database,
  Wrench,
  ArrowRight,
  Blocks,
} from "lucide-react";

/* ================= MAIN ================= */

export default function Landing() {
  return (
    <main className="bg-gray-950 text-white min-h-screen antialiased overflow-hidden">
      <Navbar />

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-28 pb-20 text-center relative">
        {/* subtle animated glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent blur-3xl" />

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-semibold tracking-tight relative z-10"
        >
          Secure Product Authentication
          <br />
          Powered by Blockchain
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 mt-6 max-w-xl mx-auto relative z-10"
        >
          Eliminate counterfeit products, automate warranty tracking, and create
          a transparent product lifecycle using decentralized technology.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 relative z-10"
        >
          <Link href="/home">
            <button className="px-8 py-3 rounded-4xl border border-blue-500 text-blue-500 hover:bg-blue-500/10 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300 flex items-center gap-2 mx-auto">
              Enter Platform <ArrowRight size={18} />
            </button>
          </Link>
        </motion.div>
      </section>

      {/* HOW IT WORKS FLOW */}
      <section className="max-w-6xl mx-auto px-6 pb-28">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center text-2xl font-semibold mb-12"
        >
          How It Works
        </motion.h2>

        <div className="relative flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Animated connector line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 1 }}
            className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500/20 via-blue-500 to-blue-500/20 origin-left"
          />

          <Step
            icon={<QrCode size={26} />}
            title="Scan"
            desc="Scan QR code attached to product"
          />

          <Step
            icon={<ShieldCheck size={26} />}
            title="Verify"
            desc="Check authenticity using blockchain"
          />

          <Step
            icon={<Database size={26} />}
            title="Ledger"
            desc="Access immutable product data"
          />

          <Step
            icon={<Wrench size={26} />}
            title="Track"
            desc="Monitor service & lifecycle"
          />
        </div>
      </section>

      {/* BLOCKCHAIN EXPLANATION */}
      <section className="max-w-5xl mx-auto px-6 pb-28 text-center">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-2xl font-semibold mb-8"
        >
          How Blockchain Powers This System
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-6">
          <InfoCard
            icon={<Blocks />}
            title="Decentralized Identity"
            desc="Each product gets a unique identity stored securely on blockchain."
          />

          <InfoCard
            icon={<Database />}
            title="Immutable Records"
            desc="All transactions are tamper-proof and permanently recorded."
          />

          <InfoCard
            icon={<ShieldCheck />}
            title="Trust & Transparency"
            desc="Every stakeholder can verify authenticity without intermediaries."
          />
        </div>
      </section>

      {/* VALUE SECTION */}
      <section className="max-w-4xl mx-auto px-6 pb-32 text-center">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-2xl font-semibold mb-6"
        >
          Why This Matters
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-gray-400 leading-relaxed"
        >
          Counterfeit products cost billions globally. Our platform ensures
          authenticity, automates warranty management, and builds trust between
          manufacturers and consumers through transparent, blockchain-backed
          verification.
        </motion.p>
      </section>
    </main>
  );
}

/* ================= STEP ================= */

function Step({ icon, title, desc }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 bg-gray-900/60 border border-gray-800 p-6 rounded-2xl text-center w-full md:w-48"
    >
      <div className="text-blue-500 mb-3 flex justify-center">{icon}</div>
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="text-gray-400 text-xs mt-2">{desc}</p>
    </motion.div>
  );
}

/* ================= INFO CARD ================= */

function InfoCard({ icon, title, desc }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-gray-900/60 border border-gray-800 p-6 rounded-2xl text-center"
    >
      <div className="text-blue-500 mb-3 flex justify-center">{icon}</div>
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="text-gray-400 text-xs mt-2">{desc}</p>
    </motion.div>
  );
}
