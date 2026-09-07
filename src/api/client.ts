export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  // Like the parent frontend, SSR requests use a separate backend throttle identity.
  const internalKey = import.meta.env.SSR ? process.env.SSR_INTERNAL_API_KEY : undefined;
  if (internalKey) headers.set("X-Internal-SSR-Key", internalKey);

  const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    throw new Response(null, { status: res.status, statusText: res.statusText });
  }
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      `Expected a JSON response from ${endpoint}, but received ${contentType || "an unknown content type"}. Check VITE_API_URL and restart the frontend server.`
    );
  }
  const text = await res.text();
  if (!text) throw new Error(`The API returned an empty response for ${endpoint}.`);
  return JSON.parse(text) as T;
}
