import { NextResponse, type NextRequest } from "next/server";

let spotifyToken: string | null = null;
let tokenExpiry: number | null = null;

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
    if (spotifyToken && tokenExpiry && Date.now() < tokenExpiry) {
      return NextResponse.json({ token: spotifyToken }, { status: 200 });
    }

    const token = await getSpotifyToken();
    return NextResponse.json({ token }, { status: 200 });

  } catch (error) {
    console.error("Error fetching Spotify token:", error);
    return NextResponse.json(
      { error: "Failed to fetch Spotify token" },
      { status: 500 }
    );
  }
}