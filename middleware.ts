import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const handleI18nRouting = createIntlMiddleware(routing);

// 로그인이 필요한 보호 라우트 (locale prefix 제외한 경로 패턴)
const isProtectedRoute = createRouteMatcher([
  "/(ko|en)?/profile(.*)",
  "/(ko|en)?/my-page(.*)",
  "/profile(.*)",
  "/my-page(.*)",
]);

// next-intl이 처리하면 안 되는 경로 (API, Clerk 전용 등)
const isApiRoute = createRouteMatcher(["/api/(.*)", "/__clerk/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
  // API 라우트는 i18n 라우팅에서 제외
  if (isApiRoute(req)) {
    return NextResponse.next();
  }
  return handleI18nRouting(req);
});

export const config = {
  matcher: [
    // Next.js 내부 파일 및 정적 파일 제외
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // API 라우트는 항상 실행
    "/(api|trpc)(.*)",
    // Clerk 전용 라우트
    "/__clerk/(.*)",
  ],
};
