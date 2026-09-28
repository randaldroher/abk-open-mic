import type { Metadata } from "next";
import Image from 'next/image';
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import PastEventCards from "@/components/past-event-cards";
import SiteFrame from "@/components/site-frame";
import { SIGNUP_URL, SLACK_URL } from "@/lib/site-links";

export const metadata: Metadata = {
  title: "Join the next ABK Open Mic",
  description: "Sign up to perform at the next ABK Open Mic and connect with the community.",
};

export default function Home() {
  return (
    <SiteFrame
      top={
        <Paper
          component="section"
          variant="outlined"
          sx={{
            backgroundImage: 'var(--abk-hero-gradient)',
            position: 'relative',
            borderRadius: `0`,
            borderTop: 'none',
            borderRight: 'none',
            borderLeft: 'none',
            boxShadow: 'var(--abk-neon-glow)',
            overflow: 'hidden',
            p: { xs: 3, sm: 5, md: 7 },
            '&::after': {
              content: '""',
              position: 'absolute',
              pointerEvents: 'none',
              inset: '35% -20% -45% 25%',
              backgroundImage: 'var(--abk-grid)',
              backgroundSize: '48px 48px',
              transform: 'perspective(400px) rotateX(55deg) rotateZ(-12deg)',
              maskImage: 'linear-gradient(110deg, transparent 20%, black)',
            },
          }}
        >
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              inset: '0 0 0 auto',
              width: { xs: '100%', md: '65%' },
              opacity: { xs: 0.16, md: 0.4 },
              mixBlendMode: { xs: 'luminosity', md: 'normal' },
              maskImage: {
                xs: 'linear-gradient(to bottom, transparent, black 40%, transparent)',
                md: 'linear-gradient(to right, transparent, black 55%)',
              },
              pointerEvents: 'none',
            }}
          >
            <Image
              src="/abk-open-mic-may-2026.png"
              alt=""
              fill
              loading="eager"
              sizes="(max-width: 900px) 100vw, 65vw"
              style={{ objectFit: 'cover', objectPosition: 'center 48%' }}
            />
          </Box>
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="overline" color="primary">
                Now taking song suggestions
              </Typography>
            </Box>
            <Stack
              spacing={3}
              sx={{ maxWidth: 760, position: 'relative', zIndex: 1 }}
            >
              <Box>
                <Typography variant="h1">Join the next ABK Open Mic</Typography>
                <Typography
                  variant="h6"
                  sx={{
                    mt: 2,
                    fontWeight: 400,
                    color: 'text.secondary',
                    maxWidth: 680,
                  }}
                >
                  Sign up to play a song, sing along, or join the conversation
                  with fellow music makers.
                </Typography>
              </Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  component="a"
                  href={SIGNUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  color="secondary"
                  size="large"
                  sx={{ borderWidth: 2 }}
                >
                  Sign up in the spreadsheet
                </Button>
                <Button
                  component="a"
                  href={SLACK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  size="large"
                >
                  Join ABK Open Mic on Slack
                </Button>
              </Stack>
            </Stack>
          </Container>
        </Paper>
      }
    >
      <Stack spacing={10}>
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
