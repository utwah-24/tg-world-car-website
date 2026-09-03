export type FavoriteRecord = { carId: number; createdAt: string }

export class FavoritesApiError extends Error {
  constructor(public code: string, message: string, public fields: Record<string, string[]> = {}, public status: number) {
    super(message)
    this.name = "FavoritesApiError"
  }
}

async function favoritesRequest<T>(path = "", init: RequestInit = {}): Promise<T> {
  let response: Response
  try {
    response = await fetch(`/api/favorites${path}`, {
      ...init,
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    })
  } catch {
    throw new FavoritesApiError("NETWORK_ERROR", "Unable to reach the server. Please try again.", {}, 0)
  }

  if (response.status === 204) return undefined as T
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new FavoritesApiError(
      body?.error?.code ?? "REQUEST_FAILED",
      body?.error?.message ?? "Something went wrong. Please try again.",
      body?.error?.fields ?? {},
      response.status,
    )
  }
  return body as T
}

export const favoritesApi = {
  list: () => favoritesRequest<{ data: FavoriteRecord[] }>(),
  add: (carId: number) => favoritesRequest<{ favorite: FavoriteRecord }>("", { method: "POST", body: JSON.stringify({ carId }) }),
  remove: (carId: number) => favoritesRequest<void>(`/${carId}/remove`, { method: "POST", body: JSON.stringify({}) }),
}

