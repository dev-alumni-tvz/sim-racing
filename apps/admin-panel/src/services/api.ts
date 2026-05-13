const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:5000'
const API_KEY = (import.meta.env.VITE_ADMIN_API_KEY as string | undefined) ?? ''

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': API_KEY,
      ...init?.headers,
    },
    ...init,
  })
  if (!res.ok) throw new Error(`${res.status} ${path}`)
  return res.json() as Promise<T>
}

export const API_BASE_URL = BASE_URL
