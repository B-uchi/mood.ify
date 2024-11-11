import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("spotify_access_token");

    if (!accessToken) {
      return NextResponse.json({ error: "Spotify isn't authorized" }, { status: 400 });
    }

    return NextResponse.json({ token: accessToken.value }, { status: 200 });
  } catch (error) {
    console.error("Error authorizing spotify:", error);
    return NextResponse.json(
      { error: "Error occured while authorizing spotify" },
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
