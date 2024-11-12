import { adminDb } from "@/lib/firebase/firebaseAdmin";
import { statData } from "@/lib/types/types";
import { type NextRequest, NextResponse } from "next/server";

function msToFormattedHours(ms: number, decimals: number = 1): string {
  const hours = ms / (1000 * 60 * 60);
  if (hours < 1000) {
    return `${
      Math.round(hours * Math.pow(10, decimals)) / Math.pow(10, decimals)
    }`;
  }
  const kHours = hours / 1000;
  return `${
    Math.round(kHours * Math.pow(10, decimals)) / Math.pow(10, decimals)
  }k`;
}

export async function GET(): Promise<NextResponse> {
  try {
    const statsDoc = await adminDb.collection("stats").doc("stat").get();
    if (!statsDoc.data()) {
      return NextResponse.json(
        { message: "Stat doc not found" },
        { status: 500 }
      );
    }
    const statData = statsDoc.data() as statData;

    return NextResponse.json(
      {
        stats: {
          ...statData,
          totalPlaylistDuration: msToFormattedHours(
            statData.totalPlaylistDuration,
            1
          ),
        },
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { message: "Could not fetch stats: " + e.message },
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
