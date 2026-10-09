import Link from 'next/link';
import { Box, Card, CardContent, SvgIcon, Typography } from '@mui/material';

const PLANNING_PAGES = [
  {
    slug: 'set-list',
    title: 'Set List',
    description: 'Explore song assignments and roles that still need performers.',
  },
  {
    slug: 'songs',
    title: 'Songs',
    description:
      'Explore proposed songs, interested performers, and reference videos.',
  },
  {
    slug: 'performers',
    title: 'Performers',
    description: 'See performer initials and self-reported role interests.',
  },
] as const;

export default function EventPlanningCards() {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 3,
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
      }}
    >
      {PLANNING_PAGES.map(({ slug, title, description }) => (
        <Link
          key={slug}
          href={`/event-planning/${slug}`}
          aria-label={`October 2026 ${title}`}
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
              minHeight: 160,
              backgroundImage: 'var(--abk-section-gradient)',
              '&:hover, a:focus-visible > &': {
                borderColor: 'primary.main',
                boxShadow: 'var(--abk-neon-glow)',
              },
            }}
          >
            <CardContent
              sx={{
                minHeight: 160,
                display: 'flex',
                alignItems: 'center',
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
                    {title}
                  </Typography>
                  <Typography color="textSecondary" sx={{ mt: 0.5 }}>
                    {description}
                  </Typography>
                </Box>
                <SvgIcon
                  sx={{
                    color: 'primary.main',
                    fontSize: '1.75rem',
                    flexShrink: 0,
                  }}
                >
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
