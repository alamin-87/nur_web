type ReadEntry = {
  expiresAt: number;
  value: Promise<unknown>;
  settled: boolean;
};

type ReadCache = Map<string, ReadEntry>;

function getReadCache(): ReadCache {
  const globalCache = globalThis as typeof globalThis & {
    __siteReadCache?: ReadCache;
  };
  globalCache.__siteReadCache ??= new Map<string, ReadEntry>();
  return globalCache.__siteReadCache;
}

export async function cachedRead<T>(
  key: string,
  load: () => Promise<T>,
  ttlMs = 10_000
): Promise<T> {
  const cache = getReadCache();
  const existing = cache.get(key);
  if (existing && (!existing.settled || existing.expiresAt > Date.now())) {
    return existing.value as Promise<T>;
  }
  if (existing) cache.delete(key);

  const entry: ReadEntry = {
    expiresAt: Number.POSITIVE_INFINITY,
    value: Promise.resolve().then(load),
    settled: false,
  };
  cache.set(key, entry);
  while (cache.size > 64) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey === undefined) break;
    cache.delete(oldestKey);
  }

  try {
    const value = (await entry.value) as T;
    if (cache.get(key) === entry) {
      entry.settled = true;
      entry.expiresAt = Date.now() + ttlMs;
    }
    return value;
  } catch (error) {
    if (cache.get(key) === entry) cache.delete(key);
    throw error;
  }
}

export function clearReadCache() {
  getReadCache().clear();
}

export function withReadCache<Args extends unknown[], Result>(
  namespace: string,
  load: (...args: Args) => Promise<Result>,
  shouldCache: (...args: Args) => boolean = () => true
): (...args: Args) => Promise<Result> {
  return (...args) => {
    if (!shouldCache(...args)) return load(...args);
    return cachedRead(
      `${namespace}:${JSON.stringify(args)}`,
      () => load(...args)
    );
  };
}
