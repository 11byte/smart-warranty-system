"use client";

import Navbar from "../../components/Navbar";
import ProductDetails from "../../components/ProductDetails";
import WarrantyStatus from "../../components/WarrantyStatus";
import RepairHistory from "../../components/RepairHistory";

export default function ProductPage() {
  const repairs = [
    {
      date: "10 Jan 2026",
      issue: "Battery issue",
      repair: "Battery replaced",
    },
  ];

  return (
    <div className="bg-gray-950 min-h-screen text-white">
      <Navbar />

      <div className="max-w-3xl mx-auto pt-20 px-6">
        <ProductDetails
          name="Smartphone X"
          manufacturer="TechCorp"
          purchaseDate="12 Dec 2025"
          warrantyExpiry="12 Dec 2027"
        />

        <WarrantyStatus valid={true} />

        <RepairHistory repairs={repairs} />
      </div>
    </div>
  );
}
