import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import {
  OCTOBER_PRACTICE_SLOT_SCHEDULE,
  octoberPracticeCalendarUrl,
} from '../lib/october-practice';
import {
  getSongAnchor,
  OCTOBER_PRACTICE_DAYS,
  OCTOBER_PRACTICE_SLOTS,
  type OctoberPracticeSession,
  type SetListSong,
} from '../lib/october-set-list';
import {
  type buildPracticeSchedule,
  type PracticePerformer,
} from '../lib/practice-groups';

const WEEKDAY_ORDER = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

function attendees(songs: SetListSong[]) {
  return [
    ...new Map(
      songs.flatMap(({ roles }) =>
        roles.flatMap(({ performers }) =>
          performers.map(
            (performer) => [performer.initials, performer] as const,
          ),
        ),
      ),
    ).values(),
  ].sort(
    (a, b) =>
      a.name.localeCompare(b.name) || a.initials.localeCompare(b.initials),
  );
}

function SongReferences({
  songs,
  songsHref,
}: {
  songs: SetListSong[];
  songsHref: string;
}) {
  return (
    <Box
      component="ul"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
        gap: { xs: 0, md: 2 },
        pl: 3,
        my: 1,
        '& li': { my: 1, minWidth: 0 },
        overflowWrap: 'anywhere',
      }}
    >
      {songs.map((song) => (
        <li key={getSongAnchor(song.title, song.originalArtist)}>
          <Link
            href={`${songsHref}#${encodeURIComponent(getSongAnchor(song.title, song.originalArtist))}`}
          >
            {song.title}
            {song.originalArtist ? ` — ${song.originalArtist}` : ''}
          </Link>
          <Typography variant="body2" color="textSecondary">
            {attendees([song])
              .map(({ name }) => name)
              .join(', ') || 'No assigned performers'}
          </Typography>
        </li>
      ))}
    </Box>
  );
}

function ScheduledSessionCards({
  sessions,
  songsHref,
}: {
  sessions: OctoberPracticeSession[] | null;
  songsHref: string;
}) {
  const cards =
    sessions ??
    OCTOBER_PRACTICE_DAYS.flatMap((day) =>
      OCTOBER_PRACTICE_SLOTS.map((slot) => ({ day, slot, songs: [] })),
    );

  return (
    <Stack
      component="section"
      spacing={2}
      aria-labelledby="scheduled-practice-heading"
    >
      <Typography variant="h4" component="h2" id="scheduled-practice-heading">
        Scheduled sessions
      </Typography>
      {sessions === null && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Practice assignments are unavailable. The Practice column needs a day,
          Early or Late slot, and Low, Medium, or High difficulty.
        </Alert>
      )}
      <Stack spacing={2}>
        {cards.map(({ day, slot, songs }) => {
          return (
            <Paper
              key={`${day}-${slot}`}
              component="section"
              variant="outlined"
              sx={{ minWidth: 0, p: { xs: 2, sm: 3 } }}
            >
              <Typography variant="h6" component="h3">
                {day} · {slot} session
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: 'wrap', alignItems: 'baseline' }}
              >
                <Typography variant="body1" color="textSecondary">
                  {OCTOBER_PRACTICE_SLOT_SCHEDULE[slot].label}
                  <Button
                    variant="text"
                    color="secondary"
                    size="small"
                    href={octoberPracticeCalendarUrl(day, slot)}
                    download
                  >
                    Add to calendar
                  </Button>
                </Typography>
              </Stack>
              {sessions !== null && (
                <Typography variant="body1" color="textPrimary">
                  {attendees(songs)
                    .map(({ name }) => name)
                    .join(', ') || 'No assigned performers'}
                </Typography>
              )}
              {sessions === null ? (
                <Typography color="textSecondary" sx={{ mt: 1 }}>
                  Schedule assignments unavailable.
                </Typography>
              ) : (
                <>
                  {songs.length ? (
                    <SongReferences songs={songs} songsHref={songsHref} />
                  ) : (
                    <Typography color="textSecondary" sx={{ mt: 1 }}>
                      No songs assigned.
                    </Typography>
                  )}
                </>
              )}
            </Paper>
          );
        })}
      </Stack>
    </Stack>
  );
}

