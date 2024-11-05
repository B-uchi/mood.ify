"use client"
import { MoodType } from "@/lib/types/types";

  
export const getMoodClasses = (mood: MoodType) => ({
  background: {
    default:
      "from-mood-default-primary-from via-mood-default-primary-via to-mood-default-primary-to",
      happy:
      "from-mood-happy-primary-from via-mood-happy-primary-via to-mood-happy-primary-to",
      chill:
      "from-mood-chill-primary-from via-mood-chill-primary-via to-mood-chill-primary-to",
    energetic:
      "from-mood-energetic-primary-from via-mood-energetic-primary-via to-mood-energetic-primary-to",
    melancholic:
      "from-mood-melancholic-primary-from via-mood-melancholic-primary-via to-mood-melancholic-primary-to",
    focused:
      "from-mood-focused-primary-from via-mood-focused-primary-via to-mood-focused-primary-to",
  }[mood],
  placeholder: { 
    default: "placeholder:text-mood-default-primary-text",
    happy: "placeholder:text-mood-happy-primary-text",
    chill: "placeholder:text-mood-chill-primary-text",
    energetic: "placeholder:text-mood-energetic-primary-text",
    melancholic: "placeholder:text-mood-melancholic-primary-text",
    focused: "placeholder:text-mood-focused-primary-text",
  }[mood],
  text: {
    default: "text-mood-default-primary-text",
    happy: "text-mood-happy-primary-text",
    chill: "text-mood-chill-primary-text",
    energetic: "text-mood-energetic-primary-text",
    melancholic: "text-mood-melancholic-primary-text",
    focused: "text-mood-focused-primary-text",
  }[mood],
  secondary: {
    default: "text-mood-default-primary-secondary",
    happy: "text-mood-happy-primary-secondary",
    chill: "text-mood-chill-primary-secondary",
    energetic: "text-mood-energetic-primary-secondary",
    melancholic: "text-mood-melancholic-primary-secondary",
    focused: "text-mood-focused-primary-secondary",
  }[mood],
  button: {
    default:
      "bg-mood-default-primary-secondary hover:bg-mood-default-primary-secondary/80",
    happy:
      "bg-mood-happy-primary-secondary hover:bg-mood-happy-primary-secondary/80",
    chill:
      "bg-mood-chill-primary-secondary hover:bg-mood-chill-primary-secondary/80",
    energetic:
      "bg-mood-energetic-primary-secondary hover:bg-mood-energetic-primary-secondary/80",
    melancholic:
      "bg-mood-melancholic-primary-secondary hover:bg-mood-melancholic-primary-secondary/80",
    focused:
      "bg-mood-focused-primary-secondary hover:bg-mood-focused-primary-secondary/80",
  }[mood],
});