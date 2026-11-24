"use client";

import { useEffect, useState } from "react";

export default function Footer() {
  // Year is set after mount so no Date is read during render.
  const [year, setYear] = useState("2026");

  useEffect(() => {
    setYear(String(new Date().getFullYear()));
  }, []);

  return (
    <footer className="py-2.5 text-center text-[10px] leading-none text-navy/55">
      inquiry@AtoZSource.com &nbsp;-&nbsp; Copyright {year}.
    </footer>
  );
}
