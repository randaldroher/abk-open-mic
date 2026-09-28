import Link from "next/link";
import { Box, Card, CardContent, SvgIcon, Typography } from "@mui/material";
import { PAST_EVENTS } from "@/lib/past-events";

export default function PastEventCards() {
  return (
    <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" } }}>
      {PAST_EVENTS.map(({ slug, label }) => {
        const [month, year] = label.split(" ");
        return (
          <Link
            key={slug}
            href={`/past-events/${slug}/videos`}
            aria-label={`ABK Open Mic ${label}`}
            style={{ display: "block", textDecoration: "none", color: "inherit", borderRadius: 20 }}
          >
            <Card
              variant="outlined"
              sx={{
                height: "100%",
                position: "relative",
                backgroundImage: "var(--abk-section-gradient)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: "0 0 auto",
                  height: 3,
                  backgroundImage: "var(--abk-accent-gradient)",
                },
                "&:hover, a:focus-visible > &": {
                  borderColor: "primary.main",
                  boxShadow: "var(--abk-neon-glow)",
                },
              }}
            >
              <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                <Typography component="div" variant="overline" color="primary.main" sx={{ lineHeight: 1.5 }}>{year}</Typography>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                  <Typography component="h3" variant="h2">{month}</Typography>
                  <SvgIcon sx={{ color: "primary.main", fontSize: "1.75rem" }}>
                    <path d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                  </SvgIcon>
                </Box>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </Box>
  );
}
