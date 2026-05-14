import { NextResponse, type NextRequest } from "next/server";

/**
 * Injecteert de huidige pathname als `x-pathname` response-header
 * zodat de root layout (src/app/layout.tsx) het HTML lang-attribuut
 * dynamisch kan instellen zonder een volledige i18n-bibliotheek.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("x-pathname", request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: [
    // Alle routes behalve Next.js internals en static assets
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|eot|css|js)).*)",
  ],
};
