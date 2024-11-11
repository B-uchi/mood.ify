import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const spotify_client_id = process.env.SPOTIFY_CLIENT_ID;
    const spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET;
    const app_url = process.env.NEXT_PUBLIC_WEB_URL;

    if (!spotify_client_id || !spotify_client_secret) {
      return NextResponse.json(
        { message: "Missing server params" },
        { status: 500 }
      );
    }

    const code = req.nextUrl.searchParams.get("code");
    if (!code) {
      const redirectUrl = new URL("/playlist", req.nextUrl);
      return NextResponse.redirect(redirectUrl.toString());
    }

    const redirect_uri = `${app_url}/api/spotify-auth/callback`;

    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${spotify_client_id}:${spotify_client_secret}`).toString(
            "base64"
          ),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error("Error from Spotify API:", error);
      return NextResponse.json(
        { error: "Failed to fetch Spotify token" },
        { status: tokenResponse.status }
      );
    }

    const data = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = data;
    
    const redirectUrl = new URL("/playlist", req.nextUrl);
    const response = NextResponse.redirect(redirectUrl.toString());

    response.cookies.set({
      name: 'spotify_access_token',
      value: access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expires_in,
      path: '/',
    });

    if (refresh_token) {
      response.cookies.set({
        name: 'spotify_refresh_token',
        value: refresh_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error("Error authorizing Spotify:", error);
    return NextResponse.json(
      { error: "Error occurred while authorizing Spotify" },
      { status: 500 }
    );
  }
}

export async function OPTIONS(req: NextRequest): Promise<NextResponse> {
  const origin = req.headers.get("origin");
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
