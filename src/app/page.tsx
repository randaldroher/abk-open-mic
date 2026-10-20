import type { Metadata } from "next";
import { Caveat, Cinzel, Permanent_Marker } from 'next/font/google';
import { Box, Button, Stack, Typography } from '@mui/material';
import PastEventCards from "@/components/past-event-cards";
import EventPlanningCards from '@/components/event-planning-cards';
import OctoberHero from '@/components/october-hero';
import SiteFrame from "@/components/site-frame";

const heroMarkerFont = Permanent_Marker({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-hero-marker',
});

const heroScriptFont = Caveat({
  subsets: ['latin'],
  weight: '700',
  variable: '--font-hero-script',
});

const heroSerifFont = Cinzel({
  subsets: ['latin'],
  weight: '600',
  variable: '--font-hero-serif',
});

export const metadata: Metadata = {
  title: "Spooky Edition on October 25",
  description: "Join us Sunday, October 25, 6:00–7:30 PM at the Blizzard Theater on the Blizzard Irvine campus.",
};

export default function Home() {
  return (
    <SiteFrame
      top={
        <OctoberHero
          className={`${heroMarkerFont.variable} ${heroScriptFont.variable} ${heroSerifFont.variable}`}
        />
      }
    >
      <Stack spacing={10}>
        <Box component="section" aria-labelledby="event-planning-heading">
          <Stack spacing={2}>
            <Box>
              <Typography id="event-planning-heading" variant="h2">
                Event planning
              </Typography>
              <Typography color="textSecondary" sx={{ mt: 1 }}>
                Explore proposed songs and performer interests for October 2026.
              </Typography>
            </Box>
            <EventPlanningCards />
          </Stack>
        </Box>
        <Box component="section" aria-labelledby="past-events-heading">
          <Stack spacing={2}>
            <Box>
              <Typography id="past-events-heading" variant="h2">
                Past events
              </Typography>
              <Typography color="textSecondary" sx={{ mt: 1 }}>
                Revisit the music from our past performances.
              </Typography>
            </Box>
            <PastEventCards />
            <Button
              href="/past-events"
              variant="text"
              sx={{ alignSelf: 'flex-start' }}
            >
              Browse all past events
            </Button>
          </Stack>
        </Box>
      </Stack>
    </SiteFrame>
  );
}
