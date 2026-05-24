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

  const REGISTER_PATHS = ["/garage/register", "/onboard"];
  if (user && isPublic && !REGISTER_PATHS.some((p) => path.startsWith(p))) {
    // Use cookie for fast redirect; fall back to DB if cookie is missing
    const roleCookie = request.cookies.get("user_role")?.value;
    if (roleCookie && ROLE_REDIRECTS[roleCookie]) {
      return NextResponse.redirect(
        new URL(ROLE_REDIRECTS[roleCookie], request.url)
      );
    }
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role) {
      return NextResponse.redirect(
        new URL(ROLE_REDIRECTS[profile.role] ?? "/home", request.url)
      );
    }
  }

  if (user && path.startsWith("/garage/") && path !== "/garage/register") {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "customer") {
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }

  if (user && path.startsWith("/admin/")) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
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
