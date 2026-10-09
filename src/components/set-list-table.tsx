'use client';

import { useState } from 'react';
import NextLink from 'next/link';
import {
  Card,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
import RoleNeedChip from '@/components/role-need-chip';
import {
  getRoleCandidates,
  getSongAnchor,
  type OctoberSetList,
  type SetListSong,
} from '@/lib/october-set-list';
import type { OctoberSignupPerformer } from '@/lib/october-signup';

type SortColumn = 'title' | 'originalArtist' | `role:${string}`;

function columnValue(song: SetListSong, column: SortColumn): string | null {
  if (column === 'title' || column === 'originalArtist') {
    return song[column];
  }
  const role = song.roles.find((entry) => entry.role === column.slice(5));
  return role
    ? [
        ...role.performers.map(({ name }) => name),
        role.status === 'needed' ? 'Needed!' : role.status === 'nice-to-have' ? 'Nice to have' : '',
        role.detail ?? '',
      ].filter(Boolean).join(', ') || null
    : null;
}

export default function SetListTable({
  setList,
  performers,
}: {
  setList: OctoberSetList;
  performers: OctoberSignupPerformer[];
}) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('originalArtist');
  const [direction, setDirection] = useState<'asc' | 'desc'>('asc');
  const columns: Array<{ key: SortColumn; label: string }> = [
    { key: 'title', label: 'Song' },
    { key: 'originalArtist', label: 'Original Artist' },
    ...setList.roles.map((role) => ({ key: `role:${role}` as const, label: role })),
  ];
  const candidates = new Map(
    setList.roles.map((role) => [
      role,
      getRoleCandidates(role, performers, setList.songs),
    ]),
  );
  const songs = [...setList.songs].sort((left, right) => {
    const a = columnValue(left, sortColumn);
    const b = columnValue(right, sortColumn);
    if (a === null && b !== null) return 1;
    if (a !== null && b === null) return -1;
    const order = (a ?? '').localeCompare(b ?? '', 'en', { sensitivity: 'base' });
    return (direction === 'asc' ? order : -order) ||
      left.title.localeCompare(right.title, 'en', { sensitivity: 'base' });
  });

  function sortBy(column: SortColumn) {
    setDirection(sortColumn === column && direction === 'asc' ? 'desc' : 'asc');
    setSortColumn(column);
  }

  return (
    <Card variant="outlined">
      <TableContainer
        tabIndex={0}
        role="region"
        aria-label="Scrollable set list"
        sx={{ maxWidth: '100%', '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' } }}
      >
        <Table size="small" aria-label="Set list song assignments and outstanding roles">
          <TableHead>
            <TableRow>
              {columns.map(({ key, label }) => (
                <TableCell
                  key={key}
                  component="th"
                  scope="col"
                  sortDirection={sortColumn === key ? direction : false}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  <TableSortLabel
                    active={sortColumn === key}
                    direction={sortColumn === key ? direction : 'asc'}
                    onClick={() => sortBy(key)}
                  >
                    {label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {songs.map((song) => {
              const href = `/event-planning/songs#${encodeURIComponent(getSongAnchor(song.title, song.originalArtist))}`;
              return (
                <TableRow key={getSongAnchor(song.title, song.originalArtist)}>
                  <TableCell component="th" scope="row" sx={{ minWidth: 160 }}>
                    <Link component={NextLink} href={href}>{song.title}</Link>
                  </TableCell>
                  <TableCell sx={{ minWidth: 140 }}>
                    {song.originalArtist ? (
                      <Link component={NextLink} href={href}>{song.originalArtist}</Link>
                    ) : (
                      <Typography color="textSecondary" variant="body2">—</Typography>
                    )}
                  </TableCell>
                  {setList.roles.map((role) => {
                    const assignment = song.roles.find((entry) => entry.role === role);
                    return (
                      <TableCell key={role} sx={{ minWidth: 130, verticalAlign: 'top' }}>
                        <Stack spacing={0.75} sx={{ alignItems: 'flex-start' }}>
                          {assignment?.performers.map(({ initials, name }) => (
                            <Typography key={initials} variant="body2">{name}</Typography>
                          ))}
                          {assignment?.status && (
                            <RoleNeedChip
                              role={role}
                              status={assignment.status}
                              candidates={candidates.get(role) ?? []}
                            />
                          )}
                          {assignment?.detail && (
                            <Typography color="textSecondary" variant="body2">
                              {assignment.detail}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
