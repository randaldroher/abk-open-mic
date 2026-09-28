import type { ReactNode } from "react";
import { Suspense } from "react";
import { Box, Skeleton, Stack, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import PageBreadcrumbs from "@/components/page-breadcrumbs";
import PastEventNavigation from "@/components/past-event-navigation";
import SiteFrame from "@/components/site-frame";
import LastUpdated from "@/components/last-updated";
import { getMay2026Program } from "@/lib/may-2026-program-data";
import { getDecember2025Songs, getJuly2025Songs } from "@/lib/past-event-song-data";
import { getPastEvent, PAST_EVENTS } from "@/lib/past-events";

type Props = {
  children: ReactNode;
  params: Promise<{ event: string }>;
};

export function generateStaticParams() {
  return PAST_EVENTS.map(({ slug }) => ({ event: slug }));
}

async function EventFreshness({ event }: { event: string }) {
  const data = event === "may-2026"
    ? await getMay2026Program()
    : event === "july-2025"
      ? await getJuly2025Songs()
      : await getDecember2025Songs();

  return data ? <LastUpdated fetchedAt={data.fetchedAt} /> : "Last updated: unavailable";
}

export default async function PastEventLayout({ children, params }: Props) {
  const { event } = await params;
  const pastEvent = getPastEvent(event);
  if (!pastEvent) {
    notFound();
  }

  return (
    <SiteFrame freshness={
      <Suspense fallback={
        <Box role="status" aria-label="Loading last updated time">
          <Skeleton width="min(100%, 360px)" sx={{ mx: "auto" }} />
        </Box>
      }>
        <EventFreshness event={event} />
      </Suspense>
    }>
      <Stack spacing={3}>
        <Box component="header">
          <PageBreadcrumbs items={[
            { label: "Home", href: "/" },
            { label: "Past events", href: "/past-events" },
            { label: pastEvent.label },
          ]} />
          <Typography variant="h1">ABK Open Mic {pastEvent.label}</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Revisit the music and musicians from {pastEvent.label}.
          </Typography>
        </Box>
        <PastEventNavigation eventSlug={event} />
        {children}
      </Stack>
    </SiteFrame>
  );
}
