import type { ReactNode } from 'react';
import Image from 'next/image';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { OCTOBER_EVENT } from '@/lib/october-event';
import { SIGNUP_URL, SLACK_URL } from '@/lib/site-links';

const STAGE_IMAGE = '/october-2026/halloween-horde-stage.webp';
const MURLOC_IMAGE = { src: '/october-2026/murloc-singer.webp', width: 400, height: 585 };

const EMBER = '#ff7a3d';
const FLAME = '#ff5a36';
const PARCHMENT = '#f6e6cc';
const AMBER = '#f0b27a';

const MARKER_FONT = 'var(--font-hero-marker), "Comic Sans MS", cursive';
const SCRIPT_FONT = 'var(--font-hero-script), "Brush Script MT", cursive';
const SERIF_FONT = 'var(--font-hero-serif), Georgia, serif';

// Scale the title by viewport height as well as width so the hero stays short on wide, low screens.
const TITLE_SIZE = {
  xs: 'clamp(2.6rem, 13vw, 4.25rem)',
  md: 'clamp(3.25rem, min(6vw, 10vh), 5.75rem)',
};

function Flourish({ flip }: { flip?: boolean }) {
  return (
    <Box
      component="svg"
      aria-hidden="true"
      viewBox="0 0 40 40"
      sx={{
        width: '0.45em',
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
        gap: 1.5,
        width: '100%',
        maxWidth: 360,
        mx: 'auto',
        color: AMBER,
        fontSize: '0.85rem',
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
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', justifyContent: 'center' }}>
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

const outlinedButtonSx = {
  color: PARCHMENT,
  borderColor: 'rgba(246 230 204 / 0.5)',
  backgroundColor: 'rgba(13 5 3 / 0.55)',
  '&:hover': { borderColor: PARCHMENT, backgroundColor: 'rgba(246 230 204 / 0.1)' },
};

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
        backgroundColor: '#140604',
        borderBottom: '1px solid rgba(255 122 61 / 0.25)',
      }}
    >
      <Box aria-hidden="true" sx={{ position: 'absolute', inset: 0, zIndex: -1, pointerEvents: 'none' }}>
        <Image
          src={STAGE_IMAGE}
          alt=""
          fill
          preload
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: '50% 50%' }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: {
              xs: 'linear-gradient(180deg, rgba(13 5 3 / 0.5), rgba(13 5 3 / 0.85) 45%, rgba(13 5 3 / 0.9))',
              md: 'linear-gradient(90deg, rgba(13 5 3 / 0.3), rgba(13 5 3 / 0.88) 32%, rgba(13 5 3 / 0.92) 62%, rgba(13 5 3 / 0.65))',
            },
          }}
        />
      </Box>

      <Container
        maxWidth="xl"
        sx={{
          display: 'grid',
          alignItems: 'center',
          columnGap: { xs: 2, md: 4, lg: 6 },
          rowGap: { xs: 2.5, md: 1.75 },
          gridTemplateColumns: {
            xs: 'minmax(0, 0.8fr) minmax(0, 1fr)',
            md: 'auto minmax(0, 0.85fr) minmax(0, 1.15fr)',
          },
          gridTemplateAreas: {
            xs: '"murloc title" "details details" "actions actions"',
            md: '"murloc title details" "murloc title actions"',
          },
          pt: { xs: 3, md: 3.5 },
          pb: { xs: 4, md: 0 },
        }}
      >
        <Box
          sx={{
            gridArea: 'murloc',
            alignSelf: 'end',
            position: 'relative',
            aspectRatio: `${MURLOC_IMAGE.width} / ${MURLOC_IMAGE.height}`,
            width: { xs: '100%', md: 'clamp(220px, min(24vw, 32vh), 300px)' },
            maxWidth: { xs: 220, md: 'none' },
            justifySelf: { xs: 'end', md: 'start' },
            mb: { md: 1.5 },
            maskImage: 'linear-gradient(180deg, transparent, #000 5%, #000 88%, transparent)',
          }}
        >
          <Image
            src={MURLOC_IMAGE.src}
            alt="A Murloc in a witch hat singing into a microphone on a candlelit stage"
            fill
            preload
            sizes="(max-width: 900px) 40vw, 300px"
            style={{
              objectFit: 'contain',
              objectPosition: 'bottom',
              maskImage: 'linear-gradient(90deg, transparent, #000 5%, #000 94%, transparent)',
            }}
          />
        </Box>

        <Box
          component="h1"
          id="october-hero-heading"
          sx={{
            gridArea: 'title',
            m: 0,
            fontSize: TITLE_SIZE,
            fontWeight: 400,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            justifySelf: 'center',
            lineHeight: 0.92,
          }}
        >
          <Box
            component="svg"
            aria-hidden="true"
            viewBox="0 0 28 18"
            sx={{ width: '0.42em', color: EMBER, mb: '0.04em' }}
          >
            <path d="M2 16L4 4L10 10L14 2L18 10L24 4L26 16Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          </Box>
          <Stack component="span" direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Flourish />
            <Box
              component="span"
              sx={{
                fontFamily: MARKER_FONT,
                fontSize: '0.62em',
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
              position: 'relative',
              fontFamily: MARKER_FONT,
              color: PARCHMENT,
              transform: 'rotate(-3deg)',
              textShadow: '0 4px 0 rgba(0 0 0 / 0.4), 0 0 40px rgba(255 170 90 / 0.35)',
              '& > span': { display: 'block' },
              '& > span:nth-of-type(2)': { pr: { md: '1.25em' } },
            }}
          >
            <span>Open</span> <span>Mic</span>{' '}
            <Box
              component="span"
              sx={{
                position: { xs: 'static', md: 'absolute' },
                display: { xs: 'block', md: 'inline' },
                mt: { xs: '0.15em', md: 0 },
                right: '-0.4em',
                bottom: '-0.14em',
                fontFamily: SCRIPT_FONT,
                fontWeight: 700,
                fontSize: { xs: '0.5em', md: '0.4em' },
                lineHeight: 0.95,
                color: FLAME,
                textAlign: { xs: 'center', md: 'left' },
                whiteSpace: 'nowrap',
                transform: 'rotate(-8deg)',
                textShadow: '0 0 18px rgba(0 0 0 / 0.8), 0 0 24px rgba(255 90 54 / 0.4)',
                '& > span': { display: { md: 'block' } },
                '& > span + span': { ml: { md: '0.45em' } },
              }}
            >
              <span>Spooky</span> <span>Edition</span>
            </Box>
          </Box>
        </Box>

        <Stack
          spacing={1}
          sx={{
            gridArea: 'details',
            alignSelf: 'end',
            alignItems: 'center',
            textAlign: 'center',
            minWidth: 0,
            textShadow: '0 1px 2px rgba(0 0 0 / 0.9), 0 0 14px rgba(0 0 0 / 0.85)',
          }}
        >
          <Typography
            sx={{
              fontFamily: SCRIPT_FONT,
              fontWeight: 700,
              fontSize: { xs: '1.6rem', md: 'clamp(1.6rem, 2.4vw, 2.1rem)' },
              lineHeight: 1.05,
              color: '#2a140b',
              px: { xs: 3, md: 4 },
              py: 1,
              mb: 0.5,
              alignSelf: 'center',
              textShadow: 'none',
              transform: 'rotate(-2.5deg)',
              background: 'linear-gradient(170deg, #f6e4c3, #e8cea3)',
              clipPath:
                'polygon(2% 8%, 30% 0, 62% 6%, 98% 0, 100% 40%, 97% 92%, 70% 100%, 35% 94%, 0 100%, 3% 55%)',
            }}
          >
            Open mic is October 25 – Join us!
          </Typography>

          <StarDivider />

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
              sx={{ fontFamily: SERIF_FONT, fontWeight: 600, fontSize: { xs: '1.35rem', md: '1.55rem' }, lineHeight: 1.3, color: AMBER, letterSpacing: '0.04em' }}
            >
              <time dateTime={OCTOBER_EVENT.start}>6:00</time> –{' '}
              <time dateTime={OCTOBER_EVENT.end}>7:30 PM</time>
            </Typography>
          </IconLine>
          <Typography sx={{ fontFamily: 'Georgia, serif', fontSize: '1rem', lineHeight: 1.4 }}>
            Save the date for the evening of {OCTOBER_EVENT.dateLabel}!
          </Typography>

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
                sx={{ fontFamily: SERIF_FONT, fontWeight: 600, fontSize: { xs: '1.3rem', md: '1.45rem' }, lineHeight: 1.3, color: AMBER, letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                {OCTOBER_EVENT.venue}
              </Typography>
            </IconLine>
            <Typography sx={{ fontFamily: SERIF_FONT, letterSpacing: '0.16em', textTransform: 'uppercase', fontSize: '0.875rem', lineHeight: 1.6 }}>
              {OCTOBER_EVENT.campus}
            </Typography>
            <Typography sx={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', lineHeight: 1.5, color: PARCHMENT }}>
              {OCTOBER_EVENT.streetAddress}, {OCTOBER_EVENT.locality}
            </Typography>
          </Box>
        </Stack>

        <Box
          sx={{
            gridArea: 'actions',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignSelf: 'start',
            gap: { xs: 1.5, md: 1.25 },
            pb: { md: 3 },
            '& .MuiButton-root': { fontSize: { md: '1.15rem' }, py: { md: 0.75 } },
            '& > .MuiButton-root:first-of-type': { flexBasis: { md: '100%' }, maxWidth: { md: 420 } },
          }}
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
            sx={outlinedButtonSx}
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
            sx={outlinedButtonSx}
          >
            Join ABK Open Mic on Slack
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
