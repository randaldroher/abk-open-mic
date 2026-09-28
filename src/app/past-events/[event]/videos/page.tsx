import { Paper, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import { getPastEvent } from "@/lib/past-events";

type Props = { params: Promise<{ event: string }> };

export async function generateMetadata({ params }: Props) {
  const pastEvent = getPastEvent((await params).event);
  return {
    title: pastEvent ? `${pastEvent.label} videos` : "Event not found",
    description: "Event recordings from past ABK Open Mic performances.",
  };
}

export default async function VideosPage({ params }: Props) {
  if (!getPastEvent((await params).event)) {
    notFound();
  }

  return (
    <Paper
      role="tabpanel"
      id="event-videos-panel"
      aria-labelledby="event-videos-tab"
      variant="outlined"
      sx={{
        p: { xs: 3, sm: 4 },
        backgroundImage: 'var(--abk-section-gradient)',
      }}
    >
      <Typography variant="h2" gutterBottom>
        Event videos
      </Typography>
      <Typography color="textSecondary">
        Videos will be added in a future update.
      </Typography>
    </Paper>
  );
}
