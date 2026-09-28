import assert from "node:assert/strict";
import test from "node:test";
import { buildHistoricalProgram } from "./historical-program.ts";

const rows = {
  songsRows: [["Song", "Artist", "Singer", "Guitar"]],
  scheduleRows: [["6:10", "Song", "Artist", "3", "6:13", "Singer", "Guitar"]],
  gearRows: [["Backline", "PA", "Speaker", "Owner", "Yes", "Public note"]],
};

test("projects historical data without email addresses", () => {
  const program = buildHistoricalProgram({
    ...rows,
    songsRows: [["Song", "Artist", "singer@example.com", "Guitar"]],
  });

  assert.deepEqual(program.songs[0].performers, [{ role: "Guitar", performers: ["Guitar"] }]);
  assert.equal(program.songs[0].videoEmbedUrl, null);
  assert.equal("email" in program.gear[0], false);
});

test("converts only valid YouTube links into privacy-enhanced embed URLs", () => {
  const program = buildHistoricalProgram({
    ...rows,
    songsRows: [
      ["Song", "Artist", "", "", "", "", "", "", "", "https://youtu.be/dQw4w9WgXcQ"],
      ["Other", "Artist", "", "", "", "", "", "", "", "https://example.com/video"],
    ],
  });

  assert.equal(program.songs[0].videoEmbedUrl, "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  assert.equal(program.songs[1].videoEmbedUrl, null);
});

test("does not treat a sparse row's video link as an additional instrument", () => {
  const program = buildHistoricalProgram({
    ...rows,
    songsRows: [["Song", "Artist", "", "", "", "", "", "", "", "https://youtu.be/dQw4w9WgXcQ"]],
  });

  assert.deepEqual(program.songs[0].performers, []);
  assert.equal(program.songs[0].videoEmbedUrl, "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
});

test("retains operational schedule entries and groups gear", () => {
  const program = buildHistoricalProgram({
    ...rows,
    scheduleRows: [
      ["1:00", "Setup", "", "120", "3:00"],
      ["6:10", "Song", "Artist", "3", "6:13", "Singer"],
    ],
    gearRows: [
      ["Backline", "PA", "Speaker", "Owner", "Yes", ""],
      ["", "Mixer", "", "Owner", "No", ""],
    ],
  });

  assert.equal(program.schedule[0].originalArtist, null);
  assert.equal(program.gear[1].category, "Backline");
  assert.equal(program.gear[1].isShareable, false);
});

test("rejects invalid schedule data and gear without a category", () => {
  assert.throws(
    () => buildHistoricalProgram({ ...rows, scheduleRows: [["bad", "Song", "Artist", "3", "6:13"]] }),
    /Invalid historical program data/,
  );
  assert.throws(
    () => buildHistoricalProgram({ ...rows, gearRows: [["", "PA", "Speaker", "Owner", "Yes", ""]] }),
    /Invalid historical program data/,
  );
  assert.throws(
    () => buildHistoricalProgram({ ...rows, scheduleRows: [] }),
    /Invalid historical program data/,
  );
});
