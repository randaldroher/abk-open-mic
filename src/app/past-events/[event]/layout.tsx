import type { ReactNode } from "react";
import { Suspense } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import PageBreadcrumbs from "@/components/page-breadcrumbs";
import PastEventNavigation from "@/components/past-event-navigation";
import SiteFrame from "@/components/site-frame";
import { getMay2026Program } from "@/lib/may-2026-program-data";
import { getDecember2025Songs, getJuly2025Songs } from "@/lib/past-event-song-data";
import { getPastEvent } from "@/lib/past-events";

type Props = {
  children: ReactNode;
  params: Promise<{ event: string }>;
};

export default async function PastEventLayout({ children, params }: Props) {
  const { event } = await params;
  const pastEvent = getPastEvent(event);
  if (!pastEvent) {
    notFound();
  }

  const data = event === "may-2026"
    ? await getMay2026Program()
    : event === "july-2025"
      ? await getJuly2025Songs()
      : await getDecember2025Songs();

  return (
    <SiteFrame fetchedAt={data ? data.fetchedAt : null}>
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
        <Suspense>
          <PastEventNavigation eventSlug={event} />
        </Suspense>
        {children}
      </Stack>
    </SiteFrame>
  );
}
