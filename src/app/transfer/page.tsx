"use client";

import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";

export default function TransferPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [productId, setProductId] = useState("");
  const [newOwner, setNewOwner] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    const p = await axios.get("http://localhost:5000/api/product/list");
    const u = await axios.get("http://localhost:5000/api/users/list");

    setProducts(p.data);
    setUsers(u.data);
  };

  /* ================= TRANSFER ================= */

  const handleTransfer = async () => {
    if (!productId || !newOwner) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/product/transfer",
        { productId, newOwner },
      );

      setResult(res.data);
    } catch (err: any) {
      setResult({
        error: err.response?.data?.error || "Transfer failed",
      });
    }

    setLoading(false);
  };

  const selectedProduct = products.find((p) => p.productId === productId);
  const selectedUser = users.find((u) => u.wallet === newOwner);

  return (
    <div className="bg-gray-950 min-h-screen text-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-16 space-y-10">
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-semibold">Ownership Transfer</h1>
          <p className="text-gray-400 mt-2">
            Securely transfer product ownership on blockchain
          </p>
        </div>

        {/* FORM CARD */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
          {/* PRODUCT SELECT */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Select Product
            </label>

            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">Choose product</option>
              {products.map((p) => (
                <option key={p.productId} value={p.productId}>
                  {p.name} ({p.productId})
                </option>
              ))}
            </select>
          </div>

          {/* USER SELECT */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              New Owner
            </label>

            <select
              value={newOwner}
              onChange={(e) => setNewOwner(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">Choose user</option>
              {users
                .filter((u) => u.wallet)
                .map((u) => (
                  <option key={u.wallet} value={u.wallet}>
                    {u.name} ({u.wallet.slice(0, 6)}...)
                  </option>
                ))}
            </select>
          </div>

          {/* PREVIEW */}
          {selectedProduct && selectedUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-950 border border-gray-800 rounded-xl p-4 text-sm"
            >
              <p className="text-gray-400">Transfer Preview</p>

              <div className="flex justify-between mt-2">
                <span>{selectedProduct.name}</span>
                <ArrowRight size={16} />
                <span>{selectedUser.name}</span>
              </div>
            </motion.div>
          )}

          {/* BUTTON */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            disabled={!productId || !newOwner || loading}
            onClick={handleTransfer}
            className="w-full bg-blue-600 py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Processing...
              </>
            ) : (
              "Transfer Ownership"
            )}
          </motion.button>
        </div>

        {/* RESULT */}
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5"
          >
            {result.error ? (
              <p className="text-red-400">{result.error}</p>
            ) : (
              <>
                <p className="text-green-400">
                  Ownership transferred successfully
                </p>

                <p className="text-gray-500 text-xs break-all mt-2">
                  TX: {result.txHash}
                </p>

                <Link href={`/transfer/history/${productId}`}>
                  <button className="mt-4 text-blue-400 text-sm">
                    View Ownership Timeline →
                  </button>
                </Link>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
