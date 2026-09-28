import { AppBar, Box, Container, Link as MuiLink, Toolbar, Typography } from "@mui/material";

const navigation = [
  { label: "Past events", href: "/past-events" },
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
        <Toolbar
          disableGutters
          sx={{ justifyContent: "space-between", minHeight: 80, flexWrap: "wrap", gap: 1, py: 1.5 }}
        >
          <Typography
            component="a"
            href="/"
            variant="h6"
            sx={{ color: "primary.main", fontWeight: 800, letterSpacing: "-0.04em", textDecoration: "none", py: 1 }}
          >
            ABK <Box component="span" sx={{ color: "secondary.main" }}>Open Mic</Box>
          </Typography>
          <Box component="nav" aria-label="Main navigation" sx={{ display: "flex", gap: { xs: 0.5, sm: 1 } }}>
            {navigation.map(({ label, href }) => (
              <MuiLink
                href={href}
                key={href}
                underline="none"
                color="text.primary"
                sx={{
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  fontWeight: 600,
                  px: { xs: 1.25, sm: 2 },
                  py: 1.25,
                  borderRadius: 2,
                  "&:hover": { color: "primary.main", bgcolor: "action.hover" },
                }}
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
