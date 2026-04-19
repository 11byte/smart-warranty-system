"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole?: string;
}) {
  const { role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!role) {
      router.push("/login");
      return;
    }

    if (allowedRole && role !== allowedRole) {
      router.push("/home");
    }
  }, [role, loading]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-400">
        Checking authentication...
      </div>
    );
  }

  return <>{children}</>;
}
