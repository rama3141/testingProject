
"use client";

import Image from "next/image";
import searchIcon from "@/public/search_icon.png";

// 1. Menentukan props yang diterima SearchBar
type SearchBarProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

// 2. Membuat komponen SearchBar
export default function SearchBar({
    value,
    onChange,
    placeholder = "Search by NIM or name...",
}: SearchBarProps) {

    return (
        <div className="border w-[400px] h-[44px] rounded-xl relative border-[#E2E8F0]">
            {/* Input Search */}
            <div className="px-[20px] py-[2px]">
                <input
                    type="text"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={placeholder}
                    className="outline-none w-[380px]"
                />   
            </div>
            {/* Search Icon */}
            <div className="absolute top-[10px] px-[5px]">
                <Image
                    src={searchIcon}
                    alt="Search"
                    width={18}
                    height={18}
                />
            </div>
        </div>
    );
}
