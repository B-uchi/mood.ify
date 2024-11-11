import { getSpotifyToken } from "@/utils/getSpotifyAccessToken";
import { NextResponse, type NextRequest } from "next/server";

let spotifyToken: string | null = null;
let tokenExpiry: number | null = null;

const isValidOrigin = (request: NextRequest): boolean => {
  const origin = request.headers.get("referer");
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_FRONTEND_URL,
    "http://localhost:3000/",
  ].filter(Boolean);

  return origin ? allowedOrigins.includes(origin) : false;
};

const isValidApiKey = (request: NextRequest): boolean => {
  const apiKey = request.headers.get("x-api-key");
  const validApiKey = process.env.NEXT_PUBLIC_API_KEY_SECRET;

  return apiKey === validApiKey;
};

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    if (!isValidOrigin(req)) {
      return NextResponse.json(
        { error: "Unauthorized origin" },
        { status: 403 }
      );
    }

    if (!isValidApiKey(req)) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    const headers = {
      "Access-Control-Allow-Origin": req.headers.get("referer") || "",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "x-api-key, Content-Type",
    };

    if (spotifyToken && tokenExpiry && Date.now() < tokenExpiry) {
      return NextResponse.json(
        { token: spotifyToken },
        {
          status: 200,
          headers,
        }
      );
    }

    const { access_token, expires_in } = await getSpotifyToken();
    spotifyToken = access_token;
    tokenExpiry = Date.now() + expires_in * 1000;

    return NextResponse.json(
      { token: access_token },
      {
        status: 200,
        headers,
      }
    );
  } catch (error: any) {
    console.error("Error fetching Spotify token:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch Spotify token" },
      { status: 500 }
    );
  }
}

export async function OPTIONS(req: NextRequest): Promise<NextResponse> {
  const origin = req.headers.get("origin");

  if (!isValidOrigin(req)) {
    return NextResponse.json({}, { status: 404 });
  }

  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": origin || "",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "x-api-key, Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    }
  );
}
