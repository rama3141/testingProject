"use client";

import { login } from "./EmailPassword";
import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client"
import { User } from "@supabase/supabase-js";

type EmailPasswordLibProps = {
    user: User | null;
};

export default function LoginPage({ user }: EmailPasswordLibProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const supabase = getSupabaseBrowserClient();
  const [currentUser, setCurrentUser] = useState<User | null>(user);


  async function handleSignOut() {
    await supabase.auth.signOut();
    setCurrentUser(null);
  }

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setCurrentUser(session?.user ?? null);
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [supabase])

  return (
    // <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-linear-to-br bg-[#00c2b2]">
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-linear-to-br from-[#3d8ed8] via-[#279ddd] to-[#0fc1e6]">
    
      {/* =====================================================
          LOGIN CARD
          ===================================================== */}

      <div className="relative z-10 w-[350px] min-h-[340px] rounded-lg bg-white px-[42px] py-7 shadow-md">
        
        {/* -------------------------------------------------
            LOGO
            ------------------------------------------------- */}

        <div className="mb-3 flex h-[105px] items-center">  

          {/* Logo text */}
          <div className="ml-[88px] flex flex-col leading-[1.05]">
            <strong className="text-[30px] text-gray-900 text-center">
              LOGIN
            </strong>
          </div>
        </div>

        {/* -------------------------------------------------
            LOGIN FORM
            ------------------------------------------------- */}

        <form
          action={login}
          className="flex flex-col gap-[9px]"
        >
          
          {/* Email */}
          <div className="flex h-9 w-full items-center rounded-md border border-gray-300 bg-white transition focus-within:border-[#00a9df] focus-within:ring-1 focus-within:ring-[#00a9df]/20">
            
            {/* User icon */}
            <span className="flex w-[31px] items-center justify-center text-xs text-gray-400">
              <UserIcon />
            </span>

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="h-full flex-1 bg-transparent pr-2 text-sm text-gray-600 outline-none placeholder:text-gray-500"
            />
          </div>

          {/* Password */}
          <div className="flex h-9 w-full items-center rounded-md border border-gray-300 bg-white transition focus-within:border-[#00a9df] focus-within:ring-1 focus-within:ring-[#00a9df]/20">
            
            {/* Lock icon */}
            <span className="flex w-[31px] items-center justify-center text-xs text-gray-400">
              <LockIcon />
            </span>

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="h-full flex-1 bg-transparent pr-2 text-sm text-gray-600 outline-none placeholder:text-gray-500"
            />
          </div>

          {/* Login button */}
          <button
            type="submit"
            className="h-[38px] rounded-md bg-[#08a8dc] text-[15px] font-bold text-white transition hover:bg-[#079acb] active:scale-[0.99]"
          >
            Login
          </button>
        </form>
      </div>

      {/* =====================================================
          FOOTER
          ===================================================== */}

    </div>
  );
}

// USER ICON
function UserIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
    </svg>
  );
}


//LOCK ICON
function LockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M17 8h-1V6a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2Zm-7-2a2 2 0 1 1 4 0v2h-4V6Zm7 13H7v-9h10v9Z" />
    </svg>
  );
}