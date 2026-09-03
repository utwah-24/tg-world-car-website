function getAuthBaseUrl() {
  return "/api/auth"
}

export type AuthUser = {
  id: number
  username: string
  email: string
  phone: string
  role: "customer" | "admin"
  createdAt: string | null
}

export type AuthResponse = { user: AuthUser }

export class AuthApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public fields: Record<string, string[]> = {},
    public status: number,
  ) {
    super(message)
    this.name = "AuthApiError"
  }
}

async function authRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${getAuthBaseUrl()}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
      cache: "no-store",
    })
  } catch {
    throw new AuthApiError(
      "NETWORK_ERROR",
      "Unable to reach the server. Check your connection and try again.",
      {},
      0,
    )
  }

  if (response.status === 204) return undefined as T

  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new AuthApiError(
      body?.error?.code ?? "REQUEST_FAILED",
      body?.error?.message ?? "Something went wrong. Please try again.",
      body?.error?.fields ?? {},
      response.status,
    )
  }

  return body as T
}

export const authApi = {
  register(input: { username: string; email: string; phone: string; password: string }) {
    return authRequest<AuthResponse>("/register", {
      method: "POST",
      body: JSON.stringify(input),
    })
  },
  login(input: { usernameOrEmail: string; password: string }) {
    return authRequest<AuthResponse>("/login", {
      method: "POST",
      body: JSON.stringify(input),
    })
  },
  me() {
    return authRequest<AuthResponse>("/me")
  },
  logout() {
    return authRequest<void>("/logout", {
      method: "POST",
      body: JSON.stringify({}),
    })
  },
  forgotPassword(email: string) {
    return authRequest<{ message: string }>("/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  },
  resetPassword(token: string, password: string) {
    return authRequest<AuthResponse>("/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    })
  },
}

export function safeRedirect(value: string | null, fallback = "/") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback
  return value
}

export function normalizeTanzanianPhone(value: string) {
  const compact = value.trim().replace(/[\s()-]/g, "")
  return /^0\d{9}$/.test(compact) ? `+255${compact.slice(1)}` : compact
}
