import { useNavigate } from "@solidjs/router";
import { For, createMemo, createSignal, type Accessor } from "solid-js";
import { Difficulty, difficultyDefinitions } from "../domain/difficulty";
import { isDifficultyAvailable, type Song } from "../domain/song";
import { songRepository } from "../repositories";
import { usePlaySession } from "../stores/play-session";
import "./select.css";

const categories = [
  { icon: "♪", label: "全部", active: true },
  { icon: "✦", label: "虚拟歌手" },
  { icon: "♣", label: "Leo/need" },
  { icon: "◉", label: "MORE MORE JUMP!" },
  { icon: "♛", label: "Vivid BAD SQUAD" },
  { icon: "◆", label: "Wonderlands×Showtime" },
  { icon: "◇", label: "25点，Nightcord见。" },
];

function SongGrid(props: {
  songList: readonly Song[];
  selectedSong: Accessor<Song>;
  selectSong: (song: Song) => void;
}) {
  return (
    <div class="song-grid" aria-label="歌曲列表">
      <For each={props.songList}>
        {(song) => (
          <button
            class="song-card"
            classList={{ selected: props.selectedSong().id === song.id }}
            onClick={() => props.selectSong(song)}
            aria-label={`选择歌曲 ${song.title}`}
          >
            <img class="song-cover" src={song.coverUrl} alt="" />
            <span class="song-level">{song.levels[Difficulty.Expert]}</span>
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
  song: Accessor<Song>;
  difficulty: Accessor<Difficulty>;
  selectDifficulty: (difficulty: Difficulty) => void;
}) {
  return (
    <div class="difficulty-selector" aria-label="难度选择">
      <For each={difficultyDefinitions}>
        {(item) => {
          const available = () =>
            isDifficultyAvailable(props.song(), item.kind);
          return (
            <button
              class={`difficulty-item ${item.className}`}
              classList={{
                active: available() && props.difficulty() === item.kind,
                unavailable: !available(),
              }}
              disabled={!available()}
              onClick={() => props.selectDifficulty(item.kind)}
            >
              <span class="difficulty-number">
                {props.song().levels[item.kind]}
              </span>
              <span class="difficulty-name">{item.label}</span>
            </button>
          );
        }}
      </For>
    </div>
  );
}

export default function SelectRoute() {
  const navigate = useNavigate();
  const session = usePlaySession();
  const songList = songRepository.listSongs();
  const initialSong =
    songRepository.findSongById(session.selectedSongId() ?? "") ?? songList[0];

  if (!initialSong) throw new Error("歌曲仓库中没有歌曲");
  if (!session.selectedSongId()) session.selectSong(initialSong.id);
  if (!isDifficultyAvailable(initialSong, session.difficulty())) {
    session.selectDifficulty(initialSong.availableDifficulties[0]);
  }

  const [searchQuery, setSearchQuery] = createSignal("");
  const selectedSong = createMemo(
    () =>
      songRepository.findSongById(session.selectedSongId() ?? "") ??
      initialSong,
  );
  const filteredSongs = createMemo(() => {
    const query = searchQuery().trim().toLocaleLowerCase();
    if (!query) return songList;
    return songList.filter((song) =>
      [song.title, song.author, song.vocal].some((value) =>
        value.toLocaleLowerCase().includes(query),
      ),
    );
  });

  function selectSong(song: Song) {
    session.selectSong(song.id);
    if (!isDifficultyAvailable(song, session.difficulty())) {
      session.selectDifficulty(song.availableDifficulties[0]);
    }
  }

  function enterChart() {
    const song = selectedSong();
    const difficulty = session.difficulty();
    navigate(`/play/${encodeURIComponent(song.id)}?difficulty=${difficulty}`);
  }

  return (
    <main class="pjsk-container">
      <div class="ambient-shape shape-one" />
      <div class="ambient-shape shape-two" />

      <header class="topbar">
        <button
          class="round-tool back-button"
          aria-label="返回"
          onClick={() => navigate(-1)}
        >
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
            selectSong={selectSong}
          />
        </section>

        <section class="detail-panel" aria-label="当前歌曲详情">
          <div class="detail-card">
            <div class="detail-content">
              <img
                class="detail-cover"
                src={selectedSong().coverUrl}
                alt={`${selectedSong().title} 曲绘`}
              />

              <div class="song-copy">
                <h1 class="song-title">{selectedSong().title}</h1>
                <p class="song-artist">{selectedSong().author}</p>
                <p class="song-vocal">Vo. {selectedSong().vocal}</p>
              </div>

              <span class="rank-badge">B</span>

              <DifficultySelector
                song={selectedSong}
                difficulty={session.difficulty}
                selectDifficulty={session.selectDifficulty}
              />

              <button class="confirm-button" onClick={enterChart}>
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
