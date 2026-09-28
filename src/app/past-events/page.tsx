import type { Metadata } from "next";
import { Box, Stack, Typography } from "@mui/material";
import PageBreadcrumbs from "@/components/page-breadcrumbs";
import PastEventCards from "@/components/past-event-cards";
import SiteFrame from "@/components/site-frame";

export const metadata: Metadata = {
  title: "Past events",
  description: "Browse archived ABK Open Mic events and song lineups.",
};

export default function PastEventsPage() {
  return (
    <SiteFrame>
      <Stack spacing={3}>
        <Box>
          <PageBreadcrumbs
            items={[{ label: 'Home', href: '/' }, { label: 'Past events' }]}
          />
          <Typography variant="h1">Past events</Typography>
          <Typography color="textSecondary" sx={{ mt: 1 }}>
            Revisit the music from our past performances.
          </Typography>
        </Box>
        <PastEventCards />
      </Stack>
    </SiteFrame>
  );
}
