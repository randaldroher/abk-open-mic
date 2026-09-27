import "server-only";
import { cacheLife } from "next/cache";
import { buildPublicProgram } from "./program";
import { syntheticSheet } from "./synthetic-sheet";

export async function getPublicProgram() {
  "use cache";
  cacheLife("minutes");
  return buildPublicProgram(syntheticSheet);
}
