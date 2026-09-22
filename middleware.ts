import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "./lib/supabase/server-client";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = await createSupabaseServerClient(request, response);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentPath = request.nextUrl.pathname;

  // 1. If user is NOT logged in and tries to access dashboard, send to login (/)
  if (!user && currentPath.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // 2. If user IS logged in and tries to access login (/), send to dashboard
  if (user && currentPath === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match only the root path and dashboard paths to avoid 
     * running middleware on API routes or static assets.
     */
    "/",
    "/dashboard/:path*",
  ],
};
