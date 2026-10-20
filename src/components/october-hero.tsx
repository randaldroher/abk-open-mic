import type { ReactNode } from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { OCTOBER_EVENT } from '@/lib/october-event';
import { SIGNUP_URL, SLACK_URL } from '@/lib/site-links';

const EMBER = '#ff7a3d';
const FLAME = '#ff5a36';
const PARCHMENT = '#f6e6cc';
const AMBER = '#f0b27a';

const MARKER_FONT = 'var(--font-hero-marker), "Comic Sans MS", cursive';
const SCRIPT_FONT = 'var(--font-hero-script), "Brush Script MT", cursive';
const SERIF_FONT = 'var(--font-hero-serif), Georgia, serif';

const BAT_PATH =
  'M0 7C3 3 6 3 8 6C9 4 9.5 3 10 3S11 4 12 6C14 3 17 3 20 7C17.5 6 15.5 7 14.5 9C13 7.5 11.5 8 10 10C8.5 8 7 7.5 5.5 9C4.5 7 2.5 6 0 7Z';

function Bat({ sx }: { sx: object }) {
  return (
    <Box component="svg" viewBox="0 0 20 12" sx={{ position: 'absolute', ...sx }}>
      <path d={BAT_PATH} fill="currentColor" />
    </Box>
  );
}

function Banner({ side }: { side: 'left' | 'right' }) {
  return (
    <Box
      sx={{
        display: { xs: 'none', md: 'block' },
        position: 'absolute',
        top: 0,
        [side]: { md: '4%', lg: '7%' },
        width: 'clamp(90px, 10vw, 150px)',
        aspectRatio: '1 / 3',
        background:
          'linear-gradient(180deg, #5c0d0a, #3a0807 70%, #250504), repeating-linear-gradient(90deg, transparent 0 6px, rgba(0 0 0 / 0.15) 6px 7px)',
        backgroundBlendMode: 'multiply',
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 90%, 0 100%)',
        opacity: 0.55,
        boxShadow: 'inset 0 0 40px rgba(0 0 0 / 0.6)',
        '&::after': {
          content: '""',
          position: 'absolute',
          left: '22%',
          right: '22%',
          top: '22%',
          aspectRatio: '1',
          borderRadius: '50%',
          border: '3px solid rgba(255 90 54 / 0.35)',
        },
      }}
    />
  );
}

function Candle({ height, sx }: { height: number; sx: object }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        width: 'clamp(14px, 2vw, 24px)',
        height: `clamp(${Math.round(height * 0.6)}px, ${height / 10}vw, ${height}px)`,
        borderRadius: '4px 4px 0 0',
        background: 'linear-gradient(90deg, #c9a77c, #f3dfbd 45%, #b48d62)',
        boxShadow: '0 0 30px rgba(255 140 60 / 0.35)',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: '50%',
          bottom: '100%',
          width: '60%',
          aspectRatio: '1 / 2',
          transform: 'translateX(-50%)',
          borderRadius: '50% 50% 45% 45% / 70% 70% 30% 30%',
          background: 'radial-gradient(ellipse at 50% 75%, #fff4c2, #ffb347 45%, rgba(255 90 30 / 0) 75%)',
          animation: 'abk-flicker 2.4s ease-in-out infinite alternate',
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          left: '50%',
          bottom: '70%',
          width: 'clamp(90px, 12vw, 160px)',
          aspectRatio: '1',
          transform: 'translateX(-50%)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255 150 60 / 0.28), transparent 65%)',
        },
        ...sx,
      }}
    />
  );
}

function Flourish({ flip }: { flip?: boolean }) {
  return (
    <Box
      component="svg"
      aria-hidden="true"
      viewBox="0 0 40 40"
      sx={{
        width: 'clamp(28px, 5vw, 44px)',
        flexShrink: 0,
        color: FLAME,
        transform: flip ? 'scaleX(-1)' : undefined,
      }}
    >
      <g stroke="currentColor" strokeWidth="4" strokeLinecap="round">
        <path d="M6 10L18 16" />
        <path d="M4 22H18" />
        <path d="M6 34L18 28" />
      </g>
    </Box>
  );
}

