const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export async function api<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // intentar parsear JSON aun en error
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.error || res.statusText);
  return data as T;
}
