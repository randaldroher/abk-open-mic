import type { Metadata } from 'next';
import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { Suspense } from 'react';
import ProgramUnavailable from '@/components/program-unavailable';
import SongCardsSkeleton from '@/components/song-cards-skeleton';
import RoleNeedChip from '@/components/role-need-chip';
import { getOctober2026Signup } from '@/lib/october-2026-signup-data';
import {
  sortSongsByOriginalArtist,
  type OctoberSignupSong,
} from '@/lib/october-signup';
import {
  getRoleCandidates,
  getSongAnchor,
  getSongRoleNeeds,
} from '@/lib/october-set-list';

export const metadata: Metadata = {
  title: 'Songs',
  description:
    'Set-list and proposed songs, interested performers, and YouTube references for the October 2026 ABK Open Mic.',
};

export default function SongsPage() {
  return (
    <Stack
      spacing={3}
      id="event-planning-songs-panel"
      role="tabpanel"
      aria-labelledby="event-planning-songs-tab"
    >
      <Typography color="textSecondary">
        Songs from the signup sheet and set list. Signup interest is not a
        confirmed performer assignment.
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
  const setList = eventData.setList;
  const songsByAnchor = new Map<string, OctoberSignupSong>();
  for (const song of eventData.songs) {
    const anchor = getSongAnchor(song.title, song.originalArtist);
    if (!songsByAnchor.has(anchor)) {
      songsByAnchor.set(anchor, song);
    }
  }
  for (const song of setList?.songs ?? []) {
    const anchor = getSongAnchor(song.title, song.originalArtist);
    if (!songsByAnchor.has(anchor)) {
      songsByAnchor.set(anchor, {
        title: song.title,
        originalArtist: song.originalArtist,
        interestedPerformers: [],
        videoId: null,
      });
    }
  }

  return (
    <Box
      component="ul"
      aria-label="Set-list and proposed songs"
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
        listStyle: 'none',
        p: 0,
        m: 0,
      }}
    >
      {sortSongsByOriginalArtist([...songsByAnchor.values()]).map((song) => (
        <Card
          component="li"
          id={getSongAnchor(song.title, song.originalArtist)}
          key={getSongAnchor(song.title, song.originalArtist)}
          variant="outlined"
          sx={{ minWidth: 0, scrollMarginTop: 24 }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h3">{song.title}</Typography>
            {song.originalArtist && (
              <Typography color="textSecondary">
                Originally by {song.originalArtist}
              </Typography>
            )}
            {setList && (
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {getSongRoleNeeds(song, setList.songs).map(
                  ({ role, status, detail }) => status && (
                    <Stack key={role} spacing={0.5} sx={{ alignItems: 'flex-start' }}>
                      <RoleNeedChip
                        role={role}
                        status={status}
                        includeRole
                        candidates={getRoleCandidates(role, eventData.performers, setList.songs)}
                      />
                      {detail && (
                        <Typography color="textSecondary" variant="body2">{detail}</Typography>
                      )}
                    </Stack>
                  ),
                )}
              </Stack>
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
