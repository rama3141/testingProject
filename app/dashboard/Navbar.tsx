"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

  return (
    <header className="fixed top-0 left-0 w-full border-b border-[#E2E8F0] py-[17px] px-[43px] bg-[#F8FAFC]"> {/* Sticky Navbar */}
      {/* <nav style={{ display: "flex", gap: 32, alignItems: "center" }}> */}
      <nav className="flex gap-[32] items-center">
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
              <NavigationMenuItem>
                <NavigationMenuTrigger>
                  <p className="text-[#646B8B] text-[16px] font-semibold">Name Cards</p>
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
      </nav>
    </header>
  );
}
