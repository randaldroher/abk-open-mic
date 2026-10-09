'use client';

import { Box, Chip, Tooltip, Typography } from '@mui/material';

export default function RoleNeedChip({
  role,
  status,
  detail = null,
  candidates,
  includeRole = false,
}: {
  role: string;
  status: 'nice-to-have' | 'needed';
  detail?: string | null;
  candidates: Array<{ initials: string; name: string; count: number }>;
  includeRole?: boolean;
}) {
  const label = status === 'needed' ? 'Needed!' : 'Nice to have';
  const instrument = role === 'Additional Instruments' && status === 'nice-to-have'
    ? detail
    : null;
  const displayRole = instrument || role;

  return (
    <Tooltip
      describeChild
      arrow
      title={
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {role} — eligible performers
          </Typography>
          <Typography variant="caption">
            Unique set-list song assignments
          </Typography>
          {candidates.length > 0 ? (
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              {candidates.map(({ initials, name, count }) => (
                <li key={initials}>
                  {name}: {count}
                </li>
              ))}
            </Box>
          ) : (
            <Typography variant="body2">No eligible performers listed</Typography>
          )}
        </Box>
      }
    >
      <Chip
        label={includeRole || instrument ? `${displayRole}: ${label}` : label}
        color={status === 'needed' ? 'secondary' : 'primary'}
        size="small"
        tabIndex={0}
        aria-label={includeRole || instrument ? undefined : `${role}: ${label}`}
        sx={{
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'text.primary',
            outlineOffset: 3,
          },
        }}
      />
    </Tooltip>
  );
}
