export const PAST_EVENTS = [
  { slug: "may-2026", label: "May 2026", theme: "Through the Decades" },
  { slug: "december-2025", label: "December 2025", theme: "Year-End Celebration" },
  { slug: "july-2025", label: "July 2025", theme: "Inaugural Performance" },
] as const;

// The legacy site's July and December cards linked to each other's playlists;
// these videos are grouped by the actual playlist titles and contents instead.
export const PAST_EVENT_VIDEOS = [
  {
    eventSlug: "july-2025",
    videos: [{ videoId: "nWf3AunfcRU", title: "Open Mic Jul 2025" }],
  },
  {
    eventSlug: "december-2025",
    videos: [
      { videoId: "NEzyw08Ax78", title: "Astrud Gilberto - Fly to the Moon" },
      { videoId: "UQZbVKRi-M0", title: "Rush - Witch Hunt" },
      { videoId: "WhQHlQLAU8k", title: "Vince Guaraldi - Christmas Time is Here" },
      { videoId: "s6aCWR8zHTk", title: "What a Mario World - RRThiel" },
    ],
  },
] as const;

export function getPastEventVideos(slug: string) {
  return PAST_EVENT_VIDEOS.find((event) => event.eventSlug === slug)?.videos ?? [];
}

export function getPastEvent(slug: string) {
  return PAST_EVENTS.find((event) => event.slug === slug) ?? null;
}
