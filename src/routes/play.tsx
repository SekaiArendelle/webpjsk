import { A, useNavigate, useParams, useSearchParams } from "@solidjs/router";
import {
  Show,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  onCleanup,
} from "solid-js";
import PlayChart from "../components/chart";
import { parseDifficulty } from "../domain/difficulty";
import { isDifficultyAvailable } from "../domain/song";
import { songRepository } from "../repositories";
import { usePlayProgress } from "../stores/play-progress";
import { playAudio } from "../utils/play_audio";
import "./play.css";

export default function PlayRoute() {
  const navigate = useNavigate();
  const progress = usePlayProgress();
  const params = useParams<{ songId: string }>();
  const [searchParams] = useSearchParams<{ difficulty?: string }>();
  const [paused, setPaused] = createSignal(false);
  const [audio, setAudio] = createSignal<HTMLAudioElement | undefined>();
  const [audioEnded, setAudioEnded] = createSignal(false);
  const [audioError, setAudioError] = createSignal<string | null>(null);

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

  createEffect(() => {
    if (chart.loading || !chart() || !chartRequest()) return;
    const currentSong = song();
    if (!currentSong) return;
    const player = playAudio(currentSong.musicUrl);
    const handleEnded = () => setAudioEnded(true);
    const handleError = () => setAudioError("音频加载失败，请检查资源后重试。");
    player.addEventListener("ended", handleEnded);
    player.addEventListener("error", handleError);
    setAudioEnded(false);
    setAudioError(null);
    setAudio(player);
    onCleanup(() => {
      player.pause();
      player.removeEventListener("ended", handleEnded);
      player.removeEventListener("error", handleError);
      setAudio(undefined);
    });
  });

  createEffect(() => {
    const isPaused = paused();
    const player = audio();
    if (!player || audioEnded()) return;
    if (isPaused) {
      player.pause();
    } else {
      void player
        .play()
        .then(() => setAudioError(null))
        .catch(() => setAudioError("浏览器未开始播放音频，请点击继续播放。"));
    }
  });

  onCleanup(() => {
    audio()?.pause();
  });

  function complete(cleared: boolean) {
    audio()?.pause();
    if (cleared) {
      const request = chartRequest();
      if (request) progress.markCleared(request.songId, request.difficulty);
    }
  }

  return (
    <main class="play-route">
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
            {(loadedChart) => (
              <PlayChart
                chart={loadedChart()}
                song={song()!}
                difficulty={difficulty()!}
                paused={paused}
                audioTimeMs={() => (audio()?.currentTime ?? 0) * 1000}
                audioEnded={audioEnded}
                togglePaused={() => setPaused((value) => !value)}
                exit={() => navigate("/select")}
                onComplete={complete}
              />
            )}
          </Show>
        </Show>
      </Show>
      <Show when={audioError()}>
        {(message) => (
          <div class="audio-error">
            <p>{message()}</p>
            <button
              onClick={() => {
                const player = audio();
                if (player)
                  void player
                    .play()
                    .then(() => setAudioError(null))
                    .catch(() =>
                      setAudioError("音频仍无法播放，请检查浏览器的音频权限。"),
                    );
              }}
            >
              继续播放
            </button>
            <button onClick={() => navigate("/select")}>返回选歌</button>
          </div>
        )}
      </Show>
    </main>
  );
}
