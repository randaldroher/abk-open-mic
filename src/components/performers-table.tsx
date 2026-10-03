import {
  Card,
  CardContent,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { OctoberSignupPerformer } from '@/lib/october-signup';

export default function PerformersTable({
  performers,
}: {
  performers: OctoberSignupPerformer[];
}) {
  return (
    <Card component="section" variant="outlined">
      <CardContent
        sx={{ p: { xs: 1, sm: 2 }, '&:last-child': { pb: { xs: 1, sm: 2 } } }}
      >
        <TableContainer>
          <Table
            aria-label="Performer names, role interests, and genres"
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
              {performers.map(({ name, initials, genres, roles }) => (
                <TableRow key={initials}>
                  <TableCell component="th" scope="row">
                    <Typography sx={{ fontWeight: 600 }}>{name}</Typography>
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
                      <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                        {genres}
                      </Typography>
                    ) : (
                      <Typography color="textSecondary" variant="body2">
                        No genres listed
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
