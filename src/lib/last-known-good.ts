export function withLastKnownGood<T>(load: () => Promise<T | null>): () => Promise<T | null> {
  let lastKnownGood: T | undefined;

  return async () => {
    try {
      const data = await load();
      if (data === null) {
        return lastKnownGood ?? null;
      }
      lastKnownGood = data;
      return data;
    } catch {
      return lastKnownGood ?? null;
    }
  };
}
