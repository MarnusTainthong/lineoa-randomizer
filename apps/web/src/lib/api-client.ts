import type { ApiErrorBody } from '@line-oa-randomizer/shared';

/** Full API base, including `/api`, for example `https://host/api`. */
const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

let accessToken: string | null = null;
export function setAccessToken(token: string | null): void {
  accessToken = token;
}

function isApiErrorBody(value: unknown): value is Partial<ApiErrorBody> {
  return typeof value === 'object' && value !== null;
}

export async function apiFetch<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const url = `${API_URL}${path}`;
  const method = init.method ?? 'GET';
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Load failed';
    throw new ApiError(0, 'NETWORK', `${reason} (${method} ${url})`);
  }

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const parsed = isApiErrorBody(body) ? body : {};
    const message = Array.isArray(parsed.message) ? parsed.message.join(', ') : parsed.message;
    throw new ApiError(response.status, parsed.code ?? `HTTP_${response.status}`, message ?? 'เกิดข้อผิดพลาด');
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
