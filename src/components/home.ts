import { songs, type Song } from "../assets/songs/index";

let selectedSong: Song | null = null;

export function initHome() {
  renderSongGrid();
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

  titleEl.textContent = selectedSong.title;
   artistEl.textContent = selectedSong.author;
  vocalEl.textContent = selectedSong.vocalist;
  coverEl.src = `/src/assets/songs/${selectedSong.coverPath}`;
}
