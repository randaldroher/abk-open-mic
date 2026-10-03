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
            aria-label="Performer names, role interests, genres, and proposed songs"
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
}: {
  performer: PerformerWithSongs;
  detailsId: string;
}) {
  const { name, genres, roles, songs } = performer;
  const [expanded, setExpanded] = useState(false);

  return (
    <Fragment>
      <TableRow>
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
            {expanded ? 'Hide songs' : 'Show songs'}
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
        <TableCell colSpan={3} sx={{ p: 0 }}>
          <Collapse id={detailsId} in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2 }}>
              <Typography sx={{ fontWeight: 600 }}>
                Interested in
              </Typography>
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
                <Typography color="textSecondary" variant="body2">
                  No song interests listed
                </Typography>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
}
