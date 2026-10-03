import type { Metadata } from 'next';
import { Card, CardContent, Skeleton, Stack, Typography } from '@mui/material';
import { Suspense } from 'react';
import ProgramUnavailable from '@/components/program-unavailable';
import PerformersTable from '@/components/performers-table';
import { getOctober2026Signup } from '@/lib/october-2026-signup-data';
import {
  songsInterestedByPerformer,
  sortPerformersByInitials,
} from '@/lib/october-signup';

export const metadata: Metadata = {
  title: 'Performers',
  description:
    'Performer names, genres, role interests, and proposed songs for the October 2026 ABK Open Mic.',
};

export default function PerformersPage() {
  return (
    <Stack spacing={3}>
      <Typography color="textSecondary">
        Performer names, entered genres, self-reported role interests, and
        proposed songs of interest. This is not a confirmed lineup.
      </Typography>
      <Suspense fallback={<PerformerSkeleton />}>
        <PerformerList />
      </Suspense>
    </Stack>
  );
}

function PerformerSkeleton() {
  return (
    <Card aria-hidden="true" variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          {[0, 1, 2, 3, 4].map((item) => (
            <Skeleton key={item} variant="rounded" height={36} />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

async function PerformerList() {
  const data = await getOctober2026Signup();
  if (!data) {
    return <ProgramUnavailable />;
  }

  return (
    <PerformersTable
      performers={sortPerformersByInitials(data.performers).map((performer) => ({
        ...performer,
        songs: songsInterestedByPerformer(data.songs, performer.initials),
      }))}
    />
  );
}
