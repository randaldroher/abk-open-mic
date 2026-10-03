import assert from "node:assert/strict";
import test from "node:test";
import { projectPastEventSongs } from "./past-event-songs.ts";

test("projects only header-selected public song fields in source order", () => {
  const songs = projectPastEventSongs(
    ["Private note", "Original Artist", "Guitar", "Song", "Vocal", "Contact email"],
    [
      ["keep private", "Artist One", "Guitarist", "First song", "Singer", "private@example.com"],
      ["also private", "Artist Two", "", "Second song", "<Open>", "private@example.com"],
      [],
      ["not part of the song table", "", "", "Not included", "", ""],
    ],
  );

  assert.deepEqual(songs, [
    {
      title: "First song",
      originalArtist: "Artist One",
      performers: [
        { role: "Guitar", name: "Guitarist" },
        { role: "Vocal", name: "Singer" },
      ],
    },
    { title: "Second song", originalArtist: "Artist Two", performers: [] },
  ]);
});

test("adds last initials when event performers share a first name", () => {
  const songs = projectPastEventSongs(
    ["Song", "Vocal", "Guitar"],
    [
      ["First song", "Alex Brown", "Jamie Young"],
      ["Second song", "Alex Jones", ""],
    ],
  );

  assert.deepEqual(
    songs.map(({ performers }) => performers.map(({ name }) => name)),
    [["Alex B.", "Jamie"], ["Alex J."]],
  );
});

test("supports an event tab without an artist column and normalizes header spacing", () => {
  assert.deepEqual(
    projectPastEventSongs([" Song ", "Additional\nInstruments"], [["Title", "Cello"]]),
    [{ title: "Title", originalArtist: null, performers: [{ role: "Additional instruments", name: "Cello" }] }],
  );
});

test("rejects missing song headers and malformed rows rather than publishing incomplete data", () => {
  assert.throws(() => projectPastEventSongs(["Artist"], [["Song"]]), /Invalid past event song data/);
  assert.throws(() => projectPastEventSongs(["Song", "Vocal"], [["", "Singer"]]), /Invalid past event song data/);
  assert.throws(() => projectPastEventSongs(["Song"], [["person@example.com"]]), /Invalid past event song data/);
  assert.throws(() => projectPastEventSongs(["Song"], []), /Invalid past event song data/);
});
