export function withLastKnownGood<T>(load: () => Promise<T>): () => Promise<T> {
  let lastKnownGood: T | undefined;

  return async () => {
    try {
      const data = await load();
      lastKnownGood = data;
      return data;
    } catch (error) {
      if (lastKnownGood !== undefined) {
        return lastKnownGood;
      }
      throw error;
    }
  };
}
