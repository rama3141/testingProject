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
    <header style={{ borderBottom: "1px solid #E2E8F0", padding: "17px 43px", backgroundColor: "#F8FAFC" }}>
      <nav style={{ display: "flex", gap: 32, alignItems: "center" }}>
        <strong>
          <Link href="/dashboard" style={getLinkStyle("/dashboard")} className="text-[21px]">
            Athena
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