function StarDivider() {
  return (
    <Box
      aria-hidden="true"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        width: '100%',
        maxWidth: 420,
        color: AMBER,
        '&::before, &::after': {
          content: '""',
          flex: 1,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${AMBER})`,
        },
        '&::after': { transform: 'scaleX(-1)' },
      }}
    >
      ✦
    </Box>
  );
}

function IconLine({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'center' }}>
      <Box
        component="svg"
        aria-hidden="true"
        viewBox="0 0 24 24"
        sx={{ width: '1.1em', height: '1.1em', flexShrink: 0, color: AMBER }}
      >
        {icon}
      </Box>
      {children}
    </Stack>
  );
}

export default function OctoberHero({ className }: { className?: string }) {
  return (
    <Box
      component="section"
      aria-labelledby="october-hero-heading"
      className={className}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        isolation: 'isolate',
        color: PARCHMENT,
        borderBottom: '1px solid rgba(255 122 61 / 0.25)',
        background: [
          'radial-gradient(ellipse 55% 45% at 50% 42%, rgba(255 110 40 / 0.2), transparent 70%)',
          'radial-gradient(ellipse 40% 30% at 50% 100%, rgba(255 120 40 / 0.18), transparent 70%)',
          'radial-gradient(ellipse 30% 50% at 0% 60%, rgba(140 20 10 / 0.35), transparent 70%)',
          'radial-gradient(ellipse 30% 50% at 100% 60%, rgba(140 20 10 / 0.35), transparent 70%)',
          'linear-gradient(180deg, #120604, #1d0905 55%, #0d0503)',
        ].join(', '),
        pt: { xs: 6, md: 8 },
        pb: { xs: 16, sm: 18, md: 22 },
        '@keyframes abk-flicker': {
          from: { opacity: 0.85, transform: 'translateX(-50%) scale(1, 1)' },
          to: { opacity: 1, transform: 'translateX(-50%) scale(0.92, 1.08)' },
        },
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: -1,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <Banner side="left" />
        <Banner side="right" />
        <Box
          sx={{
            position: 'absolute',
            top: { xs: 20, md: 48 },
            right: { xs: '6%', md: '12%', lg: '17%' },
            width: 'clamp(56px, 9vw, 120px)',
            aspectRatio: '1',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 40%, #fff3d6, #f1cf9a 55%, #d9a66a)',
            boxShadow: '0 0 40px rgba(255 214 150 / 0.45), 0 0 120px rgba(255 170 80 / 0.25)',
            opacity: 0.85,
          }}
        />
        <Box sx={{ color: '#0b0302' }}>
          <Bat sx={{ top: { xs: 70, md: 130 }, right: { xs: '18%', md: '20%' }, width: { xs: 28, md: 44 } }} />
          <Bat sx={{ top: { xs: 34, md: 60 }, right: { xs: '28%', md: '27%' }, width: { xs: 20, md: 30 }, transform: 'rotate(-12deg)' }} />
        </Box>
        <Box sx={{ color: FLAME, opacity: 0.8 }}>
          <Bat sx={{ top: '38%', left: { xs: '4%', md: '20%', lg: '24%' }, width: { xs: 30, md: 46 }, transform: 'rotate(-18deg)' }} />
          <Bat sx={{ top: { xs: '44%', md: '40%' }, right: { xs: '4%', md: '19%', lg: '23%' }, width: { xs: 26, md: 40 }, transform: 'rotate(10deg)' }} />
        </Box>
        <Candle height={110} sx={{ left: '6%' }} />
        <Candle height={70} sx={{ left: '13%', display: { xs: 'none', sm: 'block' } }} />
        <Candle height={90} sx={{ left: '24%', display: { xs: 'none', md: 'block' } }} />
        <Candle height={60} sx={{ left: '38%', display: { xs: 'none', lg: 'block' } }} />
        <Candle height={75} sx={{ right: '36%', display: { xs: 'none', lg: 'block' } }} />
        <Candle height={95} sx={{ right: '22%', display: { xs: 'none', md: 'block' } }} />
        <Candle height={65} sx={{ right: '14%', display: { xs: 'none', sm: 'block' } }} />
        <Candle height={120} sx={{ right: '6%' }} />
      </Box>

      <Container maxWidth="md">
        <Stack spacing={{ xs: 3, md: 3.5 }} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <Box
            component="h1"
            id="october-hero-heading"
            sx={{ position: 'relative', m: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <Box
              component="svg"
              aria-hidden="true"
              viewBox="0 0 28 18"
              sx={{ width: 'clamp(30px, 5vw, 48px)', color: EMBER, mb: 0.5 }}
            >
              <path d="M2 16L4 4L10 10L14 2L18 10L24 4L26 16Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </Box>
            <Stack component="span" direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Flourish />
              <Box
                component="span"
                sx={{
                  fontFamily: MARKER_FONT,
                  fontSize: 'clamp(3rem, 10vw, 6rem)',
                  lineHeight: 1,
                  color: EMBER,
                  transform: 'rotate(-4deg)',
                  textShadow: '0 0 30px rgba(255 122 61 / 0.45)',
                }}
              >
                ABK
              </Box>
              <Flourish flip />
            </Stack>{' '}
            <Box
              component="span"
              sx={{
                fontFamily: MARKER_FONT,
                fontSize: 'clamp(4rem, 16vw, 9rem)',
                lineHeight: 0.92,
                color: PARCHMENT,
                transform: 'rotate(-3deg)',
                textShadow: '0 4px 0 rgba(0 0 0 / 0.35), 0 0 40px rgba(255 170 90 / 0.35)',
                '& > span': { display: 'block' },
                '& > span + span': { ml: '0.6em' },
              }}
            >
              <span>Open</span> <span>Mic</span>
            </Box>{' '}
            <Box
              component="span"
              sx={{
                position: { sm: 'absolute' },
                left: { sm: '94%' },
                bottom: { sm: '6%' },
                mt: { xs: 1, sm: 0 },
                fontFamily: SCRIPT_FONT,
                fontWeight: 700,
                fontSize: 'clamp(2.25rem, 6vw, 3.75rem)',
                lineHeight: 0.9,
                color: FLAME,
                whiteSpace: 'nowrap',
                transform: 'rotate(-9deg)',
                textShadow: '0 0 24px rgba(255 90 54 / 0.4)',
                '& > span': { display: { sm: 'block' } },
                '& > span + span': { ml: { sm: '0.5em' } },
              }}
            >
              <span>Spooky</span> <span>Edition</span>
            </Box>
          </Box>

          <Typography
            sx={{
              fontFamily: SCRIPT_FONT,
              fontWeight: 700,
              fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
              lineHeight: 1.1,
              color: '#2a140b',
              maxWidth: 460,
              px: { xs: 3, sm: 5 },
              py: 1.5,
              transform: 'rotate(-3deg)',
              background: 'linear-gradient(170deg, #f6e4c3, #e8cea3)',
              clipPath:
                'polygon(2% 8%, 30% 0, 62% 6%, 98% 0, 100% 40%, 97% 92%, 70% 100%, 35% 94%, 0 100%, 3% 55%)',
              filter: 'drop-shadow(0 6px 18px rgba(0 0 0 / 0.5))',
            }}
          >
            Open mic is October 25 – Join us!
          </Typography>

          <StarDivider />

          <Stack spacing={1} sx={{ fontFamily: SERIF_FONT }}>
            <IconLine
              icon={
                <>
                  <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 7v5l3 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </>
              }
            >
              <Typography
                component="p"
                sx={{ fontFamily: 'inherit', fontWeight: 600, fontSize: 'clamp(1.4rem, 3.5vw, 1.9rem)', color: AMBER, letterSpacing: '0.04em' }}
              >
                <time dateTime={OCTOBER_EVENT.start}>6:00</time> –{' '}
                <time dateTime={OCTOBER_EVENT.end}>7:30 PM</time>
              </Typography>
            </IconLine>
            <Typography sx={{ fontFamily: 'Georgia, serif', fontSize: { xs: '1.05rem', md: '1.2rem' }, maxWidth: 440 }}>
              Save the date for the evening of {OCTOBER_EVENT.dateLabel}!
            </Typography>
          </Stack>

          <StarDivider />

          <Box component="address" sx={{ fontStyle: 'normal' }}>
            <IconLine
              icon={
                <path
                  d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"
                  fill="currentColor"
                />
              }
            >
              <Typography
                component="span"
                sx={{ fontFamily: SERIF_FONT, fontWeight: 600, fontSize: 'clamp(1.35rem, 3.5vw, 1.8rem)', color: AMBER, letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                {OCTOBER_EVENT.venue}
              </Typography>
            </IconLine>
            <Typography sx={{ fontFamily: SERIF_FONT, letterSpacing: '0.18em', textTransform: 'uppercase', fontSize: '0.85rem' }}>
              {OCTOBER_EVENT.campus}
            </Typography>
            <Typography sx={{ fontFamily: 'Georgia, serif', color: 'rgba(246 230 204 / 0.8)', mt: 0.5 }}>
              {OCTOBER_EVENT.streetAddress}, {OCTOBER_EVENT.locality}
            </Typography>
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ pt: 1, width: { xs: '100%', sm: 'auto' }, maxWidth: 420, '@media (min-width: 600px)': { maxWidth: 'none' } }}
          >
            <Button
              component="a"
              href={OCTOBER_EVENT.calendarHref}
              download={OCTOBER_EVENT.calendarFileName}
              variant="contained"
              size="large"
              startIcon={
                <Box component="svg" aria-hidden="true" viewBox="0 0 24 24" sx={{ width: 20, height: 20 }}>
                  <rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M3 10h18M8 3v4M16 3v4M12 13v5M9.5 15.5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </Box>
              }
              sx={{
                backgroundColor: EMBER,
                color: '#1a0804',
                boxShadow: '0 0 28px rgba(255 122 61 / 0.45)',
                '&:hover': { backgroundColor: '#ff935f', boxShadow: '0 0 36px rgba(255 122 61 / 0.6)' },
              }}
            >
              Add to calendar
            </Button>
            <Button
              component="a"
              href={SIGNUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              size="large"
              sx={{ color: PARCHMENT, borderColor: 'rgba(246 230 204 / 0.5)', '&:hover': { borderColor: PARCHMENT, backgroundColor: 'rgba(246 230 204 / 0.08)' } }}
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
              sx={{ color: PARCHMENT, borderColor: 'rgba(246 230 204 / 0.5)', '&:hover': { borderColor: PARCHMENT, backgroundColor: 'rgba(246 230 204 / 0.08)' } }}
            >
              Join ABK Open Mic on Slack
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
