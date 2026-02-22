export interface Song {
  id: string;
  title: string;
  author: string;
  vocal: string;
  coverPath: string;
  easyChartFilePath: string;
  hardChartFilePath: string;
  expertChartFilePath: string;
}

export const songs: Song[] = [
  {
    id: "9a4c1569-d693-4b52-b69c-1038b98417b6",
    title: "SHIAWASE FOR YOU!",
    author: "いよわ",
    vocal: "初音ミク",
    coverPath: "9a4c1569-d693-4b52-b69c-1038b98417b6/cover.avif",
    easyChartFilePath: "9a4c1569-d693-4b52-b69c-1038b98417b6/chart1.ts",
    hardChartFilePath: "9a4c1569-d693-4b52-b69c-1038b98417b6/chart2.ts",
    expertChartFilePath: "9a4c1569-d693-4b52-b69c-1038b98417b6/chart3.ts",
  },
  {
    id: "d4bc7e5e-4062-46f0-ab34-012d7619badf",
    title: "Kyu-kurarin",
    author: "いよわ",
    vocal: "可不",
    coverPath: "d4bc7e5e-4062-46f0-ab34-012d7619badf/cover.avif",
    easyChartFilePath: "d4bc7e5e-4062-46f0-ab34-012d7619badf/chart1.ts",
    hardChartFilePath: "d4bc7e5e-4062-46f0-ab34-012d7619badf/chart2.ts",
    expertChartFilePath: "d4bc7e5e-4062-46f0-ab34-012d7619badf/chart3.ts",
  },
];
