"use client";

interface Props {
  valid: boolean;
}

export default function WarrantyStatus({ valid }: Props) {
  return (
    <div
      className={`mt-6 p-4 rounded-lg text-center font-medium ${
        valid ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
      }`}
    >
      {valid ? "Warranty Active" : "Warranty Expired"}
    </div>
  );
}
