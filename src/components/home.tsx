import "./home.css";
import { Difficulty } from "./difficulty";
import { type Song, songs } from "../assets/songs";
import { For, createSignal, type Setter } from "solid-js";

/**
 * @pure
 * @param songs list of song
 * @returns html div node
 */
function song_grids(songs: Song[], setSelectedSong: Setter<Song>) {
  return (
    <div class="song-grid">
      <For each={songs}>
        {(song) => (
          <div class="song-card" onClick={() => setSelectedSong(song)}>
            <img
              class="song-cover"
              src={`/src/assets/songs/${song.coverPath}`}
              alt={song.title}
            />
          </div>
        )}
      </For>
    </div>
  );
}

function detail_panel(a_song: Song) {
  return (
    <>
      <div class="detail-center">
        <h2 class="song-title">{a_song.title}</h2>
        <p class="song-artist">{a_song.author}</p>
        <p class="song-vocal">{a_song.vocal}</p>
      </div>

      <div class="detail-right">
        <img
          class="detail-cover"
          src={`/src/assets/songs/${a_song.coverPath}`}
          alt="detail"
        />
      </div>
    </>
  );
}

function difficulty_to_string(difficulty: Difficulty): string {
  switch (difficulty) {
    case Difficulty.Easy:
      return "easy";
    case Difficulty.Hard:
      return "hard";
    case Difficulty.Expert:
      return "expert";
    // default: unreachable()
  }
}

function difficulty_circle(
  level: number,
  difficulty: Difficulty,
  setDifficulty: Setter<Difficulty>,
) {
  return (
    <div class="difficulty-row">
      <span class="difficulty-label">{difficulty_to_string(difficulty)}</span>
      <div
        class={`difficulty-circle ${difficulty_to_string(difficulty)}`}
        onClick={() => setDifficulty(difficulty)}
      >
        <input
          type="radio"
          name="difficulty"
          id={`difficulty-${difficulty_to_string(difficulty)}`}
          value={difficulty_to_string(difficulty)}
          checked={difficulty === Difficulty.Easy}
        />
        <label for={`difficulty-${difficulty_to_string(difficulty)}`}>
          {level}
        </label>
      </div>
    </div>
  );
}

function Home() {
  const [selected_song, setSelectedSong] = createSignal<Song>(songs[0]);
  const [difficulty, setDifficulty] = createSignal<Difficulty>(Difficulty.Easy);

  return (
    <>
      <div class="pjsk-container">
        {song_grids(songs, setSelectedSong)}

        <div class="detail-panel">
          <div class="detail-left">
            <div class="difficulty-selector">
              {difficulty_circle(5, Difficulty.Easy, setDifficulty)}
              {difficulty_circle(17, Difficulty.Hard, setDifficulty)}
              {difficulty_circle(28, Difficulty.Expert, setDifficulty)}
            </div>
            <div class="action-buttons">
              <button class="action-btn confirm">Confirm</button>
            </div>
          </div>
          {detail_panel(selected_song())}
        </div>

        <div class="sidebar">
          <div class="sidebar-btn">🔍</div>
          <div class="sidebar-btn">⚙</div>
        </div>
      </div>
    </>
  );
}

export default Home;
