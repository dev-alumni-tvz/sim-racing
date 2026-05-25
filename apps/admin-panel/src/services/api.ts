const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:5000'

export const JWT_KEY = 'admin_jwt'

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem(JWT_KEY)
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    ...init,
  })
  if (res.status === 401) {
    localStorage.removeItem(JWT_KEY)
    window.location.reload()
    throw new Error('401 Unauthorized')
  }
  if (!res.ok) throw new Error(`${res.status} ${path}`)
  const text = await res.text()
  return (text ? JSON.parse(text) : null) as T
}

export const API_BASE_URL = BASE_URL
