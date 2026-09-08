export enum Difficulty {
  Easy = "easy",
  Normal = "normal",
  Hard = "hard",
  Expert = "expert",
  Master = "master",
}

export const difficultyDefinitions = [
  { kind: Difficulty.Easy, label: "EASY", className: "easy" },
  { kind: Difficulty.Normal, label: "NORMAL", className: "normal" },
  { kind: Difficulty.Hard, label: "HARD", className: "hard" },
  { kind: Difficulty.Expert, label: "EXPERT", className: "expert" },
  { kind: Difficulty.Master, label: "MASTER", className: "master" },
] as const;

export function parseDifficulty(value: string | undefined): Difficulty | null {
  return Object.values(Difficulty).includes(value as Difficulty)
    ? (value as Difficulty)
    : null;
}
