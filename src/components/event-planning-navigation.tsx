'use client';

import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { Box, Tab, Tabs } from '@mui/material';

const PLANNING_TABS = [
  { slug: 'set-list', label: 'Set List' },
  { slug: 'songs', label: 'Songs' },
  { slug: 'performers', label: 'Performers' },
] as const;

export default function EventPlanningNavigation() {
  const segment = useSelectedLayoutSegment();

  return (
    <Box
      component="nav"
      aria-label="Event planning navigation"
      sx={{ borderBottom: 1, borderColor: 'divider' }}
    >
      <Tabs
        value={
          PLANNING_TABS.some(({ slug }) => slug === segment) ? segment : 'set-list'
        }
        aria-label="Event planning sections"
        variant="scrollable"
        scrollButtons="auto"
      >
        {PLANNING_TABS.map(({ slug, label }) => (
          <Tab
            key={slug}
            component={Link}
            href={`/event-planning/${slug}`}
            prefetch={true}
            value={slug}
            label={label}
            id={`event-planning-${slug}-tab`}
            aria-controls={`event-planning-${slug}-panel`}
          />
        ))}
      </Tabs>
    </Box>
  );
}
