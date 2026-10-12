import { getSongAnchor, projectOctoberSetList, type SetListSong } from './october-set-list';
import { normalizeSignupHeader, type OctoberSignupPerformer } from './october-signup';

export function octoberAlwaysPresentPerformers(performers: OctoberSignupPerformer[]) {
  return performers.filter(({ name }) => {
    const firstName = normalizeSignupHeader(name).split(' ')[0];
    return firstName === 'donald' || firstName === 'randal';
  });
}

export function octoberPracticeColumn(headers: string[]): number | null {
  const columns = headers.flatMap((header, column) =>
    normalizeSignupHeader(header) === 'practice' ? [column] : [],
  );
  return columns.length === 1 ? columns[0] : null;
}

export function isPracticeDone(value: string): boolean {
  return normalizeSignupHeader(value) === 'done!';
}

export function projectOctoberPracticeSongs(
  headers: string[],
  rows: string[][],
  performers: OctoberSignupPerformer[],
): SetListSong[] | null {
  const column = octoberPracticeColumn(headers);
  if (column === null) return null;
  const { songs } = projectOctoberSetList(headers, rows, performers);
  const completed = new Set(songs.flatMap((song, index) =>
    isPracticeDone(rows[index][column] ?? '')
      ? [getSongAnchor(song.title, song.originalArtist)]
      : [],
  ));
  return songs.filter((song) => !completed.has(getSongAnchor(song.title, song.originalArtist)));
}
