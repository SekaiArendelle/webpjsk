import {
  createContext,
  createSignal,
  useContext,
  type ParentProps,
} from "solid-js";
import { Difficulty } from "../domain/difficulty";

interface PlaySessionStore {
  selectedSongId: () => string | null;
  difficulty: () => Difficulty;
  selectSong: (songId: string) => void;
  selectDifficulty: (difficulty: Difficulty) => void;
}

const PlaySessionContext = createContext<PlaySessionStore>();

export function PlaySessionProvider(props: ParentProps) {
  const [selectedSongId, setSelectedSongId] = createSignal<string | null>(null);
  const [difficulty, setDifficulty] = createSignal(Difficulty.Expert);

  const store: PlaySessionStore = {
    selectedSongId,
    difficulty,
    selectSong: setSelectedSongId,
    selectDifficulty: setDifficulty,
  };

  return (
    <PlaySessionContext.Provider value={store}>
      {props.children}
    </PlaySessionContext.Provider>
  );
}

export function usePlaySession(): PlaySessionStore {
  const store = useContext(PlaySessionContext);
  if (!store) {
    throw new Error("usePlaySession must be used inside PlaySessionProvider");
  }
  return store;
}
