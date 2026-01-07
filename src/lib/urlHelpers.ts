/**
 * Convert a blog post title to a URL-friendly identifier
 */
export function titleToUrl(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Decode a URL identifier back to match against titles
 */
export function urlToTitle(urlPart: string): string {
  return decodeURIComponent(urlPart)
    .toLowerCase()
    .replace(/-+/g, ' ') // Replace hyphens with spaces
    .trim()
}
