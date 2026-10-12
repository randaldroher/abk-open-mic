import Link from 'next/link';
import { Alert, Box, Paper, Stack, Typography } from '@mui/material';
import {
  type buildPracticeSchedule,
  type PracticePerformer,
} from '../lib/practice-groups';
import { getSongAnchor, type SetListSong } from '../lib/october-set-list';

function attendees(songs: SetListSong[]) {
  return [...new Map(songs.flatMap(({ roles }) =>
    roles.flatMap(({ performers }) => performers.map((performer) =>
      [performer.initials, performer] as const,
    )),
  )).values()].sort((a, b) => a.name.localeCompare(b.name) || a.initials.localeCompare(b.initials));
}

function SongReferences({ songs, songsHref }: { songs: SetListSong[]; songsHref: string }) {
  return (
    <Box component="ul" sx={{ pl: 3, my: 1, '& li': { my: 1 }, overflowWrap: 'anywhere' }}>
      {songs.map((song) => (
        <li key={getSongAnchor(song.title, song.originalArtist)}>
          <Link href={`${songsHref}#${encodeURIComponent(getSongAnchor(song.title, song.originalArtist))}`}>
            {song.title}{song.originalArtist ? ` — ${song.originalArtist}` : ''}
          </Link>
          <Typography variant="body2" color="textSecondary">
            {attendees([song]).map(({ name }) => name).join(', ') || 'No assigned performers'}
          </Typography>
        </li>
      ))}
    </Box>
  );
}

