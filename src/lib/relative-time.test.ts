import assert from "node:assert/strict";
import test from "node:test";
import { relativeFetchTime } from "./relative-time.ts";

const fetchedAt = "2026-05-01T18:00:00.000Z";
const fetched = Date.parse(fetchedAt);

test("formats elapsed fetch time at minute, hour, and day boundaries", () => {
  for (const [seconds, expected] of [
    [0, "just now"],
    [59, "just now"],
    [60, "1 minute ago"],
    [180, "3 minutes ago"],
    [3_599, "59 minutes ago"],
    [3_600, "1 hour ago"],
    [7_200, "2 hours ago"],
    [86_399, "23 hours ago"],
    [86_400, "1 day ago"],
    [259_200, "3 days ago"],
  ] as const) {
    assert.equal(relativeFetchTime(fetchedAt, fetched + seconds * 1_000), expected);
  }
});

test("handles client clock skew and invalid dates without claiming future updates", () => {
  assert.equal(relativeFetchTime(fetchedAt, fetched - 60_000), "just now");
  assert.equal(relativeFetchTime("invalid", fetched), "unavailable");
  assert.equal(relativeFetchTime(fetchedAt, Number.NaN), "unavailable");
});
