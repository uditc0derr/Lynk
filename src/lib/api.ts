export async function api<T = unknown>(
  url: string,
  options?: RequestInit & { json?: unknown }
): Promise<T> {
  const { json, ...rest } = options ?? {};
  const res = await fetch(url, {
    ...rest,
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(rest.headers ?? {}),
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  const data = (await res.json().catch(() => null)) as
    | (T & { error?: string })
    | null;
  if (!res.ok) {
    throw new Error(data?.error ?? `Request failed (${res.status})`);
  }
  return data as T;
}

export function shortUrl(slug: string) {
  if (typeof window === "undefined") return `/${slug}`;
  return `${window.location.origin}/${slug}`;
}

export function scanUrl(slug: string) {
  if (typeof window === "undefined") return `/q/${slug}`;
  return `${window.location.origin}/q/${slug}`;
}
