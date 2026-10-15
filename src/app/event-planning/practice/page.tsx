import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Paper, Skeleton, Stack, Typography } from '@mui/material';
import PracticeOptions from '@/components/practice-options';
import { getOctober2026Signup } from '@/lib/october-2026-signup-data';
import { buildPracticeSchedule } from '@/lib/practice-groups';
import { octoberAlwaysPresentPerformers } from '@/lib/october-practice';

export const metadata: Metadata = {
  title: 'Practice',
  description: 'Monday and Thursday practice, 7:30–10:00 p.m. at Stage One Studios in Laguna Hills.',
};

export default function PracticePage() {
  return (
    <Stack
      spacing={3}
      id="event-planning-practice-panel"
      role="tabpanel"
      aria-labelledby="event-planning-practice-tab"
    >
      <Paper component="section" variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h2">Stage One Studios</Typography>
        <Typography sx={{ mt: 1 }}>Monday and Thursday · 7:30–10:00 p.m.</Typography>
        <Typography color="textSecondary">
          23092 Terra Dr, Laguna Hills, CA 92653
        </Typography>
        <Typography color="textSecondary" sx={{ mt: 2 }}>
          Compare suggested song groupings for these sessions, excluding songs marked
          Done! Each session has early and late blocks to reduce time spent waiting.
          Song groupings are suggestions, not changes to the set list.
        </Typography>
      </Paper>
      <Suspense fallback={
        <Stack spacing={2} role="status" aria-label="Loading practice options">
          <Skeleton variant="rounded" height={80} />
          <Skeleton variant="rounded" height={320} />
        </Stack>
      }>
        <Practice />
      </Suspense>
    </Stack>
  );
}

async function Practice() {
  const data = await getOctober2026Signup();
  const songs = data?.setList?.practiceSongs;
  if (!songs) {
    return (
      <Paper component="section" variant="outlined" sx={{ p: { xs: 3, sm: 5 } }}>
        <Typography variant="h2">Practice unavailable</Typography>
        <Typography color="textSecondary" sx={{ mt: 1 }}>
          We could not load practice data. The timetable needs one Practice column
          to identify completed songs. Please try again in a little while.
        </Typography>
      </Paper>
    );
  }
  const availabilityByInitials = new Map(data.performers.map(({ initials, practiceAvailability }) =>
    [initials, practiceAvailability ?? null],
  ));
  const alwaysPresentPerformers = octoberAlwaysPresentPerformers(data.performers);
  const alwaysPresentInitials = new Set(alwaysPresentPerformers.map(({ initials }) => initials));
  return (
    <PracticeOptions
      result={buildPracticeSchedule(songs, availabilityByInitials, alwaysPresentInitials, {
        sessionWeeknights: ['Monday', 'Thursday'],
        suggestSwaps: false,
      })}
      alwaysPresentPerformers={alwaysPresentPerformers}
      songsHref="/event-planning/songs"
      sessionTime="7:30–10:00 p.m."
    />
  );
}
