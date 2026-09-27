import assert from "node:assert/strict";
import test from "node:test";
import { buildPublicProgram, type SheetRows } from "./program";
import { syntheticSheet } from "./synthetic-sheet";

test("returns only published rows and projects public fields", () => {
  const program = buildPublicProgram(syntheticSheet);

  assert.equal(program.event?.eventId, "sample-night");
  assert.equal(program.acts.length, 3);
  assert.equal(program.schedule.length, 3);
  assert.equal(
    program.acts.some((act) => act.displayName === "Unpublished act"),
    false,
  );
  assert.equal("published" in program.acts[0], false);
  assert.equal("eventId" in program.acts[0], false);
});

test("returns no public content when the event is unpublished", () => {
  const rows: SheetRows = {
    ...syntheticSheet,
    events: [{ ...syntheticSheet.events[0] as object, published: false }],
  };

  assert.deepEqual(buildPublicProgram(rows), {
    event: null,
    acts: [],
    schedule: [],
  });
});

test("rejects malformed published timestamps", () => {
  const rows: SheetRows = {
    ...syntheticSheet,
    events: [
      { ...syntheticSheet.events[0] as object, starts_at: "not-a-date" },
    ],
  };

  assert.throws(() => buildPublicProgram(rows), /Invalid published event data/);
});

test("rejects published schedule slots that reference unpublished or missing acts", () => {
  const rows: SheetRows = {
    ...syntheticSheet,
    schedule: [
      {
        event_id: "sample-night",
        act_id: "unpublished-sample",
        starts_at: "2026-10-10T19:15:00-07:00",
        order: 1,
        published: true,
      },
    ],
  };

  assert.throws(() => buildPublicProgram(rows), /Invalid published event data/);
});
