import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Paper, Skeleton, Stack, Typography } from '@mui/material';
import PracticeOptions from '@/components/practice-options';
import { getOctober2026Signup } from '@/lib/october-2026-signup-data';
import { buildPracticeSchedule } from '@/lib/practice-groups';

export const metadata: Metadata = {
  title: 'Practice',
  description: 'Suggested balanced practice sessions for the October 2026 ABK Open Mic.',
};

export default function PracticePage() {
  return (
    <Stack
      spacing={3}
      id="event-planning-practice-panel"
      role="tabpanel"
      aria-labelledby="event-planning-practice-tab"
    >
      <Typography color="textSecondary">
        Split the songs into two practice sessions, each with about half the songs,
        while keeping as few other assigned performers as possible in both sessions.
        Donald and Randal are assumed to be present throughout. Songs marked
        Done! in the Practice column are excluded. Compare up to five distinct options.
        Known weeknight availability is used to choose session nights and reduce
        conflicts; unspecified availability is not treated as unavailable. Each
        session has early and late blocks. Suggestions also check individual Bass
        or Drums song-assignment swaps.
      </Typography>
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
  return <PracticeOptions result={buildPracticeSchedule(songs, availabilityByInitials)} />;
}
