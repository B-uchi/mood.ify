import { type NextRequest, NextResponse } from "next/server";

var generateRandomString = function (length: number) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const spotify_client_id = process.env.SPOTIFY_CLIENT_ID;
    const project_url = process.env.NEXT_PUBLIC_WEB_URL;

    if (!spotify_client_id || !project_url) {
      return NextResponse.json(
        { message: "Missing server params" },
        { status: 500 }
      );
    }
    var scope =
      "streaming \
                 user-read-email \
                 user-modify-playback-state\
                 user-read-private";

    var state = generateRandomString(16);
    var auth_query_parameters = new URLSearchParams({
      response_type: "code",
      client_id: spotify_client_id,
      scope: scope,
      redirect_uri: project_url + "/api/spotify-auth/callback",
      state: state,
    });

    return NextResponse.redirect(
      "https://accounts.spotify.com/authorize/?" +
        auth_query_parameters.toString()
    );
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
