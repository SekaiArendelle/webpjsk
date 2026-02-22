import "./home.css";
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

function detail_panel(a_song : Song) {
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

function Home() {
  const [selected_song, setSelectedSong] = createSignal<Song>(songs[0]);

  return (
    <>
      <div class="pjsk-container">
        <div class="category-bar">
          <div class="category-item">全部</div>
          <div class="category-item">其他</div>
        </div>

        {song_grids(songs, setSelectedSong)}

        <div class="detail-panel">
          <div class="detail-left">
            <div class="difficulty-selector">
              <div class="difficulty-row">
                <span class="difficulty-label">Easy</span>
                <div class="difficulty-circle easy">
                  <input
                    type="radio"
                    name="difficulty"
                    id="easy"
                    value="easy"
                    checked
                  />
                  <label for="easy">5</label>
                </div>
              </div>
              <div class="difficulty-row">
                <span class="difficulty-label">Hard</span>
                <div class="difficulty-circle hard">
                  <input
                    type="radio"
                    name="difficulty"
                    id="hard"
                    value="hard"
                  />
                  <label for="hard">17</label>
                </div>
              </div>
              <div class="difficulty-row">
                <span class="difficulty-label">Expert</span>
                <div class="difficulty-circle expert">
                  <input
                    type="radio"
                    name="difficulty"
                    id="expert"
                    value="expert"
                  />
                  <label for="expert">24</label>
                </div>
              </div>
            </div>
            <div class="action-buttons">
              <button class="action-btn confirm">确定</button>
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
