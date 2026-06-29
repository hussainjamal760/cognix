import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login");
  const isDashboardPage =
    req.nextUrl.pathname.startsWith("/projects") ||
    req.nextUrl.pathname.startsWith("/settings");

  if (isDashboardPage && !isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }

  if (isAuthPage && isLoggedIn) {
    return Response.redirect(new URL("/projects", req.nextUrl));
  }
});

export const config = {
  matcher: ["/projects/:path*", "/settings/:path*", "/login"],
};
