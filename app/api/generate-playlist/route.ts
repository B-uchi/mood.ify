import { NextResponse, type NextRequest } from "next/server";
import { getSpotifyToken } from "../spotify-auth/route";
import { MoodMap, moodService } from "./moodService";
// import { createHash } from "crypto";

type ReqBody = {
  mood: string;
  moodInput: string;
  seedTracks: string[];
  seedArtists: string[];
  seedGenres: string[];
};

const getSpotifyReqParam = async (
  mood: string | null,
  moodInput: string | null
): Promise<
  | { spotifyRequestParam: string; refined_mood: string; category: string }
  | NextResponse
> => {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const prompt = `With this user mood '${mood}' (a one word mood, skip if unavailable) and '${moodInput}' (a more detailed description of the user's mood skip if unavailable), combine both and return a single word mood (in simple words to match with a db entry), then also detect mood category (positive | negative | complex | neutral), return it as follows enclosed in an angle bracket <category: onewordmood> followed by a comma and finally generate Spotify song properties in a url parameter string format for the recommendation endpoint to recommend appropriate songs for the user's mood.IF MOOD CONTAINS EXPLICIT CONTENT/GIBBERISH/LITTLE CONTEXT, RETURN A STRING 'NO'. RETURN JUST A STRING WITHOUT ESCAPE CHARACTERS OR TILDE (just the string enclosed in double quotes) IN THE FORM OF REQUEST PARAMETERS EACH PROPERTY SEPARATED BY &. make it as precise as possible\nRequired properties:\n- 'min_acousticness' (number): Minimum acousticness.\n- 'max_acousticness' (number): Maximum acousticness.\n- 'target_acousticness' (number): Target acousticness.\n- 'min_danceability' (number): Minimum danceability.\n- 'max_danceability' (number): Maximum danceability.\n- 'target_danceability' (number): Target danceability.\n- 'min_energy' (number): Minimum energy.\n- 'max_energy' (number): Maximum energy.\n- 'target_energy' (number): Target energy.\n- 'min_instrumentalness' (number): Minimum instrumentalness.\n- 'max_instrumentalness' (number): Maximum instrumentalness.\n- 'target_instrumentalness' (number): Target instrumentalness.\n- 'min_key' (integer): Minimum key.\n- 'max_key' (integer): Maximum key.\n- 'target_key' (integer): Target key.\n- 'min_liveness' (number): Minimum liveness.\n- 'max_liveness' (number): Maximum liveness.\n- 'target_liveness' (number): Target liveness.\n- 'min_loudness' (number): Minimum loudness.\n- 'max_loudness' (number): Maximum loudness.\n- 'target_loudness' (number): Target loudness.\n- 'min_mode' (integer): Minimum mode.\n- 'max_mode' (integer): Maximum mode.\n- 'target_mode' (integer): Target mode.\n- 'min_popularity' (integer): Minimum popularity.\n- 'max_popularity' (integer): Maximum popularity.\n- 'target_popularity' (integer): Target popularity.\n- 'min_speechiness' (number): Minimum speechiness.\n- 'max_speechiness' (number): Maximum speechiness.\n- 'target_speechiness' (number): Target speechiness.\n- 'min_tempo' (number): Minimum tempo.\n- 'max_tempo' (number): Maximum tempo.\n- 'target_tempo' (number): Target tempo.\n- 'min_time_signature' (integer): Minimum time signature.\n- 'max_time_signature' (integer): Maximum time signature.\n- 'target_time_signature' (integer): Target time signature.\n- 'min_valence' (number): Minimum valence.\n- 'max_valence' (number): Maximum valence.\n- 'target_valence' (number): Target valence.\n- 'key_mode' (string): The major or minor key of the track.\n\nExample string response, the actual response should contain all required properties: <positive:happy>,min_acousticness=0.2&max_acousticness=0.6&target_acousticness=0.4&...`;

  if (!geminiApiKey) {
    return NextResponse.json(
      { message: "Internal auth error." },
      {
        status: 500,
      }
    );
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const result: string = data.candidates[0].content.parts[0].text.replace(
      /[\n\\~]/g,
      ""
    );
    const [mood, spotifyRequest] = result.replaceAll('"', "").split(",");

    if (result.includes("NO")) {
      return NextResponse.json(
        { message: "Rejected request." },
        {
          status: 403,
        }
      );
    }
    let [category, refined_mood] = mood
      .replace(/<|>/g, "")
      .split(":")
      .map((x) => x.trim());
    let spotifyRequestParam = spotifyRequest;
    return { refined_mood, spotifyRequestParam, category };
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Failed to parse response." },
      {
        status: 500,
      }
    );
  }
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const headers = {
      "Access-Control-Allow-Origin": req.headers.get("referer") || "",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "x-api-key, Content-Type",
    };

    let body: ReqBody;
    try {
      body = await req.json();

      if (!body) {
        return NextResponse.json(
          { message: "No body" },
          {
            status: 400,
          }
        );
      }

      if (!body?.mood && !body?.moodInput) {
        return NextResponse.json(
          { message: "Mood or mood input is required." },
          {
            status: 400,
          }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const mood = body.mood ? body.mood : null;
    const moodInput = body.moodInput ? body.moodInput : null;

    if (!mood && !moodInput) {
      return NextResponse.json(
        { error: "Either mood or mood input is required" },
        { status: 400 }
      );
    }

    const result = await getSpotifyReqParam(mood, moodInput);
    if (result instanceof NextResponse) {
      return result;
    }
    const { refined_mood, category, spotifyRequestParam } = result;

    let moodMap;
    moodMap = (await moodService.getMoodMap(
      refined_mood,
      category
    )) as MoodMap["seed_data"];

    if (!moodMap) {
      moodMap = (await moodService.getDefaultSeeds()) as MoodMap["seed_data"];
    }

    let seedArtists = "";
    if (body.seedArtists.length != 0) {
      seedArtists = `seed_artists=${body.seedArtists.join("%2C")}&`;
    } else {
      seedArtists = `seed_artists=${moodMap.tracks.join("%2C")}&`;
    }

    let seedTracks = "";
    if (body.seedTracks.length != 0) {
      seedTracks = `seed_tracks=${body.seedTracks.join("%2C")}&`;
    } else {
      seedTracks = `seed_tracks=${moodMap.tracks.join("%2C")}&`;
    }

    let seed_genres = "";
    if (body.seedGenres.length != 0) {
      seed_genres = `seed_genres=${body.seedGenres.join("%2C")}&`;
    } else {
      seed_genres = `seed_genres=${moodMap.genres.join("%2C")}&`;
    }

    const api_key = await getSpotifyToken();

    const url = `https://api.spotify.com/v1/recommendations?limit=5&${
      seedArtists ? seedArtists : ""
    }${seedTracks ? seedTracks : ""}${spotifyRequestParam}`.replace(
      /['"]/g,
      ""
    );

    // const id = createHash('sha256').update(url).digest('base64url');
    // console.log(id)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + api_key,
      },
    });

    const data = await response.json();
    const track_data = data.tracks.map((song: any) => {
      delete song["available_markets"];
      if (song.album && song.album.available_markets) {
        delete song.album.available_markets;
      }

      return song;
    });
    return NextResponse.json(
      {
        data: track_data,
      },
      {
        status: 200,
        headers,
      }
    );
  } catch (error: any) {
    console.error("Error generating playlist:", error);
    return NextResponse.json(
      { error: "Error occured while generating playlist" },
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
