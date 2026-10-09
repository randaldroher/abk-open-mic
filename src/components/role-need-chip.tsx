'use client';

import { Box, Chip, Link, Tooltip, Typography } from '@mui/material';

export default function RoleNeedChip({
  role,
  status,
  detail = null,
  candidates,
  includeRole = false,
  displayLabel,
  variant = 'chip',
}: {
  role: string;
  status: 'nice-to-have' | 'needed';
  detail?: string | null;
  candidates: Array<{ initials: string; name: string; count: number }>;
  includeRole?: boolean;
  displayLabel?: string;
  variant?: 'link' | 'chip';
}) {
  const label = status === 'needed' ? 'Needed!' : 'Nice to have';
  const instrument = role === 'Additional Instruments' && status === 'nice-to-have'
    ? detail
    : null;
  const displayRole = instrument || role;
  const text = displayLabel ?? (includeRole || instrument ? `${displayRole}: ${label}` : label);
  const sharedProps = {
    color: status === 'needed' ? 'secondary' as const : 'primary' as const,
    tabIndex: 0,
    'aria-label': includeRole || instrument ? undefined : `${role}: ${label}`,
    sx: {
      '&:focus-visible': {
        outline: '2px solid',
        outlineColor: 'text.primary',
        outlineOffset: 3,
      },
    },
  };

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
      {variant === 'link' ? (
        <Link
          {...sharedProps}
          component="span"
          variant="body2"
          underline="none"
          sx={{ ...sharedProps.sx, fontWeight: 700 }}
        >
          {text}
        </Link>
      ) : (
        <Chip {...sharedProps} label={text} size="small" />
      )}
    </Tooltip>
  );
}
