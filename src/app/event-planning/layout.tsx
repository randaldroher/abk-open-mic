import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { Box, Skeleton, Stack, Typography } from '@mui/material';
import LastUpdated from '@/components/last-updated';
import EventPlanningNavigation from '@/components/event-planning-navigation';
import SiteFrame from '@/components/site-frame';
import { getOctober2026Signup } from '@/lib/october-2026-signup-data';

export const metadata = {
  title: {
    default: 'Event Planning',
    template: '%s | Event Planning | ABK Open Mic',
  },
};

export default function EventPlanningLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SiteFrame
      freshness={
        <Suspense
          fallback={
            <Box role="status" aria-label="Loading last updated time">
              <Skeleton width="min(100%, 360px)" sx={{ mx: 'auto' }} />
            </Box>
          }
        >
          <PlanningFreshness />
        </Suspense>
      }
    >
      <Stack spacing={3}>
        <header>
          <Typography variant="h1">Event Planning</Typography>
          <Typography color="textSecondary" sx={{ mt: 1 }}>
            October 2026 set list, songs, and performer interests. Sign up to
            participate or update your interests.
          </Typography>
        </header>
        <EventPlanningNavigation />
        {children}
      </Stack>
    </SiteFrame>
  );
}

async function PlanningFreshness() {
  const data = await getOctober2026Signup();
  return data ? (
    <LastUpdated fetchedAt={data.fetchedAt} />
  ) : (
    <>
      Last updated:{' '}
      <Box component="span" sx={{ color: 'warning.dark' }}>
        Unavailable
      </Box>
    </>
  );
}
