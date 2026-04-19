"use client";

import { useEffect, useState } from "react";

export function useAuth() {
  const [role, setRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedToken = localStorage.getItem("token");

    setRole(storedRole);
    setToken(storedToken);
    setLoading(false);
  }, []);

  return { role, token, loading };
}
