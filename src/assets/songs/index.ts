export interface Song {
  id: string;
  title: string;
  author: string;
  vocalist: string;
  coverPath: string;
  charts: Array<{
    level: number;
    file: string;
  }>;
}

export const songs: Song[] = [
  {
    id: "9a4c1569-d693-4b52-b69c-1038b98417b6",
    title: "SHIAWASE FOR YOU!",
    author: "いよわ",
    vocalist: "初音ミク",
    coverPath: "9a4c1569-d693-4b52-b69c-1038b98417b6/cover.avif",
    charts: [
      { level: 6, file: "chart1.ts" },
      { level: 8, file: "chart2.ts" },
      { level: 10, file: "chart3.ts" },
    ],
  },
  {
    id: "d4bc7e5e-4062-46f0-ab34-012d7619badf",
    title: "Kyu-kurarin",
    author: "いよわ",
    vocalist: "可不",
    coverPath: "d4bc7e5e-4062-46f0-ab34-012d7619badf/cover.avif",
    charts: [
      { level: 7, file: "chart1.ts" },
      { level: 9, file: "chart2.ts" },
      { level: 11, file: "chart3.ts" },
    ],
  },
];

export function getSongById(id: string): Song | undefined {
  return songs.find((song) => song.id === id);
}
