"use client";

import { useEffect, useState } from "react";
import { relativeFetchTime } from "@/lib/relative-time";

export default function LastUpdated({ fetchedAt }: { fetchedAt: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setNow(Date.now());
    const frame = requestAnimationFrame(update);
    const interval = setInterval(update, 30_000);
    return () => {
      cancelAnimationFrame(frame);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      Last updated:{" "}
      <time dateTime={fetchedAt} title={`Data last fetched successfully: ${fetchedAt}`}>
        {now === null ? fetchedAt : relativeFetchTime(fetchedAt, now)}
      </time>
      {" · Last successful data fetch"}
    </>
  );
}
