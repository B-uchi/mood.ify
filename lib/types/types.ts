export interface NotePosition {
  id: number;
  left: number;
  top: number;
}
export interface StatsItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}
export type MoodType =
  | "default"
  | "happy"
  | "chill"
  | "energetic"
  | "melancholic"
  | "focused";

export type MoodClasses = {
  background: string;
  placeholder: string;
  text: string;
  secondary: string;
  button: string;
};
export type statData = {
  totalGenerated: number;
  totalShares: number;
  totalPlaylistDuration: number;
  totalUsers: number;
};