export default function PracticeOptions({
  result,
  alwaysPresentPerformers = [],
  songsHref = '/event-planning/songs',
}: {
  result: ReturnType<typeof buildPracticeSchedule>;
  alwaysPresentPerformers?: PracticePerformer[];
  songsHref?: string;
}) {
  const alwaysPresentInitials = new Set(alwaysPresentPerformers.map(({ initials }) => initials));
  if (!result.options.length) {
    return <Alert severity="success">No songs remain to practice. All set-list songs are marked Done!</Alert>;
  }
  return (
    <Stack spacing={3}>
      <Alert severity="info">
        {result.availabilitySearchComplete === undefined
          ? (result.optimal
            ? 'These options minimize shared attendance between two balanced sessions.'
            : 'These are the best balanced options found; a lower-overlap split may exist.')
          : (result.optimal
            ? 'These options prioritize known availability conflicts, then shared attendance.'
            : 'These are the best availability-aware options found; a better grouping may exist.')}
      </Alert>
      <Box component="details">
        <Box component="summary" sx={{ cursor: 'pointer', fontWeight: 'bold' }}>
          How these suggestions work
        </Box>
        <Box component="ul" sx={{ pl: 3, '& li': { my: 1 } }}>
          <li>Only assigned set-list performers count, not signup interests or unfilled roles.</li>
          <li>Unknown availability is not counted as a conflict. Suggested nights are not confirmed dates.</li>
          {alwaysPresentPerformers.length > 0 && (
            <li>
             {alwaysPresentPerformers.map(({ name }) => name).join(' and ')}
             {alwaysPresentPerformers.length === 1 ? ' is' : ' are'} assumed present
             throughout and excluded from shared-attendance and availability-conflict counts.
            </li>
          )}
          <li>Each session is split independently into balanced early and late blocks.</li>
          <li>Up to five options are shown. Large song lists use a limited search and may not be optimal.</li>
        </Box>
      </Box>
      {result.suggestedSwaps.length > 0 && (
        <Box component="details">
          <Box component="summary" sx={{ cursor: 'pointer', fontWeight: 'bold' }}>
            Assignment swap suggestions ({result.suggestedSwaps.length})
          </Box>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Typography color="textSecondary" variant="body2">
              Each suggestion exchanges one Bass or Drums song assignment between two performers.
              The suggested sessions are re-optimized; your set-list assignments are unchanged.
            </Typography>
            {result.suggestedSwaps.map(({ role, exchanges, overlapReduction, availabilityConflictReduction, sharedPerformers, sessions }, index) => (
              <Paper key={`${role}-${index}`} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, overflowWrap: 'anywhere' }}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>Suggestion {index + 1}: {role} song swap</Typography>
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
                  After the swap, {sharedPerformers.length} assigned
                  {' '}{sharedPerformers.length === 1 ? 'performer attends' : 'performers attend'} both sessions:
                  {' '}{sharedPerformers.map(({ name }) => name).join(', ') || 'None'}.
                </Typography>
                <Box sx={{ display: 'grid', gap: 2, mt: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' } }}>
                  {sessions.map(({ blocks, weeknight, unavailablePerformers }, session) => (
                    <Box component="section" key={session} sx={{ minWidth: 0, border: 1, borderColor: 'divider', borderRadius: 2, p: 2 }}>
                      <Typography variant="h6" component="h3">
                        Session {session + 1}{weeknight ? ` · ${weeknight} night` : ''}
                      </Typography>
                      {unavailablePerformers && unavailablePerformers.length > 0 && (
                        <Typography color="warning.main" variant="body2">
                         Known unavailable attendees: {unavailablePerformers.map(({ name }) => name).join(', ')}
                        </Typography>
                      )}
                      {blocks.map((songs, block) => (
                        <Box key={block} sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderLeft: 3, borderColor: 'divider', borderRadius: 1 }}>
                         <Typography variant="subtitle1" component="h4" sx={{ fontWeight: 700 }}>{block === 0 ? 'Early' : 'Late'} block</Typography>
                         {songs.length
                           ? <SongReferences songs={songs} songsHref={songsHref} />
                           : <Typography variant="body2">No songs in this block.</Typography>}
                         <Typography variant="body2" color="textSecondary">
                           Attendees: {attendees(songs).map(({ name }) => name).join(', ') || 'No assigned performers'}
                         </Typography>
                        </Box>
                      ))}
                    </Box>
                  ))}
                </Box>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}
      {!result.swapSearchComplete && (
        <Alert severity="info">
          Swap search was bounded; additional improving assignment exchanges may exist.
        </Alert>
      )}
      {result.swapSearchComplete && result.suggestedSwaps.length === 0 && (
        <Alert severity="info">
          No improving Bass or Drums assignment swap was found.
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
          <Box component="summary" sx={{ cursor: 'pointer', overflowWrap: 'anywhere', '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.main', outlineOffset: 4 } }}>
            <Typography variant="h5" component="h2" sx={{ display: 'inline', fontWeight: 700 }}>
              Option {index + 1}
            </Typography>
            <Typography component="span" variant="body2" color="textSecondary" sx={{ ml: 1 }}>
              · {sharedPerformers.length} shared {sharedPerformers.length === 1 ? 'performer' : 'performers'}
            </Typography>
          </Box>
          <Typography sx={{ my: 2 }}>
            Needed at both sessions: {sharedPerformers.map(({ name }) => name).join(', ') || 'None'}
          </Typography>
          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, overflowWrap: 'anywhere' }}>
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
              const earlyOnly = attendees(blocks[0]).filter(({ initials }) =>
                !sharedInitials.has(initials) && !alwaysPresentInitials.has(initials),
              );
              const lateOnly = attendees(blocks[1]).filter(({ initials }) =>
                !sharedInitials.has(initials) && !alwaysPresentInitials.has(initials),
              );
              return (
                <Box component="section" key={session} aria-labelledby={`practice-${index}-${session}-heading`} sx={{ minWidth: 0, border: 1, borderColor: 'divider', borderRadius: 2, p: { xs: 2, sm: 3 } }}>
                  <Typography variant="h6" component="h3" id={`practice-${index}-${session}-heading`}>
                    Session {session + 1}{weeknight ? ` · ${weeknight} night` : ''}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
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
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Attendees: {people.map(({ name }) => name).join(', ') || 'No assigned performers'}
                  </Typography>
                  <Stack spacing={1} sx={{ my: 2 }}>
                    <Typography variant="body2">
                      Needed for both blocks ({bothHalves.length}): {bothHalves.map(({ name }) => name).join(', ') || 'None'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Early only (can leave after this block): {earlyOnly.map(({ name }) => name).join(', ') || 'None'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Late only (can arrive later): {lateOnly.map(({ name }) => name).join(', ') || 'None'}
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
                      <Box component="section" key={block} aria-labelledby={heading} sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderLeft: 3, borderColor: 'divider', borderRadius: 1 }}>
                        <Typography variant="subtitle1" component="h4" id={heading} sx={{ fontWeight: 700 }}>{label} block</Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {blockSongs.length} {blockSongs.length === 1 ? 'song' : 'songs'} · {blockPeople.length} {blockPeople.length === 1 ? 'performer' : 'performers'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                          Attendees: {blockPeople.map(({ name }) => name).join(', ') || 'No assigned performers'}
                        </Typography>
                        {blockSongs.length ? (
                          <SongReferences songs={blockSongs} songsHref={songsHref} />
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
