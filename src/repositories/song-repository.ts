import { type Chart } from "../domain/chart";
import { type Difficulty } from "../domain/difficulty";
import { type Song } from "../domain/song";

export interface SongRepository {
  listSongs(): readonly Song[];
  findSongById(id: string): Song | undefined;
  loadChart(songId: string, difficulty: Difficulty): Promise<Chart>;
}
