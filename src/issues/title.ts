export const MAX_TITLE_LENGTH = 200;

/**
 * Normalizes an issue title: trims it and collapses internal whitespace.
 * Throws when the result is empty or longer than MAX_TITLE_LENGTH.
 */
export function normalizeTitle(raw: string): string {
  const title = raw.trim().replace(/\s+/g, " ");
  if (title.length === 0) {
    throw new RangeError("Title must not be empty");
  }
  if (title.length > MAX_TITLE_LENGTH) {
    throw new RangeError(
      `Title must be at most ${String(MAX_TITLE_LENGTH)} characters`,
    );
  }
  return title;
}
