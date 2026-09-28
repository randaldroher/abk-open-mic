import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import PageBreadcrumbs from "@/components/page-breadcrumbs";
import { getMay2026Program } from "@/lib/may-2026-program-data";
import ProgramUnavailable from "@/components/program-unavailable";

type Props = { params: Promise<{ event: string }> };

export const metadata = {
  title: "May 2026 gear",
  description: "Equipment recorded for the May 2026 ABK Open Mic.",
};

export default async function GearPage({ params }: Props) {
  const { event } = await params;
  if (event !== "may-2026") {
    notFound();
  }

  const program = await getMay2026Program();
  if (!program) {
    return <ProgramUnavailable />;
  }
  const { gear } = program;
  const categories = Map.groupBy(gear, ({ category }) => category);

  return (
    <Stack spacing={4}>
      <Box>
        <PageBreadcrumbs items={[
          { label: "Past events", href: "/past-events" },
          { label: "May 2026", href: "/past-events/may-2026" },
          { label: "Gear" },
        ]} />
        <Typography variant="h1">Gear</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Equipment recorded for the performance. Open items were still being planned.
        </Typography>
      </Box>
      {[...categories].map(([category, items]) => (
        <Box component="section" key={category}>
          <Typography variant="h2" sx={{ mb: 2, color: "info.main" }}>{category}</Typography>
          <Stack spacing={1.5}>
            {items.map((item) => (
              <Paper component="article" key={`${category}-${item.name}-${item.owner}`} variant="outlined" sx={{ p: 2.5 }}>
                <Stack spacing={1}>
                  <Stack direction="row" sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                    <Typography variant="h3">{item.name}</Typography>
                    {item.isTentative && <Chip color="warning" label="Open / tentative" size="small" />}
                    {item.isShareable === true && <Chip color="primary" variant="outlined" label="Shareable" size="small" />}
                  </Stack>
                  {item.details && <Typography color="text.secondary">{item.details}</Typography>}
                  {(item.owner || item.notes) && (
                    <Typography color="text.secondary" variant="body2">
                      {[item.owner ? `Provided by ${item.owner}` : null, item.notes].filter(Boolean).join(" · ")}
                    </Typography>
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
