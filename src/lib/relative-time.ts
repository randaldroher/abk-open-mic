const formatter = new Intl.RelativeTimeFormat("en", { numeric: "always" });

export function relativeFetchTime(fetchedAt: string, now: number): string {
  const fetched = Date.parse(fetchedAt);
  if (!Number.isFinite(fetched) || !Number.isFinite(now)) {
    return "unavailable";
  }

  const seconds = Math.max(0, Math.floor((now - fetched) / 1_000));
  if (seconds < 60) {
    return "just now";
  }
  if (seconds < 3_600) {
    return formatter.format(-Math.floor(seconds / 60), "minute");
  }
  if (seconds < 86_400) {
    return formatter.format(-Math.floor(seconds / 3_600), "hour");
  }
  return formatter.format(-Math.floor(seconds / 86_400), "day");
}
