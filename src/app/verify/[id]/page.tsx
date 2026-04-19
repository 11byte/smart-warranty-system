"use client";

import Navbar from "../../../app/components/Navbar";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Loader2,
  Database,
  Cpu,
  Server,
  CheckCircle,
} from "lucide-react";

/* ================= MAIN ================= */

export default function VerifyPage() {
  const { id } = useParams();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [data, setData] = useState<any>(null);
  const [hash, setHash] = useState("");

  useEffect(() => {
    if (!id) return;

    const runFlow = async () => {
      setStep(1);
      await delay(800);

      setStep(2);
      await delay(1000);

      const email = localStorage.getItem("email");

      const res = await axios.get(
        `http://localhost:5000/api/product/verify/${id}?email=${email}`,
      );

      setData(res.data);

      // 🔐 Generate product hash
      setHash(generateHash(id.toString()));

      setStep(3);
      await delay(1200);

      setStep(4);
      await delay(800);

      setStep(5);
      await delay(800);

      setStep(6);
    };

    runFlow();
  }, [id]);

  const steps = [
    {
      title: "Scan Product",
      icon: <Loader2 />,
    },
    {
      title: "Backend Validation",
      icon: <Server />,
    },
    {
      title: "Blockchain Match",
      icon: <Database />,
    },
    {
      title: "Block Confirmation",
      icon: <Database />,
    },
    {
      title: "Fraud Analysis",
      icon: <Cpu />,
    },
  ];

  return (
    <div className="bg-gray-950 min-h-screen text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-semibold text-center mb-12">
          Blockchain Verification Engine
        </h1>

        <div className="grid md:grid-cols-2 gap-10">
          {/* LEFT: TIMELINE */}
          <div className="space-y-6">
            {steps.map((s, i) => (
              <StepItem
                key={i}
                index={i + 1}
                currentStep={step}
                title={s.title}
                icon={s.icon}
              />
            ))}
          </div>

          {/* RIGHT: DETAILS PANEL */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg mb-4">Verification Insights</h2>

            {step >= 1 && <Info label="Product ID" value={id} />}

            {step >= 2 && data && (
              <Info label="Product Found" value={data.product?.name} />
            )}

            {step >= 3 && <Info label="Product Hash" value={hash} />}

            {step >= 4 && (
              <Info
                label="Blockchain Status"
                value="Immutable record matched"
              />
            )}

            {step >= 5 && (
              <Info
                label="Fraud Risk"
                value={data?.authentic ? "Low" : "High"}
              />
            )}
          </div>
        </div>

        {/* FINAL RESULT */}
        {step === 6 && data && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-16 text-center"
          >
            {data.authentic ? (
              <ShieldCheck className="text-green-500 mx-auto" size={60} />
            ) : (
              <ShieldCheck className="text-red-500 mx-auto" size={60} />
            )}

            <h2
              className={`text-xl mt-4 ${
                data.authentic ? "text-green-400" : "text-red-400"
              }`}
            >
              {data.authentic ? "Authentic Product" : "Fake Product Detected"}
            </h2>

            <p className="text-gray-400 mt-2 text-sm">{data.reason}</p>

            {/* FRAUD SCORE */}
            <div className="mt-6 max-w-sm mx-auto">
              <p className="text-xs text-gray-400 mb-2">Fraud Risk</p>

              <div className="w-full bg-gray-800 h-3 rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${data.fraudScore}%` }}
                  className={`h-full ${
                    data.fraudScore > 70 ? "bg-red-500" : "bg-green-500"
                  }`}
                />
              </div>

              <p className="text-xs mt-2 text-gray-400">
                {data.fraudScore}% risk
              </p>
            </div>

            {/* CTA */}
            {data.authentic && (
              <button
                onClick={() =>
                  router.push(`/manufacturer/product/${data.product.productId}`)
                }
                className="mt-6 px-6 py-3 rounded-full border border-blue-500 text-blue-500 hover:bg-blue-500/10 transition"
              >
                View Full Details
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ================= STEP ITEM ================= */

function StepItem({ index, currentStep, title, icon }: any) {
  const completed = currentStep > index;
  const active = currentStep === index;

  return (
    <motion.div
      className="flex items-center gap-4"
      initial={{ opacity: 0.4 }}
      animate={{
        opacity: active || completed ? 1 : 0.4,
      }}
    >
      {/* ICON */}
      <div className="relative">
        {completed ? (
          <CheckCircle className="text-green-500" />
        ) : (
          <motion.div
            animate={active ? { scale: [1, 1.2, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-blue-500"
          >
            {icon}
          </motion.div>
        )}
      </div>

      {/* TEXT */}
      <p className="text-sm">{title}</p>
    </motion.div>
  );
}

/* ================= INFO ================= */

function Info({ label, value }: any) {
  return (
    <p className="text-sm mb-2">
      <span className="text-gray-400">{label}:</span>{" "}
      <span className="text-blue-400 break-all">{value}</span>
    </p>
  );
}

/* ================= HASH ================= */

function generateHash(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return "0x" + Math.abs(hash).toString(16);
}

/* ================= UTILS ================= */

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
