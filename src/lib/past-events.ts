export const PAST_EVENTS = [
  { slug: "may-2026", label: "May 2026", theme: "Through the Decades" },
  { slug: "december-2025", label: "December 2025", theme: "Year-End Celebration" },
  { slug: "july-2025", label: "July 2025", theme: "Inaugural Performance" },
] as const;

export function getPastEvent(slug: string) {
  return PAST_EVENTS.find((event) => event.slug === slug) ?? null;
}
