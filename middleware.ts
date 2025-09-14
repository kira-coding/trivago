// middleware.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // Adjust the path to your auth.ts file
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const session = await auth(); // Get the session object

    const { pathname } = request.nextUrl;

    // If there's no session, and the user is trying to access a protected route, redirect to login
    if (!session) {
        // The `auth` function will automatically redirect to the login page
        // for any page that is not public, so this block is often not needed
        // unless you have specific logic. The redirection is handled by the `auth` export below.
        return;
    }

    // ---- Role-based access control logic ----
    const userRole = session.user?.role;

    // Protect admin routes
    if (pathname.startsWith("/admin") && userRole !== "ADMIN") {
        // You can redirect or return a forbidden response
        return new NextResponse("You are not authorized to access this page.", {
            status: 403,
        });
    }

    // Redirect admins trying to access the regular user dashboard
    if (pathname.startsWith("/dashboard") && userRole === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    // If all checks pass, continue to the requested page
    return NextResponse.next();
}

// The default export from your `auth.ts` file is also a middleware!
// It will automatically protect all pages that are not explicitly matched here.
// But we use the function above for more granular, role-based control.
// The matcher MUST be defined for the middleware to run.
export const config = {
    matcher: ["/dashboard/:path*", "/admin/:path*"],
};