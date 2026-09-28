import Link from "next/link";
import { Box, Card, CardContent, SvgIcon, Typography } from "@mui/material";
import { PAST_EVENTS } from "@/lib/past-events";

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
              backgroundImage: 'var(--abk-section-gradient)',
              '&:hover, a:focus-visible > &': {
                borderColor: 'primary.main',
                boxShadow: 'var(--abk-neon-glow)',
              },
            }}
          >
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Box>
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
