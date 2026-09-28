import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import LastUpdated from "@/components/last-updated";
import PastEventNavigation from "@/components/past-event-navigation";
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
    <>
      <PastEventNavigation eventSlug={event} />
      {children}
      <Box component="div" aria-label="Event data freshness" sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          {pastEvent.label} archive · {data ? <LastUpdated fetchedAt={data.fetchedAt} /> : "Last updated: unavailable"}
        </Typography>
      </Box>
    </>
  );
}
