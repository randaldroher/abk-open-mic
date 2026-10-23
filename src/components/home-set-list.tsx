import { Typography } from '@mui/material';
import GuestSetList from '@/components/guest-set-list';
import { buildGuestSetList } from '@/lib/guest-set-list';
import { getOctober2026Signup } from '@/lib/october-2026-signup-data';

export default async function HomeSetList() {
  const event = await getOctober2026Signup();
  if (!event?.setList) {
    return (
      <Typography role="status" color="textSecondary">
        The set list is temporarily unavailable. Please check back soon.
      </Typography>
    );
  }
  return <GuestSetList songs={buildGuestSetList(event.setList.songs, event.songs)} />;
}
