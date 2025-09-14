import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sign-up-callback(.*)",
  "/api/uploadthing(.*)",
  "/api/webhooks/clerk(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // If the route is public, anyone can access it.
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // If the route is not public, user must be authenticated.
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // If the user is authenticated, check for admin-only routes.
  if (isAdminRoute(req)) {
    if (sessionClaims?.metadata?.role !== "admin") {
      // Redirect non-admins away from admin routes to the teacher dashboard
      const url = new URL("/teacher", req.url);
      return NextResponse.redirect(url);
    }
  }

  // Authenticated users can access all other non-public, non-admin routes (e.g., /teacher)
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
