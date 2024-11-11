import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isValidOrigin = (request: NextRequest): boolean => {
  const origin = request.headers.get("origin");

  const baseOrigin = process.env.NEXT_PUBLIC_WEB_URL?.replace(/\/+$/, "");
  const allowedOrigins = [
    new RegExp(`^${baseOrigin}(/|$)`),
    /^http:\/\/localhost:3000(\/|$)/ 
  ];

  return origin ? allowedOrigins.some((regex) => regex.test(origin)) : false;
};

const isValidApiKey = (request: NextRequest): boolean => {
  const apiKey = request.headers.get("x-api-key");
  const validApiKey = process.env.NEXT_PUBLIC_API_KEY_SECRET;

  return apiKey === validApiKey;
};

export function middleware(request: NextRequest) {
  if (isValidOrigin(request) && isValidApiKey(request)) {
    return NextResponse.next();
  } else {
    return NextResponse.json(
      { message: "Unknown origin or incorrect api key" },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: [
    "/api/spotify-auth",
    "/api/spotify-auth/token",
    "/api/generate-playlist",
  ],
};
