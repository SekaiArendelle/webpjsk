import { type Chart } from "../domain/chart";
import { Difficulty } from "../domain/difficulty";
import { type Song } from "../domain/song";
import { type SongRepository } from "./song-repository";

interface LocalSongDefinition {
  id: string;
  title: string;
  author: string;
  vocal: string;
  coverPath: string;
  musicPath: string;
  levels: Record<Difficulty, number>;
  chartPaths: Partial<Record<Difficulty, string>>;
}

const mediaUrls = import.meta.glob<string>("../assets/songs/*/*.{avif,m4a}", {
  eager: true,
  query: "?url",
  import: "default",
});

const chartModules = import.meta.glob<{ chart: Chart }>(
  "../assets/songs/*/chart*.ts",
);

const definitions: readonly LocalSongDefinition[] = [
  {
    id: "9a4c1569-d693-4b52-b69c-1038b98417b6",
    title: "SHIAWASE FOR YOU!",
    author: "いよわ",
    vocal: "初音ミク",
    coverPath: "9a4c1569-d693-4b52-b69c-1038b98417b6/cover.avif",
    musicPath: "9a4c1569-d693-4b52-b69c-1038b98417b6/music.m4a",
    levels: {
      [Difficulty.Easy]: 5,
      [Difficulty.Normal]: 12,
      [Difficulty.Hard]: 17,
      [Difficulty.Expert]: 28,
      [Difficulty.Master]: 31,
    },
    chartPaths: {
      [Difficulty.Easy]: "9a4c1569-d693-4b52-b69c-1038b98417b6/chart1.ts",
      [Difficulty.Hard]: "9a4c1569-d693-4b52-b69c-1038b98417b6/chart2.ts",
      [Difficulty.Expert]: "9a4c1569-d693-4b52-b69c-1038b98417b6/chart3.ts",
    },
  },
  {
    id: "d4bc7e5e-4062-46f0-ab34-012d7619badf",
    title: "Kyu-kurarin",
    author: "いよわ",
    vocal: "可不",
    coverPath: "d4bc7e5e-4062-46f0-ab34-012d7619badf/cover.avif",
    musicPath: "d4bc7e5e-4062-46f0-ab34-012d7619badf/music.m4a",
    levels: {
      [Difficulty.Easy]: 5,
      [Difficulty.Normal]: 12,
      [Difficulty.Hard]: 17,
      [Difficulty.Expert]: 27,
      [Difficulty.Master]: 31,
    },
    chartPaths: {
      [Difficulty.Easy]: "d4bc7e5e-4062-46f0-ab34-012d7619badf/chart1.ts",
      [Difficulty.Hard]: "d4bc7e5e-4062-46f0-ab34-012d7619badf/chart2.ts",
      [Difficulty.Expert]: "d4bc7e5e-4062-46f0-ab34-012d7619badf/chart3.ts",
    },
  },
];

function requireMediaUrl(path: string): string {
  const url = mediaUrls[`../assets/songs/${path}`];
  if (!url) throw new Error(`找不到歌曲资源：${path}`);
  return url;
}

export class LocalSongRepository implements SongRepository {
  private readonly definitionsById = new Map(
    definitions.map((definition) => [definition.id, definition]),
  );

  private readonly songs = definitions.map<Song>((definition) => ({
    id: definition.id,
    title: definition.title,
    author: definition.author,
    vocal: definition.vocal,
    coverUrl: requireMediaUrl(definition.coverPath),
    musicUrl: requireMediaUrl(definition.musicPath),
    levels: definition.levels,
    availableDifficulties: Object.keys(definition.chartPaths) as Difficulty[],
  }));

  listSongs(): readonly Song[] {
    return this.songs;
  }

  findSongById(id: string): Song | undefined {
    return this.songs.find((song) => song.id === id);
  }

  async loadChart(songId: string, difficulty: Difficulty): Promise<Chart> {
    const definition = this.definitionsById.get(songId);
    if (!definition) throw new Error(`找不到歌曲：${songId}`);

    const path = definition.chartPaths[difficulty];
    if (!path) throw new Error(`歌曲 ${songId} 没有 ${difficulty} 谱面`);

    const loadChart = chartModules[`../assets/songs/${path}`];
    if (!loadChart) throw new Error(`找不到谱面文件：${path}`);

    return (await loadChart()).chart;
  }
}
