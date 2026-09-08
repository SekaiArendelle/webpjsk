import { LocalSongRepository } from "./local-song-repository";
import { type SongRepository } from "./song-repository";

// Routes depend on this interface-typed entry point. Replace the implementation
// here when songs move from bundled assets to an HTTP API.
export const songRepository: SongRepository = new LocalSongRepository();
