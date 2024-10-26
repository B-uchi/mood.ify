import { NotePosition } from "@/lib/types/types";

export function generateNotePositions(count: number): NotePosition[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: (i * 237) % 100,
    top: (i * (i * i)) % 100,
  }));
}
