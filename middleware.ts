import { NextRequest, NextResponse } from "next/server"

const SUPPORTED_LANGS = ["fr", "en"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/fr", request.url))
  }

  const lang = pathname.split("/")[1]
  if (!SUPPORTED_LANGS.includes(lang)) {
    return NextResponse.redirect(new URL("/fr", request.url))
  }

  const response = NextResponse.next()
  response.headers.set("x-pathname", pathname)
  return response
}

export const config = {
  matcher: ["/((?!_next|api|favicon\\.ico|.*\\..*).*)"],
}
