import type { Metadata } from "next";
import { Suspense } from 'react';
import { Caveat, Cinzel, Permanent_Marker } from 'next/font/google';
import { Box, Button, Stack, Typography } from '@mui/material';
import PastEventCards from "@/components/past-event-cards";
import EventPlanningCards from '@/components/event-planning-cards';
import OctoberHero from '@/components/october-hero';
import SiteFrame from "@/components/site-frame";
import HomeSetList from '@/components/home-set-list';

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
        <Box
          component="section"
          aria-labelledby="home-set-list-heading"
          className={heroSerifFont.variable}
          sx={{
            width: '100%',
            maxWidth: 880,
            mx: 'auto',
            p: { xs: 1.5, sm: 4 },
            color: '#f6e6cc',
            background: 'radial-gradient(ellipse at top, rgba(255 122 61 / 0.14), transparent 60%), #140604',
            border: '1px solid rgba(240 178 122 / 0.5)',
            boxShadow: 'inset 0 0 0 5px #140604, inset 0 0 0 6px rgba(240 178 122 / 0.2), 0 20px 60px rgba(0 0 0 / 0.25)',
          }}
        >
          <Stack spacing={3}>
            <Box sx={{ textAlign: 'center', pt: { xs: 2, sm: 1 }, px: 1 }}>
              <Typography id="home-set-list-heading" variant="h2" sx={{
                fontFamily: 'var(--font-hero-serif), Georgia, serif',
                fontSize: { xs: '2.75rem', sm: '4rem' },
                fontWeight: 600,
                lineHeight: 1.2,
                mt: 1,
                textTransform: 'uppercase',
                transform: 'rotate(-2deg)',
                textShadow: '0 3px 0 rgba(0 0 0 / 0.4), 0 0 30px rgba(255 122 61 / 0.25)',
              }}>
                Set list
              </Typography>
              <Box aria-hidden="true" sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                maxWidth: 300,
                mx: 'auto',
                my: 2,
                color: '#f0b27a',
                '&::before, &::after': {
                  content: '""',
                  height: '1px',
                  flex: 1,
                  bgcolor: 'rgba(240 178 122 / 0.4)',
                },
              }}>
                ✦
              </Box>
              <Typography variant="body2" sx={{ color: '#f6e6cc' }}>
                In performance order. Tap a song for its YouTube reference.
              </Typography>
            </Box>
            <Suspense fallback={<Typography role="status">Loading the set list…</Typography>}>
              <HomeSetList />
            </Suspense>
          </Stack>
        </Box>
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
