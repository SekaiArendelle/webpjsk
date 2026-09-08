import { type Difficulty } from "./difficulty";

export interface Song {
  id: string;
  title: string;
  author: string;
  vocal: string;
  coverUrl: string;
  musicUrl: string;
  levels: Record<Difficulty, number>;
  availableDifficulties: readonly Difficulty[];
}

export function isDifficultyAvailable(
  song: Song,
  difficulty: Difficulty,
): boolean {
  return song.availableDifficulties.includes(difficulty);
}
