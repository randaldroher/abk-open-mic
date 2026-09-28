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

test("throws when no successful result is available", async () => {
  const load = withLastKnownGood(async () => {
    throw new Error("Sheets unavailable");
  });

  await assert.rejects(load(), /Sheets unavailable/);
});
