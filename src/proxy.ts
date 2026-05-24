import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/verify", "/onboard", "/garage/register", "/garage/login"];
const ROLE_REDIRECTS: Record<string, string> = {
  customer: "/home",
  garage_owner: "/garage/dashboard",
  mechanic: "/garage/dashboard",
  admin: "/admin/dashboard",
};

export async function proxy(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_DEV_PREVIEW === "true") {
    return NextResponse.next({ request });
  }

  // API routes handle their own auth — never redirect them
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((p) => path.startsWith(p));

  if (!user && !isPublic && path !== "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Use the user_role cookie for all role-based redirects (set at login, no DB call needed)
  const role = request.cookies.get("user_role")?.value ?? "customer";

  const REGISTER_PATHS = ["/garage/register", "/onboard"];
  if (user && isPublic && !REGISTER_PATHS.some((p) => path.startsWith(p))) {
    const dest = ROLE_REDIRECTS[role] ?? "/home";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  if (user && path.startsWith("/garage/") && !path.startsWith("/garage/register")) {
    if (role === "customer") {
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }

  if (user && path.startsWith("/admin/")) {
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
