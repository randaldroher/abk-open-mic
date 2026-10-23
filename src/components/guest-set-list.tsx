'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import type { GuestSetListSong } from '@/lib/guest-set-list';

const EMBER = '#ff7a3d';
const PARCHMENT = '#f6e6cc';
const AMBER = '#f0b27a';

export default function GuestSetList({ songs }: { songs: GuestSetListSong[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (!songs.length) {
    return <Typography color="textSecondary">The set list is coming soon.</Typography>;
  }

  return (
    <Box component="ol" aria-label="Set list in performance order" sx={{ m: 0, p: 0, listStyle: 'none' }}>
      {songs.map((song, index) => (
        <Box component="li" key={index}>
          <Accordion
            expanded={expanded === index}
            onChange={(_, open) => setExpanded(open ? index : null)}
            disableGutters
            variant="outlined"
            sx={{
              overflow: 'hidden',
              color: PARCHMENT,
              background: 'transparent',
              border: 0,
              borderTop: '1px solid rgba(240 178 122 / 0.3)',
              borderRadius: '0 !important',
              '&::before': { display: 'none' },
              '&.Mui-expanded': { backgroundColor: 'rgba(255 122 61 / 0.07)' },
            }}
          >
            <AccordionSummary
              id={`guest-song-${index}-summary`}
              aria-controls={`guest-song-${index}-video`}
              expandIcon={
                <Box
                  component="span"
                  aria-hidden="true"
                  sx={{
                    display: 'grid',
                    placeItems: 'center',
                    width: 44,
                    height: 44,
                    flexShrink: 0,
                    borderRadius: '50%',
                    bgcolor: EMBER,
                    color: '#140604',
                    boxShadow: '0 0 18px rgba(255 122 61 / 0.2)',
                  }}
                >
                  <Box component="svg" viewBox="0 0 24 24" focusable="false" sx={{ width: 28, height: 28 }}>
                    <path d="m5 9 7 7 7-7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </Box>
                </Box>
              }
              sx={{
                px: { xs: 1, sm: 2 },
                py: { xs: 1.5, sm: 2 },
                minHeight: 96,
                alignItems: 'flex-start',
                '& .MuiAccordionSummary-content': { my: 0, minWidth: 0 },
                '& .MuiAccordionSummary-expandIconWrapper': { mt: 0.5, flexShrink: 0 },
                '&:hover': { bgcolor: 'rgba(240 178 122 / 0.06)' },
                '&.Mui-focusVisible': {
                  bgcolor: 'rgba(240 178 122 / 0.1)',
                  outline: `2px solid ${AMBER}`,
                  outlineOffset: -3,
                },
                '@media (prefers-reduced-motion: reduce)': {
                  '& .MuiAccordionSummary-expandIconWrapper': { transition: 'none' },
                },
              }}
            >
              <Stack direction="row" spacing={{ xs: 1.25, sm: 2.5 }} sx={{ width: '100%', minWidth: 0, pr: { xs: 1, sm: 2 } }}>
                <Typography component="span" sx={{
                  fontFamily: 'var(--font-hero-serif), Georgia, serif',
                  fontSize: { xs: '1.25rem', sm: '1.75rem' },
                  fontWeight: 600,
                  lineHeight: 1.5,
                  color: EMBER,
                  minWidth: '2ch',
                  flexShrink: 0,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {String(index + 1).padStart(2, '0')}
                </Typography>
                <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                  <Typography component="span" sx={{
                    display: 'block',
                    fontFamily: 'var(--font-hero-marker), "Comic Sans MS", cursive',
                    fontSize: { xs: '1.2rem', sm: '1.65rem' },
                    fontWeight: 400,
                    lineHeight: 1.4,
                  }}>
                    {song.title}
                  </Typography>
                  <Typography component="span" sx={{
                    display: 'block',
                    mt: 0.5,
                    color: AMBER,
                    fontFamily: 'var(--font-hero-serif), Georgia, serif',
                    fontSize: { xs: '0.85rem', sm: '1rem' },
                    fontWeight: 600,
                  }}>
                    {song.originalArtist ?? 'Artist not listed'}
                  </Typography>
                  <Typography component="span" variant="body2" sx={{ display: 'block', mt: 1, fontSize: '0.95rem', lineHeight: 1.6 }}>
                    {song.performers.length ? song.performers.join(', ') : 'Performers to be announced'}
                  </Typography>
                  <Typography component="span" variant="caption" sx={{ display: 'block', mt: 0.75, color: AMBER }}>
                    {song.videoId ? 'YouTube song reference' : 'No video reference yet'}
                  </Typography>
                </Box>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ px: { xs: 1, sm: 2 }, pb: 3 }}>
              {expanded === index && (song.videoId ? (
                <Stack spacing={1}>
                  <Box sx={{ aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: 1 }}>
                    <iframe
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                      src={`https://www.youtube-nocookie.com/embed/${song.videoId}`}
                      style={{ border: 0, height: '100%', width: '100%' }}
                      title={`${song.title} song reference on YouTube`}
                    />
                  </Box>
                  <Link
                    href={`https://www.youtube.com/watch?v=${song.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ alignSelf: 'flex-start', py: 1, color: AMBER }}
                  >
                    Watch on YouTube
                  </Link>
                </Stack>
              ) : (
                <Typography>A YouTube reference is not available for this song yet.</Typography>
              ))}
            </AccordionDetails>
          </Accordion>
        </Box>
      ))}
    </Box>
  );
}
