/**
 * Slugify a string to snake_case with ASCII only
 * - lowercase
 * - remove accents/diacritics
 * - replace spaces with underscore
 * - remove invalid chars, collapse multiple underscores, trim underscores
 */
export function slugify(input: string): string {
  const normalized = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_') // non-alnum to underscore
    .replace(/_+/g, '_') // collapse
    .replace(/^_+|_+$/g, ''); // trim
  return normalized;
}

export default slugify;

