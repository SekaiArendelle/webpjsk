import {
  createContext,
  createSignal,
  useContext,
  type ParentProps,
} from "solid-js";
import { Difficulty, parseDifficulty } from "../domain/difficulty";

type ClearRecords = Record<string, Difficulty[]>;

interface PlayProgressStore {
  isCleared: (songId: string, difficulty: Difficulty) => boolean;
  markCleared: (songId: string, difficulty: Difficulty) => void;
}

const STORAGE_KEY = "webpjsk.clearRecords";
const PlayProgressContext = createContext<PlayProgressStore>();

function loadClearRecords(): ClearRecords {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};

    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed).map(([songId, values]) => [
        songId,
        Array.isArray(values)
          ? values
              .map((value) =>
                typeof value === "string" ? parseDifficulty(value) : null,
              )
              .filter((value): value is Difficulty => value !== null)
          : [],
      ]),
    );
  } catch {
    return {};
  }
}

export function PlayProgressProvider(props: ParentProps) {
  const [clearRecords, setClearRecords] = createSignal(loadClearRecords());

  const store: PlayProgressStore = {
    isCleared(songId, difficulty) {
      return clearRecords()[songId]?.includes(difficulty) ?? false;
    },
    markCleared(songId, difficulty) {
      setClearRecords((current) => {
        const songRecords = current[songId] ?? [];
        if (songRecords.includes(difficulty)) return current;

        const next = {
          ...current,
          [songId]: [...songRecords, difficulty],
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
  };

  return (
    <PlayProgressContext.Provider value={store}>
      {props.children}
    </PlayProgressContext.Provider>
  );
}

export function usePlayProgress(): PlayProgressStore {
  const store = useContext(PlayProgressContext);
  if (!store) {
    throw new Error("usePlayProgress must be used inside PlayProgressProvider");
  }
  return store;
}
