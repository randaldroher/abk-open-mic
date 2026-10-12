import Link from 'next/link';
import { Alert, Box, Paper, Stack, Typography } from '@mui/material';
import type { buildPracticeSchedule } from '../lib/practice-groups';
import { getSongAnchor, type SetListSong } from '../lib/october-set-list';

function attendees(songs: SetListSong[]) {
  return [...new Map(songs.flatMap(({ roles }) =>
    roles.flatMap(({ performers }) => performers.map((performer) =>
      [performer.initials, performer] as const,
    )),
  )).values()].sort((a, b) => a.name.localeCompare(b.name) || a.initials.localeCompare(b.initials));
}

export default function PracticeOptions({
  result,
}: {
  result: ReturnType<typeof buildPracticeSchedule>;
}) {
  if (!result.options.length) {
    return <Alert severity="success">No songs remain to practice. All set-list songs are marked Done!</Alert>;
  }
  return (
    <Stack spacing={3}>
      <Alert severity="info">
        {result.optimal
          ? 'These options minimize the number of assigned performers attending both sessions.'
          : 'These are the best options found in a bounded search; a lower-overlap split may exist.'}
        {' '}Counts use confirmed set-list assignments, not signup interests or availability.
        Each session is then split into balanced early and late blocks to minimize
        performers needed for both halves, without changing the two practice groups.
        Unfilled roles are not counted. These are suggestions, not scheduled sessions.
      </Alert>
      {result.options.map(({ groups, sharedPerformers, sessions }, index) => (
        <Paper
          key={index}
          component="details"
          open={index === 0}
          variant="outlined"
          sx={{ p: { xs: 2, sm: 3 } }}
        >
          <Box component="summary" sx={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem' }}>
            Option {index + 1}: {sharedPerformers.length} {sharedPerformers.length === 1 ? 'performer' : 'performers'} in both sessions
          </Box>
          <Typography sx={{ my: 2 }}>
            Both sessions: {sharedPerformers.map(({ name }) => name).join(', ') || 'None'}
          </Typography>
          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' } }}>
            {groups.map((songs, session) => {
              const people = attendees(songs);
              const { blocks, sharedPerformers: bothHalves, optimal } = sessions[session];
              const sharedInitials = new Set(bothHalves.map(({ initials }) => initials));
              const earlyOnly = attendees(blocks[0]).filter(({ initials }) => !sharedInitials.has(initials));
              const lateOnly = attendees(blocks[1]).filter(({ initials }) => !sharedInitials.has(initials));
              return (
                <Box component="section" key={session} aria-labelledby={`practice-${index}-${session}-heading`}>
                  <Typography variant="h3" id={`practice-${index}-${session}-heading`}>
                    Session {session + 1}
                  </Typography>
                  <Typography sx={{ mt: 1 }}>
                    {songs.length} {songs.length === 1 ? 'song' : 'songs'} · {people.length} {people.length === 1 ? 'performer' : 'performers'}
                  </Typography>
                  <Typography color="textSecondary" sx={{ mt: 1 }}>
                    Attendees: {people.map(({ name }) => name).join(', ') || 'No assigned performers'}
                  </Typography>
                  <Stack spacing={1} sx={{ my: 2 }}>
                    <Typography>
                      Both halves ({bothHalves.length}): {bothHalves.map(({ name }) => name).join(', ') || 'None'}
                    </Typography>
                    <Typography color="textSecondary">
                      Early only (can leave after the early block): {earlyOnly.map(({ name }) => name).join(', ') || 'None'}
                    </Typography>
                    <Typography color="textSecondary">
                      Late only (can arrive for the late block): {lateOnly.map(({ name }) => name).join(', ') || 'None'}
                    </Typography>
                  </Stack>
                  {!optimal && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      This early/late split uses bounded search; fewer performers may need both halves.
                    </Alert>
                  )}
                  {!songs.length && <Typography color="textSecondary">No songs in this session.</Typography>}
                  {blocks.map((blockSongs, block) => {
                    const blockPeople = attendees(blockSongs);
                    const label = block === 0 ? 'Early' : 'Late';
                    const heading = `practice-${index}-${session}-${block}-heading`;
                    return (
                      <Box component="section" key={block} aria-labelledby={heading} sx={{ mt: 2 }}>
                        <Typography variant="h3" component="h4" id={heading}>{label}</Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {blockSongs.length} {blockSongs.length === 1 ? 'song' : 'songs'} · {blockPeople.length} {blockPeople.length === 1 ? 'performer' : 'performers'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                          Attendees: {blockPeople.map(({ name }) => name).join(', ') || 'No assigned performers'}
                        </Typography>
                        {blockSongs.length ? (
                          <Box component="ul" sx={{ pl: 3, '& li': { my: 1 } }}>
                            {blockSongs.map((song) => (
                              <li key={getSongAnchor(song.title, song.originalArtist)}>
                                <Link href={`/event-planning/songs#${getSongAnchor(song.title, song.originalArtist)}`}>
                                  {song.title}{song.originalArtist ? ` — ${song.originalArtist}` : ''}
                                </Link>
                                <Typography variant="body2" color="textSecondary">
                                  {attendees([song]).map(({ name }) => name).join(', ') || 'No assigned performers'}
                                </Typography>
                              </li>
                            ))}
                          </Box>
                        ) : <Typography color="textSecondary" sx={{ mt: 1 }}>No songs in this {label.toLowerCase()} block.</Typography>}
                      </Box>
                    );
                  })}
                </Box>
              );
            })}
          </Box>
        </Paper>
      ))}
    </Stack>
  );
}
