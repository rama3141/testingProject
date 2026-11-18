"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useState } from "react";

import { signOutAction } from "@/lib/customFunction/userAction";

import dropDownArrowIcon from "@/public/drop_down_arrow_icon.png";

{/* navbar dropdown dari shadCN */}
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

export default function Navbar() {
  const pathname = usePathname();

  // Helper function to apply active styles dynamically
  const getLinkStyle = (path: string) => {
    if (path === "/dashboard/ie") {
      const isActive = pathname === path;
      return {
        color: isActive ? "#2563EB" : "#646B8B", // Your active vs inactive color
        textDecoration: "none",
        borderBottom: isActive ? "2px solid #2563EB" : "2px solid transparent", // Adding line below text
        paddingBottom: "4px",
        transition: "all 0.2s ease",
      };
    }
  };

  const [showSignOutConfirmation, setShowSignOutConfirmation] = useState(false);
  

  return (
    <>
    <header className="fixed z-[10] top-0 left-0 w-full border-b border-[#E2E8F0] py-[17px] px-[43px] bg-[#F8FAFC]"> {/* Sticky Navbar */}
      {/* <nav style={{ display: "flex", gap: 32, alignItems: "center" }}> */}
      <nav className="flex items-center gap-[1200px]">
        <div className="flex gap-[32px] items-center">
          <strong>
              <p className="text-[21px] text-[#0a0a0a] font-bold">Athena</p>
          </strong>
          <strong>
            <Link href="/dashboard/ie" style={getLinkStyle("/dashboard/ie")}>
              IE Monitoring
            </Link>
          </strong>
          <strong>
            {/* <Link href="/dashboard/cards" style={getLinkStyle("/dashboard/cards")}>
              Name Cards
            </Link> */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem className="z-[20]">
                  <NavigationMenuTrigger>
                    <p className="text-[#646B8B] text-[16px] font-semibold">Business Cards</p>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-[#FFFFFF] rounded-lg">
                      {/* style={getLinkStyle("/dashboard/cards")} */}
                      <NavigationMenuLink href="/dashboard/cards">Profile Register</NavigationMenuLink>
                      <NavigationMenuLink href="/dashboard/partnerViewMenu">View Menu</NavigationMenuLink>
                  </NavigationMenuContent>
                </NavigationMenuItem>    
              </NavigationMenuList>
            </NavigationMenu>
          </strong>
        </div>

        <div>
          <p 
            className="text-[16px] font-bold text-[#cb0a0a] hover:text-[#7d1111] hover:cursor-pointer"
            onClick={() => {
              setShowSignOutConfirmation(true);
            }}
          >
            Sign Out
          </p>
        </div>
      </nav>
    </header>

    {showSignOutConfirmation ? 
      (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
          <div className="w-[420px] rounded-xl bg-white p-6 shadow-xl">
            {/* Modal Header */}
            <h2 className="text-[18px] font-semibold text-[#0F172A]">Sign Out Confirmation</h2>

            {/* Modal Description */}
            <p className="mt-3 text-[14px] leading-6 text-[#64748B]">
              Are you sure you want to sign out
            </p>

            {/* Modal Actions */}
            <div>
              <div className="mt-6 flex justify-end gap-3">
                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={() => {
                      setShowSignOutConfirmation(false);
                  }}
                  className="h-[38px] rounded-lg border border-[#CBD5E1] px-4 text-[13px] font-semibold text-[#475569] hover:bg-[#F8FAFC] hover:cursor-pointer"
                >
                  Cancel
                </button>

                {/* Delete Button */}
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="h-[38px] min-w-[120px] rounded-lg bg-[#DC2626] px-4 text-[13px] font-semibold text-white hover:bg-[#B91C1C] hover:cursor-pointer"
                  >
                    Sign Out
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )
      :
      null 
    }
    </>
  );
}
