"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { Box, Tab, Tabs } from "@mui/material";

export default function PastEventNavigation({ eventSlug }: { eventSlug: string }) {
  const segment = useSelectedLayoutSegment();

  return (
    <Box
      component="nav"
      aria-label="Event navigation"
      sx={{ borderBottom: 1, borderColor: 'divider' }}
    >
      <Tabs
        value={segment === 'songs' ? 'songs' : 'videos'}
        aria-label="Event sections"
      >
        {['videos', 'songs'].map((tab) => (
          <Tab
            key={tab}
            component={Link}
            href={`/past-events/${eventSlug}/${tab}`}
            prefetch={true}
            value={tab}
            label={tab === 'videos' ? 'Videos' : 'Songs'}
            id={`event-${tab}-tab`}
            aria-controls={`event-${tab}-panel`}
          />
        ))}
      </Tabs>
    </Box>
  );
}
