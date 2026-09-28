import Link from "next/link";
import Image from 'next/image';
import { Box, Card, CardContent, SvgIcon, Typography } from "@mui/material";
import { PAST_EVENTS } from "@/lib/past-events";

const eventImages = {
  'may-2026': '/abk-open-mic-may-2026.png',
  'december-2025': '/abk-open-mic-december-2025.png',
  'july-2025': '/abk-open-mic-july-2025.png',
} satisfies Record<(typeof PAST_EVENTS)[number]['slug'], string>;

export default function PastEventCards() {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 3,
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        },
      }}
    >
      {PAST_EVENTS.map(({ slug, label, theme }) => (
        <Link
          key={slug}
          href={`/past-events/${slug}/videos`}
          aria-label={`ABK Open Mic ${label}`}
          style={{
            display: 'block',
            textDecoration: 'none',
            color: 'inherit',
            borderRadius: 20,
          }}
        >
          <Card
            variant="outlined"
            sx={{
              height: '100%',
              minHeight: 176,
              position: 'relative',
              overflow: 'hidden',
              backgroundImage: 'var(--abk-section-gradient)',
              '&:hover, a:focus-visible > &': {
                borderColor: 'primary.main',
                boxShadow: 'var(--abk-neon-glow)',
              },
              '&:hover .event-card-photo, a:focus-visible .event-card-photo': {
                opacity: 0.4,
              },
            }}
          >
            <Box
              className="event-card-photo"
              sx={{
                position: 'absolute',
                inset: 0,
                opacity: 0.3,
                maskImage:
                  'linear-gradient(to right, transparent 5%, black 80%)',
                transition: 'opacity 200ms ease',
                pointerEvents: 'none',
                '@media (prefers-reduced-motion: reduce)': {
                  transition: 'none',
                },
              }}
            >
              <Image
                src={eventImages[slug]}
                alt=""
                fill
                loading={slug === 'may-2026' ? 'eager' : 'lazy'}
                sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            </Box>
            <CardContent
              sx={{
                position: 'relative',
                minHeight: 176,
                display: 'flex',
                alignItems: 'flex-start',
                p: 3,
                '&:last-child': { pb: 3 },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  width: '100%',
                }}
              >
                <Box sx={{ textShadow: '0 0 22px rgba(0, 0, 0, 0.8)' }}>
                  <Typography
                    component="h3"
                    variant="h3"
                    sx={{
                      fontFamily: 'var(--font-wordmark), Arial, sans-serif',
                      fontSize: '1.75rem',
                      fontWeight: 400,
                      letterSpacing: '0.015em',
                    }}
                  >
                    {label}
                  </Typography>
                  <Typography color="textSecondary" sx={{ mt: 0.5 }}>
                    {theme}
                  </Typography>
                </Box>
                <SvgIcon sx={{ color: 'primary.main', fontSize: '1.75rem' }}>
                  <path d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                </SvgIcon>
              </Box>
            </CardContent>
          </Card>
        </Link>
      ))}
    </Box>
  );
}
