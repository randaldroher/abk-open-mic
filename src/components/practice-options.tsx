import Link from 'next/link';
import { Alert, Box, Paper, Stack, Typography } from '@mui/material';
import {
  isAlwaysPresentPracticeAttendee,
  type buildPracticeSchedule,
} from '../lib/practice-groups';
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
        {result.availabilitySearchComplete === undefined
          ? (result.optimal
            ? 'These options minimize the number of other assigned performers attending both sessions.'
            : 'These are the best options found in a bounded search to minimize other assigned performers attending both sessions; a lower-overlap split may exist.')
          : (result.optimal
            ? 'These options minimize known weeknight availability conflicts, then minimize other assigned performers attending both sessions.'
            : 'These options use a bounded search to minimize known weeknight availability conflicts, then other assigned performers attending both sessions.')}
        {' '}Assignments use confirmed set-list roles, not signup interests. Availability conflicts count only known weeknights.
        {' '}Donald and Randal are assumed present throughout and are excluded from overlap and availability-conflict counts.
        {' '}Blank or unrecognized availability is unknown and is not counted as a conflict.
        Each session is split into balanced early and late blocks without changing its song group.
        Unfilled roles are not counted. These are suggestions, not scheduled sessions.
      </Alert>
      {result.availabilitySearchComplete === false && (
        <Alert severity="info">
          Weeknight planning used a bounded search; another availability-aware grouping may be better.
        </Alert>
      )}
      {result.suggestedSwaps.length > 0 && (
        <Stack component="section" spacing={2} aria-labelledby="practice-swaps-heading">
          <Typography variant="h2" id="practice-swaps-heading">Individual song-swap suggestions</Typography>
          <Typography color="textSecondary">
            Each suggestion exchanges one Bass or Drums song assignment between two performers.
            The suggested sessions are re-optimized; your set-list assignments are unchanged.
          </Typography>
          {result.suggestedSwaps.map(({ role, exchanges, overlapReduction, availabilityConflictReduction, sharedPerformers, sessions }, index) => (
            <Paper key={`${role}-${index}`} variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h3">Suggestion {index + 1}: {role} song swap</Typography>
              <Typography sx={{ mt: 1 }}>
                {exchanges[0].performer.name} swaps “{exchanges[0].song.title}” with
                {' '}{exchanges[1].performer.name}’s “{exchanges[1].song.title}”.
              </Typography>
              <Typography sx={{ mt: 1 }}>
                {availabilityConflictReduction > 0
                  ? `This reduces known availability conflicts by ${availabilityConflictReduction}. `
                  : 'This keeps known availability conflicts unchanged. '}
                {overlapReduction > 0
                  ? `It also reduces shared attendance by ${overlapReduction}. `
                  : ''}
                After the swap, {sharedPerformers.length} other assigned
                {' '}{sharedPerformers.length === 1 ? 'performer attends' : 'performers attend'} both sessions:
                {' '}{sharedPerformers.map(({ name }) => name).join(', ') || 'None'}.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                {sessions.map(({ blocks, weeknight, unavailablePerformers }, session) => (
                  <Box component="section" key={session} sx={{ flex: 1 }}>
                    <Typography variant="h4">
                      Session {session + 1}{weeknight ? ` · ${weeknight} night` : ''}
                    </Typography>
                    {unavailablePerformers && unavailablePerformers.length > 0 && (
                      <Typography color="warning.main" variant="body2">
                        Known unavailable attendees: {unavailablePerformers.map(({ name }) => name).join(', ')}
                      </Typography>
                    )}
                    {blocks.map((songs, block) => (
                      <Box key={block} sx={{ mt: 1 }}>
                        <Typography variant="subtitle2">{block === 0 ? 'Early' : 'Late'}</Typography>
                        <Box component="ul" sx={{ pl: 3, my: 0 }}>
                          {songs.map((song) => (
                            <li key={getSongAnchor(song.title, song.originalArtist)}>
                              <Link href={`/event-planning/songs#${encodeURIComponent(getSongAnchor(song.title, song.originalArtist))}`}>
                                {song.title}{song.originalArtist ? ` — ${song.originalArtist}` : ''}
                              </Link>
                            </li>
                          ))}
                        </Box>
                        <Typography variant="body2" color="textSecondary">
                          Attendees: {attendees(songs).map(({ name }) => name).join(', ') || 'No assigned performers'}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ))}
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
      {!result.swapSearchComplete && (
        <Alert severity="info">
          Swap search was bounded; additional improving assignment exchanges may exist.
        </Alert>
      )}
      {result.swapSearchComplete && result.suggestedSwaps.length === 0 && (
        <Alert severity="info">
          No individual Bass or Drums song swap improved the availability and shared-attendance plan.
        </Alert>
      )}
      {result.options.map(({ groups, sharedPerformers, sessions }, index) => (
        <Paper
          key={index}
          component="details"
          open={index === 0}
          variant="outlined"
          sx={{ p: { xs: 2, sm: 3 } }}
        >
          <Box component="summary" sx={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem' }}>
            Option {index + 1}: {sharedPerformers.length} other {sharedPerformers.length === 1 ? 'performer' : 'performers'} in both sessions
          </Box>
          <Typography sx={{ my: 2 }}>
            Other assigned performers in both sessions: {sharedPerformers.map(({ name }) => name).join(', ') || 'None'}
          </Typography>
          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' } }}>
            {groups.map((songs, session) => {
              const people = attendees(songs);
              const {
                blocks,
                sharedPerformers: bothHalves,
                optimal,
                weeknight,
                unavailablePerformers,
              } = sessions[session];
              const sharedInitials = new Set(bothHalves.map(({ initials }) => initials));
              const earlyOnly = attendees(blocks[0]).filter(({ initials, name }) =>
                !sharedInitials.has(initials) && !isAlwaysPresentPracticeAttendee(name),
              );
              const lateOnly = attendees(blocks[1]).filter(({ initials, name }) =>
                !sharedInitials.has(initials) && !isAlwaysPresentPracticeAttendee(name),
              );
              return (
                <Box component="section" key={session} aria-labelledby={`practice-${index}-${session}-heading`}>
                  <Typography variant="h3" id={`practice-${index}-${session}-heading`}>
                    Session {session + 1}{weeknight ? ` · ${weeknight} night` : ''}
                  </Typography>
                  <Typography sx={{ mt: 1 }}>
                    {songs.length} {songs.length === 1 ? 'song' : 'songs'} · {people.length} {people.length === 1 ? 'performer' : 'performers'}
                  </Typography>
                  {unavailablePerformers && (
                    <Typography
                      color={unavailablePerformers.length ? 'warning.main' : 'textSecondary'}
                      variant="body2"
                      sx={{ mt: 1 }}
                    >
                      Known unavailable: {unavailablePerformers.map(({ name }) => name).join(', ') || 'None'}
                    </Typography>
                  )}
                  <Typography color="textSecondary" sx={{ mt: 1 }}>
                    Attendees: {people.map(({ name }) => name).join(', ') || 'No assigned performers'}
                  </Typography>
                  <Stack spacing={1} sx={{ my: 2 }}>
                    <Typography>
                      Other assigned performers in both halves ({bothHalves.length}): {bothHalves.map(({ name }) => name).join(', ') || 'None'}
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
                                <Link href={`/event-planning/songs#${encodeURIComponent(getSongAnchor(song.title, song.originalArtist))}`}>
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
