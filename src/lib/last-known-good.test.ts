import assert from "node:assert/strict";
import test from "node:test";
import { withLastKnownGood } from "./last-known-good.ts";

test("serves the last successful result on read or validation failure and recovers", async () => {
  let result = "first";
  const load = withLastKnownGood(async () => {
    if (result === "failure") {
      throw new Error("Invalid historical program data");
    }
    return result;
  });

  assert.equal(await load(), "first");
  result = "failure";
  assert.equal(await load(), "first");
  result = "updated";
  assert.equal(await load(), "updated");
  result = "failure";
  assert.equal(await load(), "updated");
});

test("returns unavailable when no successful result is available", async () => {
  const load = withLastKnownGood(async () => {
    throw new Error("Sheets unavailable");
  });

  assert.equal(await load(), null);
});

test("preserves the successful fetch timestamp through failures until recovery", async () => {
  const first = { fetchedAt: "2026-05-01T18:00:00.000Z", title: "First program" };
  const next = { fetchedAt: "2026-05-01T18:10:00.000Z", title: "Updated program" };
  let result: typeof first | null = first;
  const load = withLastKnownGood(async () => {
    if (!result) throw new Error("Sheets unavailable");
    return result;
  });

  assert.deepEqual(await load(), first);
  result = null;
  assert.deepEqual(await load(), first);
  result = next;
  assert.deepEqual(await load(), next);
});
