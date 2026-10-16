"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  // Helper function to apply active styles dynamically
  const getLinkStyle = (path: string) => {
    const isActive = pathname === path;
    return {
      color: isActive ? "#2563EB" : "#646B8B", // Your active vs inactive color
      textDecoration: "none",
      borderBottom: isActive ? "2px solid #2563EB" : "2px solid transparent", // Adding line below text
      paddingBottom: "4px",
      transition: "all 0.2s ease",
    };
  };

  return (
    <header className="fixed top-0 left-0 w-full border-b border-[#E2E8F0] py-[17px] px-[43px] bg-[#F8FAFC]"> {/* Sticky Navbar */}
      {/* <nav style={{ display: "flex", gap: 32, alignItems: "center" }}> */}
      <nav className="flex gap-[32] items-center">
        <strong>
          <Link href="/dashboard">
            <p className="text-[21px] text-[#0a0a0a] font-bold">Athena</p>
          </Link>
        </strong>
        <strong>
          <Link href="/dashboard/ie" style={getLinkStyle("/dashboard/ie")}>
            IE Monitoring
          </Link>
        </strong>
        <strong>
          <Link href="/dashboard/cards" style={getLinkStyle("/dashboard/cards")}>
            Name Cards
          </Link>
        </strong>
      </nav>
    </header>
  );
}
