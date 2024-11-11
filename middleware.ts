import { authMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/blog(.*)",
    "/about",
    "/features",
    "/pricing",
  ],
  ignoredRoutes: [
    "/api/webhooks(.*)",
  ]
});

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ]
};