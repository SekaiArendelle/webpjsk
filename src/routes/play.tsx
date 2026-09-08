import { A, useParams, useSearchParams } from "@solidjs/router";
import {
  Show,
  createEffect,
  createMemo,
  createResource,
  onCleanup,
} from "solid-js";
import PlayChart from "../components/chart";
import { parseDifficulty } from "../domain/difficulty";
import { isDifficultyAvailable } from "../domain/song";
import { songRepository } from "../repositories";
import { playAudio } from "../utils/play_audio";
import "./play.css";

export default function PlayRoute() {
  const params = useParams<{ songId: string }>();
  const [searchParams] = useSearchParams<{ difficulty?: string }>();

  const song = createMemo(() => songRepository.findSongById(params.songId));
  const difficulty = createMemo(() => parseDifficulty(searchParams.difficulty));
  const chartRequest = createMemo(() => {
    const currentSong = song();
    const currentDifficulty = difficulty();
    return currentSong &&
      currentDifficulty &&
      isDifficultyAvailable(currentSong, currentDifficulty)
      ? ({ songId: currentSong.id, difficulty: currentDifficulty } as const)
      : null;
  });

  const [chart] = createResource(chartRequest, (request) =>
    songRepository.loadChart(request.songId, request.difficulty),
  );

  let audio: HTMLAudioElement | undefined;
  createEffect(() => {
    if (!chart()) return;
    const currentSong = song();
    if (!currentSong) return;
    audio?.pause();
    audio = playAudio(currentSong.musicUrl);
  });

  onCleanup(() => {
    audio?.pause();
    if (audio) audio.currentTime = 0;
  });

  return (
    <main class="play-route">
      <A class="play-route-back" href="/select" aria-label="返回选歌">
        ←
      </A>

      <Show
        when={chartRequest()}
        fallback={
          <div class="route-message">
            <h1>无法进入歌曲</h1>
            <p>歌曲不存在，或当前难度没有可用谱面。</p>
            <A href="/select">返回选歌</A>
          </div>
        }
      >
        <Show
          when={!chart.error}
          fallback={
            <div class="route-message">
              <h1>谱面加载失败</h1>
              <p>{String(chart.error)}</p>
              <A href="/select">返回选歌</A>
            </div>
          }
        >
          <Show
            when={!chart.loading && chart()}
            fallback={<div class="route-message">正在加载谱面…</div>}
          >
            {(loadedChart) => <PlayChart chart={loadedChart()} />}
          </Show>
        </Show>
      </Show>
    </main>
  );
}
