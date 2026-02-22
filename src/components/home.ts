import { songs, type Song } from "../assets/songs/index";

let selectedSong: Song | null = null;
let selectedDifficulty: number = 0;

export function initHome() {
  renderSongGrid();
  setupEventListeners();
  // Select first song by default
  if (songs.length > 0) {
    selectSong(songs[0]);
  }
}

function renderSongGrid() {
  const grid = document.querySelector(".song-grid") as HTMLElement;
  if (!grid) return;

  grid.innerHTML = "";

  songs.forEach((song) => {
    const card = document.createElement("div");
    card.className = "song-card";
    card.dataset.songId = song.id;

    card.innerHTML = `
      <img class="song-cover" src="/src/assets/songs/${song.coverPath}" alt="${song.title}" />
    `;

    card.addEventListener("click", () => selectSong(song));
    grid.appendChild(card);
  });
}

function selectSong(song: Song) {
  selectedSong = song;
  // Reset to the first available difficulty
  selectedDifficulty = 0;

  // Update card selection
  document.querySelectorAll(".song-card").forEach((card) => {
    if ((card as HTMLElement).dataset.songId === song.id) {
      card.classList.add("selected");
    } else {
      card.classList.remove("selected");
    }
  });

  updateDetailPanel();
}

function updateDetailPanel() {
  if (!selectedSong) return;

  const titleEl = document.querySelector(".song-title") as HTMLElement;
  const artistEl = document.querySelector(".song-artist") as HTMLElement;
  const vocalEl = document.querySelector(".song-vocal") as HTMLElement;
  const coverEl = document.querySelector(".detail-cover") as HTMLImageElement;

  if (titleEl) titleEl.textContent = selectedSong.title;
  if (artistEl) artistEl.textContent = selectedSong.author;
  if (vocalEl) vocalEl.textContent = selectedSong.vocalist;
  if (coverEl) coverEl.src = `/src/assets/songs/${selectedSong.coverPath}`;

  bindDifficultyEvents();
}

function bindDifficultyEvents() {
  // Difficulty circle clicks
  document.querySelectorAll(".difficulty-circle").forEach((circle, index) => {
    circle.addEventListener("click", () => {
      selectedDifficulty = index;
      document
        .querySelector(".selected-level")
        ?.classList.remove("selected-level");
      circle.classList.add("selected-level");
    });
  });
}
function setupEventListeners() {
  bindDifficultyEvents();

  // Action buttons
  const confirmBtn = document.querySelector(
    ".action-btn.confirm",
  ) as HTMLElement;
  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      // if (selectedSong) {
      //   console.log(
      //     `Selected: ${selectedSong.title} - Level ${selectedSong.difficulty[selectedDifficulty]}`,
      //   );
      //   // Handle confirm action here
      // }
    });
  }
}
