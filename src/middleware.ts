import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_PAGES = ["/login", "/verify", "/garage/login"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired — important for SSR
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Authenticated users hitting login pages → redirect to their dashboard
  if (user && AUTH_PAGES.some((p) => pathname === p || pathname.startsWith(p + "?"))) {
    const role = request.cookies.get("user_role")?.value ?? "customer";
    const redirectTo =
      role === "garage_owner" || role === "mechanic"
        ? "/garage/dashboard"
        : role === "admin"
        ? "/admin/dashboard"
        : "/home";
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  // Unauthenticated users hitting protected customer routes → /login
  const customerProtected =
    pathname.startsWith("/home") ||
    pathname.startsWith("/bookings") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/vehicles");

  if (!user && customerProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Unauthenticated users hitting protected garage routes → /garage/login
  const garageProtected =
    pathname.startsWith("/garage/dashboard") ||
    pathname.startsWith("/garage/requests") ||
    pathname.startsWith("/garage/profile");

  if (!user && garageProtected) {
    return NextResponse.redirect(new URL("/garage/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/login",
    "/verify",
    "/garage/login",
    "/home/:path*",
    "/bookings/:path*",
    "/profile/:path*",
    "/vehicles/:path*",
    "/garage/dashboard/:path*",
    "/garage/requests/:path*",
    "/garage/profile/:path*",
  ],
};
