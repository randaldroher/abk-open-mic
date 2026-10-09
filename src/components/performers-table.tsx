'use client';

import { Fragment, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type {
  OctoberSignupPerformer,
  PerformerSongInterest,
} from '@/lib/october-signup';

type PerformerWithSongs = Omit<OctoberSignupPerformer, 'initials'> & {
  songs: PerformerSongInterest[];
  assignments?: PerformerSongInterest[] | null;
};

export default function PerformersTable({
  performers,
}: {
  performers: PerformerWithSongs[];
}) {
  return (
    <Card component="section" variant="outlined">
      <CardContent
        sx={{ p: { xs: 1, sm: 2 }, '&:last-child': { pb: { xs: 1, sm: 2 } } }}
      >
        <TableContainer>
          <Table
            aria-label="Performer names, role interests, genres, proposed songs, and set-list assignments in expandable rows"
            size="small"
          >
            <TableHead>
              <TableRow>
                <TableCell
                  component="th"
                  scope="col"
                  sx={{ width: { xs: '7rem', sm: '12rem' } }}
                >
                  Performer
                </TableCell>
                <TableCell component="th" scope="col">
                  Role interests
                </TableCell>
                <TableCell component="th" scope="col">
                  Genres
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {performers.map((performer, index) => (
                <PerformerRow
                  key={`${performer.name}-${index}`}
                  performer={performer}
                  detailsId={`performer-songs-${index}`}
                  isLast={index === performers.length - 1}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

function PerformerRow({
  performer,
  detailsId,
  isLast,
}: {
  performer: PerformerWithSongs;
  detailsId: string;
  isLast: boolean;
}) {
  const { name, genres, roles, songs, assignments = null } = performer;
  const assignedCount = assignments?.length ?? 0;
  const [expanded, setExpanded] = useState(false);

  return (
    <Fragment>
      <TableRow sx={isLast ? { '& > *': { borderBottom: 0 } } : undefined}>
        <TableCell component="th" scope="row">
          <Typography sx={{ fontWeight: 600 }}>{name}</Typography>
          <Button
            size="small"
            aria-controls={detailsId}
            aria-expanded={expanded}
            aria-label={`${expanded ? 'Hide' : 'Show'} songs for ${name}`}
            onClick={() => setExpanded((open) => !open)}
            sx={{ px: 0 }}
          >
            {expanded ? 'Hide Songs' : 'Show Songs'}{assignedCount > 0 ? ` (${assignedCount})` : ''}
          </Button>
        </TableCell>
        <TableCell>
          {roles.length > 0 ? (
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
              {roles.map((role) => (
                <Chip key={role} label={role} size="small" />
              ))}
            </Stack>
          ) : (
            <Typography color="textSecondary" variant="body2">
              No recognized role preferences listed
            </Typography>
          )}
        </TableCell>
        <TableCell>
          {genres.trim() ? (
            <Typography sx={{ whiteSpace: 'pre-wrap' }}>{genres}</Typography>
          ) : (
            <Typography color="textSecondary" variant="body2">
              No genres listed
            </Typography>
          )}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell
          id={detailsId}
          colSpan={3}
          sx={{ p: 0, ...(isLast && { borderBottom: 0 }) }}
        >
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2 }}>
              <Stack spacing={2}>
                {assignments !== null && (
                  <SongGroup
                    heading="Set list assignments"
                    songs={assignments}
                    emptyText="No set list assignments"
                  />
                )}
                <SongGroup
                  heading="Interested in"
                  songs={songs}
                  emptyText="No song interests listed"
                />
              </Stack>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
}

function SongGroup({
  heading,
  songs,
  emptyText,
}: {
  heading: string;
  songs: PerformerSongInterest[];
  emptyText: string;
}) {
  return (
    <Box>
      <Typography sx={{ fontWeight: 600 }}>{heading}</Typography>
      {songs.length > 0 ? (
        <Box component="ul" sx={{ mb: 0, pl: 3 }}>
          {songs.map(({ title, originalArtist, roles }, index) => (
            <Box component="li" key={`${title}-${index}`} sx={{ mb: 1 }}>
              <Typography>
                {title}
                {originalArtist ? ` — ${originalArtist}` : ''}
              </Typography>
              <Typography color="textSecondary" variant="body2">
                {roles.join(', ')}
              </Typography>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography color="textSecondary" variant="body2">{emptyText}</Typography>
      )}
    </Box>
  );
}
