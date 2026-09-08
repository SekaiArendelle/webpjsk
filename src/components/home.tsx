import {
  For,
  createMemo,
  createSignal,
  type Accessor,
  type Setter,
} from "solid-js";
import { type Song, songs } from "../assets/songs";
import { type Chart } from "../utils/chart";
import { Difficulty } from "../utils/difficulty";
import { type PageKindProp } from "../utils/pagekindprop";
import { PageKind } from "../utils/pagekind";
import { playAudio } from "../utils/play_audio";
import "./home.css";

const difficultyMeta = [
  { kind: Difficulty.Easy, label: "EASY", level: 5, className: "easy" },
  { kind: null, label: "NORMAL", level: 12, className: "normal" },
  { kind: Difficulty.Hard, label: "HARD", level: 17, className: "hard" },
  { kind: Difficulty.Expert, label: "EXPERT", level: 28, className: "expert" },
  { kind: null, label: "MASTER", level: 31, className: "master" },
] as const;

const categories = [
  { icon: "♪", label: "全部", active: true },
  { icon: "✦", label: "虚拟歌手" },
  { icon: "♣", label: "Leo/need" },
  { icon: "◉", label: "MORE MORE JUMP!" },
  { icon: "♛", label: "Vivid BAD SQUAD" },
  { icon: "◆", label: "Wonderlands×Showtime" },
  { icon: "◇", label: "25点，Nightcord见。" },
];

const mediaUrls = import.meta.glob<string>("../assets/songs/*/*.{avif,m4a}", {
  eager: true,
  query: "?url",
  import: "default",
});

const chartModules = import.meta.glob<{ chart: Chart }>(
  "../assets/songs/*/chart*.ts",
);

function coverUrl(song: Song) {
  return mediaUrls[`../assets/songs/${song.coverPath}`];
}

function musicUrl(song: Song) {
  return mediaUrls[`../assets/songs/${song.musicPath}`];
}

function SongGrid(props: {
  songList: Song[];
  selectedSong: Accessor<Song>;
  setSelectedSong: Setter<Song>;
}) {
  return (
    <div class="song-grid" aria-label="歌曲列表">
      <For each={props.songList}>
        {(song, index) => (
          <button
            class="song-card"
            classList={{ selected: props.selectedSong() === song }}
            onClick={() => props.setSelectedSong(song)}
            aria-label={`选择歌曲 ${song.title}`}
          >
            <img class="song-cover" src={coverUrl(song)} alt="" />
            <span class="song-level">{index() === 0 ? 28 : 27}</span>
            <span class="clear-gems" aria-hidden="true">
              <i />
              <i />
              <i class="lit" />
              <i />
              <i />
            </span>
            <span class="song-tag">2D</span>
          </button>
        )}
      </For>
    </div>
  );
}

function DifficultySelector(props: {
  difficulty: Accessor<Difficulty>;
  setDifficulty: Setter<Difficulty>;
}) {
  return (
    <div class="difficulty-selector" aria-label="难度选择">
      <For each={difficultyMeta}>
        {(item) => {
          const disabled = item.kind === null;
          return (
            <button
              class={`difficulty-item ${item.className}`}
              classList={{
                active: !disabled && props.difficulty() === item.kind,
                unavailable: disabled,
              }}
              disabled={disabled}
              onClick={() =>
                item.kind !== null && props.setDifficulty(item.kind)
              }
            >
              <span class="difficulty-number">{item.level}</span>
              <span class="difficulty-name">{item.label}</span>
            </button>
          );
        }}
      </For>
    </div>
  );
}

async function chartEntry(
  song: Song,
  difficulty: Difficulty,
  pagekindProp: PageKindProp,
) {
  let path: string;

  switch (difficulty) {
    case Difficulty.Easy:
      path = song.easyChartFilePath;
      break;
    case Difficulty.Hard:
      path = song.hardChartFilePath;
      break;
    case Difficulty.Expert:
      path = song.expertChartFilePath;
      break;
  }

  const loadChart = chartModules[`../assets/songs/${path}`];
  if (!loadChart) {
    throw new Error(`找不到谱面文件：${path}`);
  }

  const mod = await loadChart();
  pagekindProp.setChart(mod.chart);
  pagekindProp.setPageKind(PageKind.Chart);
  playAudio(musicUrl(song));
}

function Home(pagekindProp: PageKindProp) {
  const [selectedSong, setSelectedSong] = createSignal<Song>(songs[0]);
  const [difficulty, setDifficulty] = createSignal<Difficulty>(
    Difficulty.Expert,
  );
  const [searchQuery, setSearchQuery] = createSignal("");
  const filteredSongs = createMemo(() => {
    const query = searchQuery().trim().toLocaleLowerCase();
    if (!query) return songs;
    return songs.filter((song) =>
      [song.title, song.author, song.vocal].some((value) =>
        value.toLocaleLowerCase().includes(query),
      ),
    );
  });

  return (
    <main class="pjsk-container">
      <div class="ambient-shape shape-one" />
      <div class="ambient-shape shape-two" />

      <header class="topbar">
        <button class="round-tool back-button" aria-label="返回">
          <span>↶</span>
        </button>

        <label class="search-box">
          <input
            value={searchQuery()}
            onInput={(event) => setSearchQuery(event.currentTarget.value)}
            placeholder="根据歌曲名、作者名查找"
            aria-label="搜索歌曲"
          />
          <span class="search-icon" aria-hidden="true" />
        </label>

        <button class="pill-tool list-button">
          <span class="list-icon">☷</span>
          <span>歌单</span>
        </button>

        <div class="topbar-spacer" />

        <button class="round-tool filter-button" aria-label="筛选">
          ▼
        </button>
        <button class="pill-tool sort-button">默认</button>
        <button class="round-tool menu-button" aria-label="菜单">
          ☰
        </button>
      </header>

      <div class="selection-layout">
        <nav class="category-rail" aria-label="歌曲分类">
          <div class="category-title">全部</div>
          <For each={categories}>
            {(category) => (
              <button
                class="category-button"
                classList={{ active: category.active }}
                aria-label={category.label}
                title={category.label}
              >
                {category.icon}
              </button>
            )}
          </For>
          <div class="category-other">其他</div>
          <span class="rail-arrow">▼</span>
        </nav>

        <section class="library-panel">
          <SongGrid
            songList={filteredSongs()}
            selectedSong={selectedSong}
            setSelectedSong={setSelectedSong}
          />
        </section>

        <section class="detail-panel" aria-label="当前歌曲详情">
          <div class="detail-card">
            <div class="detail-content">
              <img
                class="detail-cover"
                src={coverUrl(selectedSong())}
                alt={`${selectedSong().title} 曲绘`}
              />

              <div class="song-copy">
                <h1 class="song-title">{selectedSong().title}</h1>
                <p class="song-artist">{selectedSong().author}</p>
                <p class="song-vocal">Vo. {selectedSong().vocal}</p>
              </div>

              <span class="rank-badge">B</span>

              <DifficultySelector
                difficulty={difficulty}
                setDifficulty={setDifficulty}
              />

              <button
                class="confirm-button"
                onClick={() =>
                  void chartEntry(selectedSong(), difficulty(), pagekindProp)
                }
              >
                确定
              </button>

              <div class="detail-actions" aria-hidden="true">
                <span>⌘</span>
                <span>♬</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Home;
