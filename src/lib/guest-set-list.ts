import { getSongAnchor, mergeDuplicateSignupSongs, type SetListSong } from './october-set-list';
import type { OctoberSignupSong } from './october-signup';

export type GuestSetListSong = {
  title: string;
  originalArtist: string | null;
  performers: string[];
  videoId: string | null;
};

export function buildGuestSetList(
  setList: SetListSong[],
  references: OctoberSignupSong[],
): GuestSetListSong[] {
  const videos = new Map(
    mergeDuplicateSignupSongs(references).map((song) => [
      getSongAnchor(song.title, song.originalArtist),
      song.videoId,
    ]),
  );
  return setList.map((song) => ({
    title: song.title,
    originalArtist: song.originalArtist,
    performers: [...new Map(
      song.roles.flatMap(({ performers }) =>
        performers.map(({ initials, name }) => [initials, name] as const),
      ),
    ).values()],
    videoId: videos.get(getSongAnchor(song.title, song.originalArtist)) ?? null,
  }));
}
