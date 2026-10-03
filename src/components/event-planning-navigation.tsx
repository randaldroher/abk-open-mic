'use client';

import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { Box, Tab, Tabs } from '@mui/material';

const PLANNING_TABS = ['songs', 'performers'] as const;

export default function EventPlanningNavigation() {
  const segment = useSelectedLayoutSegment();

  return (
    <Box
      component="nav"
      aria-label="Event planning navigation"
      sx={{ borderBottom: 1, borderColor: 'divider' }}
    >
      <Tabs
        value={segment === 'performers' ? 'performers' : 'songs'}
        aria-label="Event planning sections"
      >
        {PLANNING_TABS.map((tab) => (
          <Tab
            key={tab}
            component={Link}
            href={`/event-planning/${tab}`}
            prefetch={true}
            value={tab}
            label={tab === 'songs' ? 'Songs' : 'Performers'}
            id={`event-planning-${tab}-tab`}
            aria-controls={`event-planning-${tab}-panel`}
          />
        ))}
      </Tabs>
    </Box>
  );
}
