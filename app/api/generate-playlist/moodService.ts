import { adminDb } from "@/lib/firebase/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export type MoodMap = {
  synonyms: string[];
  seed_data: {
    artists: string[];
    tracks: string[];
    genres: string[];
  };
  meta_data: {
    useCount: number;
    lastUsed: Date;
  };
};
type MoodDocData = {
  [key: string]: MoodMap;
}

class MoodService {
  private cache: Map<
    string,
    { data: MoodMap["seed_data"]; timestamp: number }
  > = new Map();
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.cache = new Map();
  }

  async getMoodMap(
    mood: string | null,
    moodCategory: string | null
  ): Promise<MoodMap["seed_data"] | null> {
    try {
      if (!mood || !moodCategory) {
        throw new Error("Incomplete mood data");
      }
      const normalizedMood = this.normalizeMood(mood);

      const cached = this.cache.get(normalizedMood);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }

      const fullMoodDoc = await adminDb
        .collection("moods")
        .doc(moodCategory)
        .get();

      if (!fullMoodDoc.exists) {
        return null;
      }

      let moodSeedData;

      for (const [, moodData] of Object.entries(fullMoodDoc.data() as MoodDocData)) {
        const data = moodData;
        if (data.synonyms && data.synonyms.includes(mood)) {
          moodSeedData = data.seed_data;
        }
      }

      if (!moodSeedData) {
        return null;
      }

      this.cache.set(normalizedMood, {
        data: moodSeedData,
        timestamp: Date.now(),
      });

      await this.updateMoodUsage(normalizedMood, moodCategory, fullMoodDoc);

      return moodSeedData;
    } catch (error) {
      console.error("Error getting mood seed data:", error);
      throw error;
    }
  }

  async getDefaultSeeds(): Promise<MoodMap["seed_data"]> {
    try {
      const defaultMoodDoc = await adminDb
        .collection("moods")
        .doc("default")
        .get();

      if (!defaultMoodDoc.exists) {
        throw new Error("Default mood map not found");
      }

      return defaultMoodDoc.data() as MoodMap["seed_data"];
    } catch (error) {
      console.error("Error getting default seeds:", error);
      throw error;
    }
  }

  async submitSeedRating(
    moodId: string,
    seedId: string,
    rating: number,
    userId: string
  ): Promise<void> {
    try {
      const seedRef = adminDb.collection("mood_seeds").doc(seedId);

      // Update seed score
      await seedRef.update({
        score: rating,
        lastRatedBy: userId,
        lastRatedAt: FieldValue.serverTimestamp(),
      });

      // Clear cache for this mood
      this.cache.delete(moodId);
    } catch (error) {
      console.error("Error submitting seed rating:", error);
      throw error;
    }
  }

  private async updateMoodUsage(
    mood: string,
    category: string,
    fullMoodDoc: any
  ): Promise<void> {
    try {
      const fullMoodRef = adminDb.collection("moods").doc(category);
      for (const [moodName, moodData] of Object.entries(fullMoodDoc.data())) {
        const data = moodData as MoodMap;
        if (data.synonyms && data.synonyms.includes(mood)) {
          const doc: any = {};
          doc[moodName] = {
            meta_data: {
              usageCount: FieldValue.increment(1),
              lastUsed: FieldValue.serverTimestamp(),
            },
          };
          await fullMoodRef.set(doc, { merge: true });
          break;
        }
      }
    } catch (error) {
      console.error("Error updating mood usage:", error);
    }
  }

  private normalizeMood(mood: string): string {
    return mood
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "");
  }

  clearCache(moodId?: string): void {
    if (moodId) {
      this.cache.delete(this.normalizeMood(moodId));
    } else {
      this.cache.clear();
    }
  }
}

export const moodService = new MoodService();
