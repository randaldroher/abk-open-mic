export const PAST_EVENTS = [
  { slug: "may-2026", label: "May 2026" },
  { slug: "december-2025", label: "December 2025" },
  { slug: "july-2025", label: "July 2025" },
] as const;

export function getPastEvent(slug: string) {
  return PAST_EVENTS.find((event) => event.slug === slug) ?? null;
}
