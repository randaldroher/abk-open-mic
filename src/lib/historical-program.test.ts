import assert from "node:assert/strict";
import test from "node:test";
import { buildHistoricalProgram } from "./historical-program.ts";

const rows = {
  songsRows: [["Song", "Artist", "Singer", "Guitar"]],
  scheduleRows: [["6:10", "Song", "Artist", "3", "6:13", "Singer", "Guitar"]],
  gearRows: [["Backline", "PA", "Speaker", "Owner", "Yes", "Public note"]],
};

test("uses the May event title without a dash", () => {
  assert.equal(buildHistoricalProgram(rows).title, "ABK Open Mic May 2026");
});

test("orders songs by schedule source order without adding operational entries or mutating inputs", () => {
  const input = {
    ...rows,
    songsRows: [
      ["Finale", "Artist"],
      ["Opening", "Artist"],
      ["Middle", "Artist"],
    ],
    scheduleRows: [
      ["Start Time", "Song Title", "Artist", "Duration (minutes)", "End Time"],
      ["1:00", "Setup", "", "120", "3:00"],
      ["11:00", "Opening", "Artist", "3", "11:03", "Opening singer"],
      ["11:03", "Break", "", "10", "11:13"],
      ["12:00", "Middle", "Artist", "3", "12:03"],
      ["1:00", "Finale", "Artist", "3", "1:03"],
      ["1:03", "Teardown", "", "30", "1:33"],
    ],
  };
  const original = structuredClone(input);
  const program = buildHistoricalProgram(input);

  assert.deepEqual(program.songs.map((song) => song.title), ["Opening", "Middle", "Finale"]);
  assert.deepEqual(program.schedule.map((entry) => entry.title), [
    "Setup", "Opening", "Break", "Middle", "Finale", "Teardown",
  ]);
  assert.deepEqual(program.schedule[1], {
    startsAt: "11:00",
    endsAt: "11:03",
    title: "Opening",
    originalArtist: "Artist",
    durationMinutes: 3,
    performers: [{ role: "Vocal", performers: ["Opening singer"] }],
  });
  assert.deepEqual(input, original);
});

test("keeps unmatched songs at the end in signup order and does not repeat scheduled songs", () => {
  const program = buildHistoricalProgram({
    ...rows,
    songsRows: [
      ["Unmatched first", "Artist"],
      ["Song", "Artist"],
      ["Unmatched second", "Artist"],
      ["Opening", "Artist"],
    ],
    scheduleRows: [
      ["6:00", "Opening", "Artist", "3", "6:03"],
      ...rows.scheduleRows,
      ["6:13", "Song", "Artist", "3", "6:16"],
      ["6:16", "Schedule only", "Artist", "3", "6:19"],
    ],
  });

  assert.deepEqual(program.songs.map((song) => song.title), [
    "Opening", "Song", "Unmatched first", "Unmatched second",
  ]);
});

test("matches normalized titles while retaining song metadata and references", () => {
  const program = buildHistoricalProgram({
    ...rows,
    songsRows: [
      ["Other", "Other Artist"],
      ["  My   Song  ", "Original Artist", "Singer", "Guitar", "Second Guitar", "Bass",
        "Keys", "Drummer", "Violin", "https://youtu.be/dQw4w9WgXcQ"],
    ],
    scheduleRows: [["6:00", " my \t SONG ", "", "3", "6:03", "Schedule singer"]],
  });

  assert.deepEqual(program.songs[0], {
    title: "My   Song",
    originalArtist: "Original Artist",
    performers: [
      { role: "Vocal", performers: ["Singer"] },
      { role: "Guitar", performers: ["Guitar"] },
      { role: "Guitar 2", performers: ["Second Guitar"] },
      { role: "Bass", performers: ["Bass"] },
      { role: "Keyboard", performers: ["Keys"] },
      { role: "Drums", performers: ["Drummer"] },
      { role: "Additional instruments", performers: ["Violin"] },
    ],
    videoEmbedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
  });
  assert.equal(program.songs[1].title, "Other");
  assert.equal(program.schedule[0].title, "my \t SONG");
});

test("disambiguates duplicate song titles using normalized original artists", () => {
  const program = buildHistoricalProgram({
    ...rows,
    songsRows: [
      ["Same Song", "First Artist", "First singer"],
      ["Same Song", "Second   Artist", "Second singer"],
      ["Same Song", "Unscheduled Artist", "Unscheduled singer"],
    ],
    scheduleRows: [
      ["6:00", "same song", " SECOND artist ", "3", "6:03"],
      ["6:03", "Same Song", "FIRST ARTIST", "3", "6:06"],
    ],
  });

  assert.deepEqual(program.songs.map((song) => song.originalArtist), [
    "Second   Artist", "First Artist", "Unscheduled Artist",
  ]);
  assert.deepEqual(program.songs.map((song) => song.performers[0].performers[0]), [
    "Second singer", "First singer", "Unscheduled singer",
  ]);
});

test("preserves signup order when no schedule entries match songs", () => {
  const program = buildHistoricalProgram({
    ...rows,
    songsRows: [["First", "Artist"], ["Second", "Artist"]],
    scheduleRows: [["1:00", "Setup", "", "120", "3:00"]],
  });

  assert.deepEqual(program.songs.map((song) => song.title), ["First", "Second"]);
});

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

test("ignores agenda headers and includes appended schedule entries", () => {
  const program = buildHistoricalProgram({
    ...rows,
    scheduleRows: [
      ["Start Time", "Song Title", "Artist", "Duration (minutes)", "End Time"],
      ...rows.scheduleRows,
      ["6:13", "Encore", "Artist", "4", "6:17"],
    ],
  });

  assert.equal(program.schedule.length, 2);
  assert.equal(program.schedule[1].title, "Encore");
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
  assert.throws(
    () => buildHistoricalProgram({
      ...rows,
      scheduleRows: [
        ["Start Time", "Song Title", "Artist", "Duration (minutes)", "End Time"],
        ["bad", "Encore", "Artist", "4", "6:17"],
      ],
    }),
    /Invalid historical program data/,
  );
});
