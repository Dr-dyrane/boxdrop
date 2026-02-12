import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh the session — this is critical for server-side auth
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;

    // ── Catch stray ?code= on root and redirect to callback ──
    // This handles cases where OAuth redirects to /?code=xxx
    // instead of /auth/callback?code=xxx
    if (path === "/" && request.nextUrl.searchParams.has("code")) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/callback";
        return NextResponse.redirect(url);
    }

    // Auth Routes (Login, Signup)
    const isAuthRoute = path.startsWith("/login") || path.startsWith("/signup");

    // Explicitly Protected Routes
    const isProtectedRoute = path.startsWith("/dashboard/orders") ||
        path.startsWith("/dashboard/profile");

    // Redirect unauthenticated users away from protected routes
    if (!user && isProtectedRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("redirectTo", path);
        return NextResponse.redirect(url);
    }

    // Redirect authenticated users away from auth routes to dashboard
    if (user && isAuthRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}
