export function withLastKnownGood<T>(load: () => Promise<T>): () => Promise<T | null> {
  let lastKnownGood: T | undefined;

  return async () => {
    try {
      const data = await load();
      lastKnownGood = data;
      return data;
    } catch {
      return lastKnownGood ?? null;
    }
  };
}
