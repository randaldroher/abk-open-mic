import { getPastEvent, getPastEventVideos } from '@/lib/past-events';
import { Box, Paper, Typography } from '@mui/material';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

type Props = { params: Promise<{ event: string }> };

export async function generateMetadata({ params }: Props) {
  const pastEvent = getPastEvent((await params).event);
  return {
    title: pastEvent ? `${pastEvent.label} videos` : 'Event not found',
    description: 'Event recordings from past ABK Open Mic performances.',
  };
}

export default async function VideosPage({ params }: Props) {
  return (
    <Suspense>
      {params.then(({ event }) => {
        const pastEvent = getPastEvent(event);
        if (!pastEvent) {
          notFound();
        }
        const videos = getPastEventVideos(event);

        return (
          <Box
            role="tabpanel"
            id="event-videos-panel"
            aria-labelledby="event-videos-tab"
          >
            {videos.length > 0 ? (
              <Box
                sx={{
                  display: 'grid',
                  gap: 3,
                  gridTemplateColumns: {
                    xs: '1fr',
                    md: 'repeat(2, minmax(0, 1fr))',
                  },
                }}
              >
                {videos.map(({ videoId, title }) => (
                  <Paper
                    key={videoId}
                    variant="outlined"
                    sx={{
                      p: 1,
                      backgroundImage: 'var(--abk-section-gradient)',
                    }}
                  >
                    <Box
                      sx={{
                        aspectRatio: '16 / 9',
                        bgcolor: 'common.black',
                        borderRadius: 1,
                        overflow: 'hidden',
                        position: 'relative',
                        width: '100%',
                      }}
                    >
                      <iframe
                        title={`ABK Open Mic ${pastEvent.label}: ${title}`}
                        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                        style={{
                          border: 0,
                          height: '100%',
                          inset: 0,
                          position: 'absolute',
                          width: '100%',
                        }}
                      />
                    </Box>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Paper
                variant="outlined"
                sx={{
                  p: { xs: 3, sm: 4 },
                  backgroundImage: 'var(--abk-section-gradient)',
                }}
              >
                <Typography color="textSecondary">
                  Videos coming soon!
                </Typography>
              </Paper>
            )}
          </Box>
        );
      })}
    </Suspense>
  );
}
