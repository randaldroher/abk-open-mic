'use client';

import { SIGNUP_URL } from '@/lib/site-links';
import {
  AppBar,
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import Link from 'next/link';

const navigation = [
  { label: 'Event planning', href: '/event-planning' },
  { label: 'Past events', href: '/past-events' },
];

export default function SiteNavigation() {
  return (
    <AppBar
      component="header"
      color="inherit"
      elevation={0}
      position="static"
      sx={{ borderBottom: 1, borderColor: 'divider' }}
    >
      <Container maxWidth="lg">
        <Stack
          component="nav"
          direction="row"
          spacing={1}
          sx={{ height: 56, alignItems: 'center' }}
        >
          <Typography
            component="a"
            href="/"
            variant="h6"
            sx={{
              color: 'secondary.main',
              fontFamily: 'var(--font-wordmark), Arial, sans-serif',
              fontSize: { xs: '1.375rem', sm: '1.5rem' },
              fontWeight: 400,
              letterSpacing: '0.01em',
              lineHeight: 1.1,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              pt: '9px',
              pb: '7px',
            }}
          >
            ABK{' '}
            <Box component="span" sx={{ color: 'primary.main' }}>
              Open Mic
            </Box>
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          {navigation.map(({ label, href }) => (
            <Button
              component={Link}
              href={href}
              key={href}
              variant="text"
              color="inherit"
              sx={{ px: { xs: 0.5, sm: 1 }, whiteSpace: 'nowrap' }}
            >
              {label}
            </Button>
          ))}
          <Button
            component="a"
            href={SIGNUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            color="secondary"
            sx={{ whiteSpace: 'nowrap' }}
          >
            Sign up
          </Button>
        </Stack>
      </Container>
    </AppBar>
  );
}
