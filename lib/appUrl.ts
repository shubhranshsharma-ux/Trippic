// Returns the app's base URL, guaranteeing a scheme and no trailing slash.
// NEXT_PUBLIC_APP_URL is sometimes set without "https://", which breaks
// the OAuth redirect_uri, so we normalize it here.
export function getAppUrl(): string {
  let url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  url = url.trim().replace(/\/+$/, '');
  if (!/^https?:\/\//.test(url)) {
    url = `https://${url}`;
  }
  return url;
}
