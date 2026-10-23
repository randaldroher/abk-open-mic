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

export default function GuestSetList({ songs }: { songs: GuestSetListSong[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (!songs.length) {
    return <Typography color="textSecondary">The set list is coming soon.</Typography>;
  }

  return (
    <Box component="ol" aria-label="Set list in performance order" sx={{ m: 0, p: 0, listStyle: 'none' }}>
      {songs.map((song, index) => (
        <Box component="li" key={index} sx={{ mb: 1.5 }}>
          <Accordion
            expanded={expanded === index}
            onChange={(_, open) => setExpanded(open ? index : null)}
            disableGutters
            variant="outlined"
            sx={{ overflow: 'hidden', '&::before': { display: 'none' } }}
          >
            <AccordionSummary
              id={`guest-song-${index}-summary`}
              aria-controls={`guest-song-${index}-video`}
              expandIcon={<Box component="span" aria-hidden="true">⌄</Box>}
              sx={{ px: { xs: 2, sm: 3 }, py: 1, minHeight: 72 }}
            >
              <Stack direction="row" spacing={2} sx={{ width: '100%', minWidth: 0, pr: 1 }}>
                <Typography component="span" color="primary" sx={{ fontWeight: 700, minWidth: '2ch' }}>
                  {index + 1}.
                </Typography>
                <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                  <Typography component="span" sx={{ display: 'block', fontWeight: 700 }}>
                    {song.title}
                  </Typography>
                  <Typography component="span" color="textSecondary" sx={{ display: 'block' }}>
                    {song.originalArtist ?? 'Artist not listed'}
                  </Typography>
                  <Typography component="span" variant="body2" sx={{ display: 'block', mt: 0.75 }}>
                    {song.performers.length ? song.performers.join(', ') : 'Performers to be announced'}
                  </Typography>
                  <Typography component="span" variant="caption" color="primary" sx={{ display: 'block', mt: 0.75 }}>
                    {song.videoId ? 'YouTube song reference' : 'No video reference yet'}
                  </Typography>
                </Box>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ px: { xs: 2, sm: 3 }, pb: 2 }}>
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
                    sx={{ alignSelf: 'flex-start', py: 1 }}
                  >
                    Watch on YouTube
                  </Link>
                </Stack>
              ) : (
                <Typography color="textSecondary">A YouTube reference is not available for this song yet.</Typography>
              ))}
            </AccordionDetails>
          </Accordion>
        </Box>
      ))}
    </Box>
  );
}
