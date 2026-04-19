"use client";

import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Link from "next/link";
import {
  ShieldCheck,
  QrCode,
  Database,
  Wrench,
  Factory,
  Repeat,
} from "lucide-react";
import { useState, useRef, useEffect, forwardRef, ReactNode } from "react";

/* ================= DATA ================= */

const allFeatures = [
  // MANUFACTURER
  {
    role: "manufacturer",
    icon: <Factory size={28} />,
    title: "Register Product",
    desc: "Create blockchain identity for products",
    href: "/manufacturer/register",
  },
  {
    role: "manufacturer",
    icon: <Database size={28} />,
    title: "Blockchain Ledger",
    desc: "View immutable records",
    href: "/ledger",
  },
  {
    role: "manufacturer",
    icon: <Repeat size={28} />,
    title: "Ownership Transfer",
    desc: "Transfer product ownership",
    href: "/transfer",
  },

  // USER
  {
    role: "user",
    icon: <QrCode size={28} />,
    title: "Scan Product",
    desc: "Scan QR to access product details",
    href: "/scan",
  },
  {
    role: "user",
    icon: <ShieldCheck size={28} />,
    title: "Verify Authenticity",
    desc: "Check product authenticity",
    href: "/verify",
  },
  {
    role: "user",
    icon: <ShieldCheck size={28} />,
    title: "Smart Warranty",
    desc: "View blockchain warranty",
    href: "/smart-warranty",
  },
  {
    role: "user",
    icon: <Wrench size={28} />,
    title: "Service History",
    desc: "Track repairs",
    href: "/service",
  },
];

/* ================= MAIN ================= */

export default function Home() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  // 🔹 refs for auto-scroll
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const features = allFeatures.filter((f) => f.role === role);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  // 🔹 auto-scroll effect
  useEffect(() => {
    if (activeStep !== null && itemRefs.current[activeStep]) {
      itemRefs.current[activeStep]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeStep]);
  if (!role) {
    return (
      <div className="bg-gray-950 min-h-screen text-white">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <p className="text-gray-400">Please login to access dashboard</p>
        </div>
      </div>
    );
  }
  return (
    <main className="bg-gray-950 text-white min-h-screen relative">
      <Navbar />

      {/* HEADER */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-semibold"
        >
          {role === "manufacturer" ? "Manufacturer Home" : "User Home"}
        </motion.h1>

        <p className="text-gray-400 mt-4 text-sm max-w-xl mx-auto">
          Blockchain-powered system for product authentication and lifecycle
          management.
        </p>

        <button
          onClick={() => setActiveStep(0)}
          className="mt-6 px-6 py-2 rounded-4xl bg-blue-600 hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
        >
          Start Guided Tour
        </button>
      </section>

      {/* ROADMAP */}
      <section className="max-w-5xl mx-auto px-6 pb-32 relative">
        {/* DOTTED LINE */}
        <div className="absolute left-1/2 top-0 h-full border-l border-dashed border-gray-700 -translate-x-1/2" />

        <div className="flex flex-col gap-20">
          {features.map((feature, index) => (
            <RoadmapItem
              key={index}
              {...feature}
              index={index}
              activeStep={activeStep}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
            />
          ))}
        </div>
      </section>

      {/* OVERLAY */}
      <AnimatePresence>
        {activeStep !== null && (
          <>
            {/* DARK BACKGROUND */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            />

            {/* BOTTOM PANEL */}
            <motion.div
              key={activeStep}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="fixed bottom-0 left-0 w-full bg-gray-900 border-t border-gray-800 z-50 p-6"
            >
              <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-blue-400">
                    Step {activeStep + 1}: {features[activeStep].title}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {features[activeStep].desc}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setActiveStep((prev) =>
                        prev! < features.length - 1 ? prev! + 1 : null,
                      )
                    }
                    className="px-5 py-2 bg-blue-600 rounded-full text-sm hover:bg-blue-700 transition"
                  >
                    Next
                  </button>

                  <button
                    onClick={() => setActiveStep(null)}
                    className="px-5 py-2 border border-gray-600 rounded-full text-sm hover:bg-gray-800 transition"
                  >
                    Exit
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}

/* ================= ROADMAP ITEM ================= */

interface RoadmapItemProps {
  icon: ReactNode;
  title: string;
  href: string;
  index: number;
  activeStep: number | null;
}

const RoadmapItem = forwardRef<HTMLDivElement, RoadmapItemProps>(
  ({ icon, title, href, index, activeStep }, ref) => {
    const isLeft = index % 2 === 0;
    const isActive = activeStep === index;

    return (
      <div
        ref={ref}
        className="relative flex items-center justify-between scroll-mt-32"
      >
        {/* LEFT */}
        {isLeft && (
          <motion.div
            layout
            className={`w-[45%] ${isActive ? "z-50 scale-105" : ""}`}
          >
            <CardContent
              icon={icon}
              title={title}
              href={href}
              isActive={isActive}
            />
          </motion.div>
        )}

        {/* CENTER DOT */}
        <div className="relative z-40 flex justify-center w-[10%]">
          <motion.div
            layout
            className={`w-5 h-5 rounded-full border-2 ${
              isActive
                ? "bg-blue-500 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
                : "bg-gray-900 border-gray-600"
            }`}
          />
        </div>

        {/* RIGHT */}
        {!isLeft && (
          <motion.div
            layout
            className={`w-[45%] ${isActive ? "z-50 scale-105" : ""}`}
          >
            <CardContent
              icon={icon}
              title={title}
              href={href}
              isActive={isActive}
            />
          </motion.div>
        )}
      </div>
    );
  },
);

RoadmapItem.displayName = "RoadmapItem";

/* ================= CARD ================= */

function CardContent({
  icon,
  title,
  href,
  isActive,
}: {
  icon: ReactNode;
  title: string;
  href: string;
  isActive: boolean;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`bg-gray-900/60 border border-gray-800 p-6 rounded-2xl flex items-center gap-4 transition-all duration-300
        ${isActive ? "ring-2 ring-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.5)]" : ""}
        hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]`}
      >
        {/* ICON */}
        <div className="text-blue-500 bg-blue-500/10 p-4 rounded-xl text-2xl">
          {icon}
        </div>

        {/* TEXT */}
        <div>
          <p className="font-medium">{title}</p>
        </div>
      </motion.div>
    </Link>
  );
}
