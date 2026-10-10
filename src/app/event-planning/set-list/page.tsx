import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Card, CardContent, Paper, Skeleton, Stack, Typography } from '@mui/material';
import SetListTable from '@/components/set-list-table';
import { getOctober2026Signup } from '@/lib/october-2026-signup-data';

export const metadata: Metadata = {
  title: 'Set List',
  description: 'October 2026 ABK Open Mic song assignments and outstanding performer roles.',
};

export default function SetListPage() {
  return (
    <Stack
      spacing={3}
      id="event-planning-set-list-panel"
      role="tabpanel"
      aria-labelledby="event-planning-set-list-tab"
    >
      <Typography color="textSecondary">
        Songs and performer assignments from the October set list. Select a song
        or artist to see its references and assigned performers.
      </Typography>
      <Suspense fallback={
        <Card variant="outlined" aria-hidden="true">
          <CardContent>
            <Stack spacing={2}>
              {[0, 1, 2, 3, 4].map((row) => (
                <Skeleton key={row} variant="rounded" height={36} />
              ))}
            </Stack>
          </CardContent>
        </Card>
      }>
        <SetList />
      </Suspense>
    </Stack>
  );
}

async function SetList() {
  const data = await getOctober2026Signup();
  if (!data?.setList) {
    return (
      <Paper component="section" variant="outlined" sx={{ p: { xs: 3, sm: 5 } }}>
        <Typography variant="h2">Set List unavailable</Typography>
        <Typography color="textSecondary" sx={{ mt: 1 }}>
          We could not load the set list. Please try again in a little while.
        </Typography>
      </Paper>
    );
  }
  return <SetListTable setList={data.setList} performers={data.performers} />;
}
