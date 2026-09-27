import { AppBar, Box, Container, Link as MuiLink, Toolbar, Typography } from "@mui/material";

const navigation = [
  { label: "Overview", href: "/" },
  { label: "Songs", href: "/songs" },
  { label: "Schedule", href: "/schedule" },
  { label: "Gear", href: "/gear" },
];

export default function SiteNavigation() {
  return (
    <AppBar
      component="header"
      color="inherit"
      elevation={0}
      position="static"
      sx={{ borderBottom: 1, borderColor: "divider" }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: "space-between", minHeight: 72 }}>
          <Typography
            component="a"
            href="/"
            variant="h6"
            sx={{ color: "primary.main", fontWeight: 750, textDecoration: "none" }}
          >
            ABK <Box component="span" sx={{ color: "secondary.main" }}>Open Mic</Box>
          </Typography>
          <Box component="nav" aria-label="Main navigation" sx={{ display: "flex", gap: { xs: 2, sm: 3 } }}>
            {navigation.map(({ label, href }) => (
              <MuiLink
                href={href}
                key={href}
                underline="hover"
                color="text.primary"
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" }, fontWeight: 600 }}
              >
                {label}
              </MuiLink>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
