interface CachedEntry<T> {
  timestamp: number;
  data: T;
}

export const readCacheEntry = <T>(key: string): CachedEntry<T> | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) {
      return null;
    }

    const parsed: unknown = JSON.parse(rawValue);
    if (typeof parsed !== 'object' || parsed === null) {
      return null;
    }

    const candidate = parsed as Partial<CachedEntry<T>>;
    if (typeof candidate.timestamp !== 'number' || !('data' in candidate)) {
      return null;
    }

    return {
      timestamp: candidate.timestamp,
      data: candidate.data as T,
    };
  } catch {
    return null;
  }
};

export const writeCacheEntry = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const payload: CachedEntry<T> = {
      timestamp: Date.now(),
      data,
    };
    window.localStorage.setItem(key, JSON.stringify(payload));
  } catch {}
};

export const removeCacheEntry = (key: string): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch {}
};

export const isCacheFresh = (timestamp: number, ttlMs: number): boolean => {
  return Date.now() - timestamp < ttlMs;
};
