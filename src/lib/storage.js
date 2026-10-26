const PREFIX = 'nexora:'

/** Safe localStorage wrapper — never throws (private mode, blocked storage, etc). */
export const storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw == null ? fallback : JSON.parse(raw)
    } catch {
      return fallback
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      /* ignore */
    }
  },
  clearAll() {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(PREFIX))
        .forEach((k) => localStorage.removeItem(k))
    } catch {
      /* ignore */
    }
  },
}
