import type { Metadata } from "next";
import Navbar from "./Navbar"; // Adjust path if needed
// import "../globals.css";

// -----------------------------------------------------------------------------------------------------------------------------------------------------------
export const metadata: Metadata = {
  title: "Project Athena — Intl & Partnership",
  description: "All-in-one internal app: IE monitoring + name card OCR",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {/* <main style={{ padding: 20, maxWidth: 1440, margin: "0 auto" }}> */}
      {/* <main className="mx-auto max-w-480 px-5"> */}
      {/* 1214px = 1440px - 2*113px */}
      <main className="mx-auto w-full max-w-vw">
        {children} 
      </main>
    </>
  );
}

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <>
//         <header style={{ borderBottom: "1px solid #E2E8F0", padding: "17px 40px", backgroundColor: "#F8FAFC"  }}>
//           <nav style={{ display: "flex", gap: 32 }}>
//             <strong><a href="/dashboard" className="text-[#1Ew293B]">Athena</a></strong>
//             <strong><a href="/dashboard/ie" className="text-[#646B8B]">IE Monitoring</a></strong>
//             <strong><a href="/dashboard/cards" className="text-[#646B8B]">Name Cards</a></strong>
//           </nav>
//         </header>
//         <main style={{ padding: 20, maxWidth: 960, margin: "0 auto" }}>{children}</main>
//     </>
//   );
// }