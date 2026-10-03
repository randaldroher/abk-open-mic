import type { Metadata } from 'next';
import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { Suspense } from 'react';
import ProgramUnavailable from '@/components/program-unavailable';
import SongCardsSkeleton from '@/components/song-cards-skeleton';
import { getOctober2026Signup } from '@/lib/october-2026-signup-data';
import { sortSongsByOriginalArtist } from '@/lib/october-signup';

export const metadata: Metadata = {
  title: 'Songs',
  description:
    'Proposed songs, interested performers, and YouTube references for the October 2026 ABK Open Mic.',
};

export default function SongsPage() {
  return (
    <Stack spacing={3}>
      <Typography color="textSecondary">
        Proposed songs from the signup sheet. This is an interest list, not the
        confirmed set list.
      </Typography>
      <Suspense fallback={<SongCardsSkeleton showReferences={true} />}>
        <SongCards />
      </Suspense>
    </Stack>
  );
}

async function SongCards() {
  const eventData = await getOctober2026Signup();
  if (!eventData) {
    return <ProgramUnavailable />;
  }

  return (
    <Box
      component="ol"
      aria-label="Proposed songs"
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
        listStyle: 'none',
        p: 0,
        m: 0,
      }}
    >
      {sortSongsByOriginalArtist(eventData.songs).map((song, index) => (
        <Card
          component="li"
          key={`${song.title}-${index}`}
          variant="outlined"
          sx={{ minWidth: 0 }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h3">
              <Box component="span" sx={{ color: 'secondary.main', mr: 1 }}>
                {index + 1}.
              </Box>{' '}
              {song.title}
            </Typography>
            {song.originalArtist && (
              <Typography color="textSecondary">
                Originally by {song.originalArtist}
              </Typography>
            )}
            {song.interestedPerformers.length > 0 && (
              <Stack spacing={1} sx={{ mt: 2 }}>
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {song.interestedPerformers.map(({ name, roles }) => (
                    <Chip
                      key={name}
                      label={`${name}: ${roles.join(', ')}`}
                      size="small"
                    />
                  ))}
                </Stack>
              </Stack>
            )}
            {song.videoId && (
              <Stack spacing={1} sx={{ mt: 2 }}>
                <Box
                  sx={{
                    aspectRatio: '16 / 9',
                    borderRadius: 0.5,
                    overflow: 'hidden',
                    bgcolor: 'background.default',
                  }}
                >
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
              </Stack>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
