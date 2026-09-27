import type { SheetRows } from "./program";

export const syntheticSheet: SheetRows = {
  events: [
    {
      event_id: "sample-night",
      title: "Open Mic Night",
      starts_at: "2026-10-10T19:00:00-07:00",
      time_zone: "America/Los_Angeles",
      venue: "Sample Studio A",
      guidelines: [
        "All kinds of performances are welcome.",
        "Please keep each performance within its scheduled time.",
        "Be kind to performers and fellow audience members.",
      ],
      updated_at: "2026-09-01T12:00:00-07:00",
      published: true,
    },
  ],
  acts: [
    {
      act_id: "sample-duo",
      event_id: "sample-night",
      display_name: "The Paper Satellites",
      description: "An original acoustic set about finding your way home.",
      instruments: "Voice · acoustic guitar",
      duration_minutes: 15,
      published: true,
    },
    {
      act_id: "sample-poetry",
      event_id: "sample-night",
      display_name: "Small Hours",
      description: "A short collection of poems about late-night ideas.",
      instruments: "Spoken word",
      duration_minutes: 10,
      published: true,
    },
    {
      act_id: "sample-band",
      event_id: "sample-night",
      display_name: "Lantern Arcade",
      description: "A bright, high-energy set of original songs.",
      instruments: "Voice · keys · percussion",
      duration_minutes: 20,
      published: true,
    },
    {
      act_id: "unpublished-sample",
      event_id: "sample-night",
      display_name: "Unpublished act",
      description: "This draft is never returned by the public adapter.",
      instruments: "Draft",
      duration_minutes: 10,
      published: false,
    },
  ],
  schedule: [
    {
      event_id: "sample-night",
      act_id: "sample-duo",
      starts_at: "2026-10-10T19:15:00-07:00",
      order: 1,
      published: true,
    },
    {
      event_id: "sample-night",
      act_id: "sample-poetry",
      starts_at: "2026-10-10T19:35:00-07:00",
      order: 2,
      published: true,
    },
    {
      event_id: "sample-night",
      act_id: "sample-band",
      starts_at: "2026-10-10T19:55:00-07:00",
      order: 3,
      published: true,
    },
  ],
};
