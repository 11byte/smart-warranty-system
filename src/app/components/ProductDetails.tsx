"use client";

interface Props {
  name: string;
  manufacturer: string;
  purchaseDate: string;
  warrantyExpiry: string;
}

export default function ProductDetails({
  name,
  manufacturer,
  purchaseDate,
  warrantyExpiry,
}: Props) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-lg">
      <h2 className="text-xl font-semibold text-white mb-4">{name}</h2>

      <div className="space-y-2 text-gray-400 text-sm">
        <p>Manufacturer: {manufacturer}</p>
        <p>Purchase Date: {purchaseDate}</p>
        <p>Warranty Expiry: {warrantyExpiry}</p>
      </div>
    </div>
  );
}
