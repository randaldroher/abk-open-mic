import { Box, Link as MuiLink } from "@mui/material";

const MAY_2026_LINKS = [
  { label: "Overview", path: "" },
  { label: "Songs", path: "/songs" },
  { label: "Schedule", path: "/schedule" },
  { label: "Gear", path: "/gear" },
];
const SONG_EVENT_LINKS = [
  { label: "Overview", path: "" },
  { label: "Songs", path: "/songs" },
];

export default function PastEventNavigation({ eventSlug }: { eventSlug: string }) {
  const basePath = `/past-events/${eventSlug}`;
  const links = eventSlug === "may-2026" ? MAY_2026_LINKS : SONG_EVENT_LINKS;

  return (
    <Box
      component="nav"
      aria-label="Event navigation"
      sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}
    >
      {links.map(({ label, path }) => (
        <MuiLink
          href={`${basePath}${path}`}
          key={label}
          underline="none"
          color="text.primary"
          sx={{
            fontWeight: 600,
            px: 1.5,
            py: 1,
            borderRadius: 2,
            "&:hover": { color: "primary.main", bgcolor: "action.hover" },
          }}
        >
          {label}
        </MuiLink>
      ))}
    </Box>
  );
}
