import { adminDb } from "@/lib/firebase/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  const moodCategories = {
    positive: [
      [
        "happy",
        "cheerful",
        "joyful",
        "content",
        "elated",
        "delighted",
        "jubilant",
        "blissful",
        "pleased",
      ],
      //   [
      //     "excited",
      //     "enthusiastic",
      //     "eager",
      //     "thrilled",
      //     "exhilarated",
      //     "pumped",
      //     "fired up",
      //     "animated",
      //   ],
      //   [
      //     "calm",
      //     "relaxed",
      //     "serene",
      //     "tranquil",
      //     "peaceful",
      //     "at ease",
      //     "mellow",
      //     "laid-back",
      //   ],
      //   [
      //     "confident",
      //     "self-assured",
      //     "bold",
      //     "secure",
      //     "courageous",
      //     "empowered",
      //     "poised",
      //     "self-reliant",
      //   ],
      //   [
      //     "hopeful",
      //     "optimistic",
      //     "encouraged",
      //     "positive",
      //     "expectant",
      //     "assured",
      //     "trusting",
      //     "forward-looking",
      //   ],
      //   [
      //     "grateful",
      //     "appreciative",
      //     "thankful",
      //     "indebted",
      //     "pleased",
      //     "content",
      //     "blessed",
      //     "relieved",
      //   ],
      //   [
      //     "playful",
      //     "lighthearted",
      //     "fun-loving",
      //     "whimsical",
      //     "humorous",
      //     "lively",
      //     "jovial",
      //     "spirited",
      //   ],
    ],
    // negative: [
    //   [
    //     "sad",
    //     "sorrowful",
    //     "downhearted",
    //     "unhappy",
    //     "depressed",
    //     "despondent",
    //     "gloomy",
    //     "melancholy",
    //   ],
    //   [
    //     "angry",
    //     "irritated",
    //     "furious",
    //     "enraged",
    //     "resentful",
    //     "frustrated",
    //     "outraged",
    //     "infuriated",
    //   ],
    //   [
    //     "anxious",
    //     "nervous",
    //     "uneasy",
    //     "tense",
    //     "worried",
    //     "apprehensive",
    //     "fearful",
    //     "distressed",
    //   ],
    //   [
    //     "lonely",
    //     "isolated",
    //     "abandoned",
    //     "forlorn",
    //     "disconnected",
    //     "lonesome",
    //     "estranged",
    //     "unwanted",
    //   ],
    //   [
    //     "bored",
    //     "uninterested",
    //     "indifferent",
    //     "listless",
    //     "jaded",
    //     "fatigued",
    //     "weary",
    //     "restless",
    //   ],
    //   [
    //     "disappointed",
    //     "disheartened",
    //     "let down",
    //     "dissatisfied",
    //     "discouraged",
    //     "downcast",
    //     "unsatisfied",
    //   ],
    //   [
    //     "jealous",
    //     "envious",
    //     "resentful",
    //     "covetous",
    //     "insecure",
    //     "begrudging",
    //     "possessive",
    //   ],
    // ],
    // neutral: [
    //   [
    //     "indifferent",
    //     "apathetic",
    //     "detached",
    //     "unfeeling",
    //     "unemotional",
    //     "impartial",
    //     "dispassionate",
    //     "aloof",
    //   ],
    //   [
    //     "content",
    //     "satisfied",
    //     "comfortable",
    //     "agreeable",
    //     "relaxed",
    //     "easygoing",
    //     "accepting",
    //     "mellow",
    //   ],
    //   [
    //     "tired",
    //     "exhausted",
    //     "drained",
    //     "fatigued",
    //     "weary",
    //     "spent",
    //     "worn out",
    //     "lethargic",
    //   ],
    //   [
    //     "curious",
    //     "inquisitive",
    //     "interested",
    //     "intrigued",
    //     "nosy",
    //     "speculative",
    //     "questioning",
    //   ],
    //   [
    //     "focused",
    //     "attentive",
    //     "concentrated",
    //     "absorbed",
    //     "dedicated",
    //     "fixated",
    //     "diligent",
    //     "engrossed",
    //   ],
    // ],
    // complex: [
    //   [
    //     "bittersweet",
    //     "nostalgic",
    //     "sentimental",
    //     "wistful",
    //     "melancholic",
    //     "longing",
    //     "sweet-sorrow",
    //   ],
    //   [
    //     "restless",
    //     "agitated",
    //     "unsettled",
    //     "impatient",
    //     "edgy",
    //     "fidgety",
    //     "nervous",
    //     "uneasy",
    //   ],
    //   [
    //     "motivated",
    //     "driven",
    //     "inspired",
    //     "ambitious",
    //     "goal-oriented",
    //     "energized",
    //     "stimulated",
    //   ],
    //   [
    //     "conflicted",
    //     "torn",
    //     "unsure",
    //     "ambivalent",
    //     "divided",
    //     "uncertain",
    //     "perplexed",
    //     "indecisive",
    //   ],
    //   [
    //     "hopeful-afraid",
    //     "cautious optimism",
    //     "wary",
    //     "anxious",
    //     "guarded",
    //     "uncertain",
    //     "tentative",
    //   ],
    // ],
  };

  try {
    for (const [moodName, synonymsArray] of Object.entries(moodCategories)) {
      const moodCategoryRef = adminDb.collection("moods").doc(moodName);
      if (!moodCategoryRef) {
        return NextResponse.json({
          status: 500,
        });
      }
      for (const synonymSubArray of synonymsArray) {
        const key = synonymSubArray[0];
        const groups: any = {};
        groups[key] = {
          synonyms: synonymSubArray,
          seed_data: {
            artists: [],
            tracks: [],
            genres: [],
          },
          meta_data: {
            rating: 5,
            usageCount: 0,
            lastUsed: FieldValue.serverTimestamp(),
          },
        };
        await moodCategoryRef.set(groups, { merge: true });
      }
    }
    return NextResponse.json({
      status: 200,
    });
  } catch (e) {
    return NextResponse.json({ error: `Error: ${e}` }, { status: 500 });
  }
}
