import { NextResponse, type NextRequest } from "next/server";

let spotifyToken: string | null = null;
let tokenExpiry: number | null = null;

const isValidOrigin = (request: NextRequest): boolean => {
  const origin = request.headers.get("referer");
  console.log(origin)
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

const getSpotifyToken = async (): Promise<string> => {
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    throw new Error(
      "Missing Spotify API credentials in environment variables."
    );
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.SPOTIFY_CLIENT_ID,
    client_secret: process.env.SPOTIFY_CLIENT_SECRET,
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Spotify token: ${response.statusText}`);
  }

  const data = await response.json();
  spotifyToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000;

  return data.access_token;
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
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    const headers = {
      "Access-Control-Allow-Origin": req.headers.get("referer") || "",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "x-api-key, Content-Type",
    };

    if (spotifyToken && tokenExpiry && Date.now() < tokenExpiry) {
      return NextResponse.json({ token: spotifyToken }, { 
        status: 200,
        headers 
      });
    }

    const token = await getSpotifyToken();
    return NextResponse.json({ token }, { 
      status: 200,
      headers
    });

  } catch (error) {
    console.error("Error fetching Spotify token:", error);
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

  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": origin || "",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "x-api-key, Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}