import { notFound, redirect } from "next/navigation";
import { getPastEvent } from "@/lib/past-events";

export default async function PastEventPage({
  params,
}: {
  params: Promise<{ event: string }>;
}) {
  const { event } = await params;
  if (!getPastEvent(event)) {
    notFound();
  }
  redirect(`/past-events/${event}/videos`);
}