export default function PracticeOptions({
  result,
  alwaysPresentPerformers = [],
  scheduledSessions,
  songsHref = '/event-planning/songs',
  sessionTime,
}: {
  result: ReturnType<typeof buildPracticeSchedule>;
  alwaysPresentPerformers?: PracticePerformer[];
  scheduledSessions?: OctoberPracticeSession[] | null;
  songsHref?: string;
  sessionTime?: string;
}) {
  const alwaysPresentInitials = new Set(
    alwaysPresentPerformers.map(({ initials }) => initials),
  );
  const scheduledCards =
    scheduledSessions === undefined ? null : (
      <ScheduledSessionCards
        sessions={scheduledSessions}
        songsHref={songsHref}
      />
    );
  if (!result.options.length) {
    return (
      <Stack spacing={3}>
        {scheduledCards}
        <Alert severity="success">
          No songs remain to practice. All set-list songs are marked Done!
        </Alert>
      </Stack>
    );
  }
  return (
    <Stack spacing={3}>
      {scheduledCards}
      <Typography variant="h4" component="h2">
        Other Options
      </Typography>
      <Box component="details">
        <Box component="summary" sx={{ cursor: 'pointer', fontWeight: 'bold' }}>
          How these suggestions work
        </Box>
        <Box component="ul" sx={{ pl: 3, '& li': { my: 1 } }}>
          <li>
            Only assigned set-list performers count, not signup interests or
            unfilled roles.
          </li>
          <li>
            Unknown availability is not counted as a conflict. Song groupings
            are suggestions.
          </li>
          {alwaysPresentPerformers.length > 0 && (
            <li>
              {alwaysPresentPerformers.map(({ name }) => name).join(' and ')}
              {alwaysPresentPerformers.length === 1 ? ' is' : ' are'} assumed
              present throughout and excluded from shared-attendance and
              availability-conflict counts.
            </li>
          )}
          <li>
            Each session is split independently into balanced Block A and Block
            B groups. The labels do not imply a time order.
          </li>
          <li>
            Up to five options are shown. Large song lists use a limited search
            and may not be optimal.
          </li>
        </Box>
      </Box>
      {result.options.map(({ groups, sharedPerformers, sessions }, index) => {
        const sessionOrder = sessions
          .map((_, session) => session)
          .sort((left, right) => {
            const leftDay = WEEKDAY_ORDER.indexOf(
              sessions[left].weeknight ?? '',
            );
            const rightDay = WEEKDAY_ORDER.indexOf(
              sessions[right].weeknight ?? '',
            );
            return (
              (leftDay < 0 ? Infinity : leftDay) -
                (rightDay < 0 ? Infinity : rightDay) || left - right
            );
          });
        return (
          <Paper
            key={index}
            component="details"
            variant="outlined"
            sx={{ p: { xs: 2, sm: 3 } }}
          >
            <Box
              component="summary"
              sx={{
                cursor: 'pointer',
                overflowWrap: 'anywhere',
                '&:focus-visible': {
                  outline: '3px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: 4,
                },
              }}
            >
              <Typography
                variant="h5"
                component="h2"
                sx={{ display: 'inline', fontWeight: 700 }}
              >
                Option {index + 1}
              </Typography>
              <Typography
                component="span"
                variant="body2"
                color="textSecondary"
                sx={{ ml: 1 }}
              >
                · {sharedPerformers.length} shared{' '}
                {sharedPerformers.length === 1 ? 'performer' : 'performers'}
              </Typography>
            </Box>
            <Typography sx={{ my: 2 }}>
              Needed at both sessions:{' '}
              {sharedPerformers.map(({ name }) => name).join(', ') || 'None'}
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gap: 3,
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(2, minmax(0, 1fr))',
                },
                overflowWrap: 'anywhere',
              }}
            >
              {sessionOrder.map((session, displayIndex) => {
                const songs = groups[session];
                const people = attendees(songs);
                const {
                  blocks,
                  sharedPerformers: bothHalves,
                  optimal,
                  weeknight,
                  unavailablePerformers,
                } = sessions[session];
                const sharedInitials = new Set(
                  bothHalves.map(({ initials }) => initials),
                );
                const blockAOnly = attendees(blocks[0]).filter(
                  ({ initials }) =>
                    !sharedInitials.has(initials) &&
                    !alwaysPresentInitials.has(initials),
                );
                const blockBOnly = attendees(blocks[1]).filter(
                  ({ initials }) =>
                    !sharedInitials.has(initials) &&
                    !alwaysPresentInitials.has(initials),
                );
                return (
                  <Box
                    component="section"
                    key={session}
                    aria-labelledby={`practice-${index}-${session}-heading`}
                    sx={{
                      minWidth: 0,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      p: { xs: 2, sm: 3 },
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="h3"
                      id={`practice-${index}-${session}-heading`}
                    >
                      Session {displayIndex + 1}
                      {weeknight ? ` · ${weeknight} night` : ''}
                    </Typography>
                    {sessionTime && (
                      <Typography variant="body2">{sessionTime}</Typography>
                    )}
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {songs.length} {songs.length === 1 ? 'song' : 'songs'} ·{' '}
                      {people.length}{' '}
                      {people.length === 1 ? 'performer' : 'performers'}
                    </Typography>
                    {unavailablePerformers && (
                      <Typography
                        color={
                          unavailablePerformers.length
                            ? 'warning.main'
                            : 'textSecondary'
                        }
                        variant="body2"
                        sx={{ mt: 1 }}
                      >
                        Known unavailable:{' '}
                        {unavailablePerformers
                          .map(({ name }) => name)
                          .join(', ') || 'None'}
                      </Typography>
                    )}
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mt: 1 }}
                    >
                      Attendees:{' '}
                      {people.map(({ name }) => name).join(', ') ||
                        'No assigned performers'}
                    </Typography>
                    <Stack spacing={1} sx={{ my: 2 }}>
                      <Typography variant="body2">
                        Needed for both blocks ({bothHalves.length}):{' '}
                        {bothHalves.map(({ name }) => name).join(', ') ||
                          'None'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Block A only:{' '}
                        {blockAOnly.map(({ name }) => name).join(', ') ||
                          'None'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Block B only:{' '}
                        {blockBOnly.map(({ name }) => name).join(', ') ||
                          'None'}
                      </Typography>
                    </Stack>
                    {!optimal && (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        This A/B split uses bounded search; fewer performers may
                        need both blocks.
                      </Alert>
                    )}
                    {!songs.length && (
                      <Typography color="textSecondary">
                        No songs in this session.
                      </Typography>
                    )}
                    {blocks.map((blockSongs, block) => {
                      const blockPeople = attendees(blockSongs);
                      const label = block === 0 ? 'Block A' : 'Block B';
                      const heading = `practice-${index}-${session}-${block}-heading`;
                      return (
                        <Box
                          component="section"
                          key={block}
                          aria-labelledby={heading}
                          sx={{
                            mt: 2,
                            p: 2,
                            bgcolor: 'background.default',
                            borderLeft: 3,
                            borderColor: 'divider',
                            borderRadius: 1,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            component="h4"
                            id={heading}
                            sx={{ fontWeight: 700 }}
                          >
                            {label}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {blockSongs.length}{' '}
                            {blockSongs.length === 1 ? 'song' : 'songs'} ·{' '}
                            {blockPeople.length}{' '}
                            {blockPeople.length === 1
                              ? 'performer'
                              : 'performers'}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{ mt: 1 }}
                          >
                            Attendees:{' '}
                            {blockPeople.map(({ name }) => name).join(', ') ||
                              'No assigned performers'}
                          </Typography>
                          {blockSongs.length ? (
                            <SongReferences
                              songs={blockSongs}
                              songsHref={songsHref}
                            />
                          ) : (
                            <Typography color="textSecondary" sx={{ mt: 1 }}>
                              No songs in {label}.
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                );
              })}
            </Box>
          </Paper>
        );
      })}
    </Stack>
  );
}
