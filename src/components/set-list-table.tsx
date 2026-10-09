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

const GUITAR_ROLES = ['Lead Guitar', 'Rhythm Guitar', 'Guitar', 'Guitar 2'];
const ADDITIONAL_ROLES = ['Keyboard', 'Additional Instruments'];

function columnAssignments(song: SetListSong, role: string) {
  if (role === 'Additional Instruments') {
    return ADDITIONAL_ROLES.flatMap((part) => song.roles.filter((entry) => entry.role === part));
  }
  return song.roles.filter((entry) =>
    role === 'Guitar' ? GUITAR_ROLES.includes(entry.role) : entry.role === role,
  );
}

function columnValue(song: SetListSong, column: SortColumn): string | null {
  if (column === 'title' || column === 'originalArtist') {
    return song[column];
  }
  return columnAssignments(song, column.slice(5)).flatMap((role) => [
        ...role.performers.map(({ name }) => name),
        role.status === 'needed' ? 'Needed!' : role.status === 'nice-to-have' ? 'Nice to have' : '',
        role.detail ?? '',
      ]).filter(Boolean).join(', ') || null;
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
  const displayRoles = [...new Set(
    setList.roles.map((role) => GUITAR_ROLES.includes(role) ? 'Guitar' : role),
  )].filter((role) => !ADDITIONAL_ROLES.includes(role));
  if (setList.roles.some((role) => ADDITIONAL_ROLES.includes(role))) {
    displayRoles.push('Additional Instruments');
  }
  const columns: Array<{ key: SortColumn; label: string }> = [
    { key: 'title', label: 'Song' },
    { key: 'originalArtist', label: 'Original Artist' },
    ...displayRoles.map((role) => ({ key: `role:${role}` as const, label: role })),
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
        <Table
          size="small"
          aria-label="Set list song assignments and outstanding roles"
          sx={{ '& .MuiTableCell-root': { verticalAlign: 'middle' } }}
        >
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
            {songs.map((song, index) => {
              const href = `/event-planning/songs#${encodeURIComponent(getSongAnchor(song.title, song.originalArtist))}`;
              return (
                <TableRow key={`${getSongAnchor(song.title, song.originalArtist)}-${index}`}>
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
                  {displayRoles.map((columnRole) => {
                    const assignments = columnAssignments(song, columnRole);
                    const grouped = columnRole === 'Guitar' || columnRole === 'Additional Instruments';
                    return (
                      <TableCell key={columnRole} sx={{ minWidth: 130 }}>
                        <Stack spacing={grouped ? 0.25 : 0.75} sx={{ alignItems: 'flex-start' }}>
                          {assignments.filter((assignment) =>
                            assignment.performers.length > 0 || assignment.status || assignment.detail,
                          ).map((assignment) => {
                            const part = assignment.role === 'Lead Guitar' ? 'Lead'
                              : assignment.role === 'Rhythm Guitar' ? 'Rhythm'
                                : assignment.role === 'Additional Instruments'
                                  ? assignment.detail ?? assignment.role
                                  : assignment.role;
                            return (
                            <Stack key={assignment.role} spacing={grouped ? 0.25 : 0.75} sx={{ alignItems: 'flex-start' }}>
                              {grouped ? (
                                assignment.performers.length > 0 && (
                                  <Typography variant="body2">
                                    {`${part}: ${assignment.performers.map(({ name }) => name).join(', ')}`}
                                  </Typography>
                                )
                              ) : assignment.performers.map(({ initials, name }) => (
                                <Typography key={initials} variant="body2">{name}</Typography>
                              ))}
                              {assignment.status && (
                                <RoleNeedChip
                                  variant="link"
                                  role={assignment.role}
                                  status={assignment.status}
                                  detail={assignment.detail}
                                  displayLabel={grouped
                                    ? `${part}: ${assignment.status === 'needed' ? 'Needed!' : 'Nice to have'}`
                                    : undefined}
                                  candidates={candidates.get(assignment.role) ?? []}
                                />
                              )}
                              {assignment.detail && assignment.role !== 'Additional Instruments' && (
                                <Typography color="textSecondary" variant="body2">
                                  {assignment.detail}
                                </Typography>
                              )}
                            </Stack>
                            );
                          })}
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
