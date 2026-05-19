const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:5000'

export const JWT_KEY = 'admin_jwt'

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
}

export async function login(body: LoginRequest): Promise<string> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (res.status === 401) throw new Error('Invalid credentials')
  if (!res.ok) throw new Error(`Login failed (${res.status})`)
  const data: LoginResponse = await res.json()
  return data.token
}

export function getToken(): string | null {
  return localStorage.getItem(JWT_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(JWT_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(JWT_KEY)
}

export function isAuthenticated(): boolean {
  return !!getToken()
}
