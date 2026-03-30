"use client";

import { useEffect, useState } from "react";

export default function HashText({ text }: any) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    let i = 0;

    const interval = setInterval(() => {
      setDisplay(text.slice(0, i));
      i++;

      if (i > text.length) clearInterval(interval);
    }, 10);

    return () => clearInterval(interval);
  }, [text]);

  return <p className="text-xs text-gray-500 break-all font-mono">{display}</p>;
}
