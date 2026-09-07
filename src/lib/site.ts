export function siteOrigin(value: string | undefined): string | null {
  if (!value?.trim()) return null;
  const url = new URL(value.trim());
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password ||
      url.pathname !== '/' || url.search || url.hash) {
    throw new Error('VITE_SITE_URL must be an absolute site origin without a path, query or credentials.');
  }
  if (['worldstories.net', 'www.worldstories.net'].includes(url.hostname)) {
    throw new Error('VITE_SITE_URL must identify the Nepali site, not worldstories.net.');
  }
  return url.origin;
}

export const SITE_URL = siteOrigin(import.meta.env.VITE_SITE_URL);
