import type { ApiErrorBody } from '@line-oa-randomizer/shared';

/** Accepts either `https://host` or `https://host/api`. Routes are always under `/api`. */
function apiBaseUrl(): string {
  const raw = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '');
  return raw.endsWith('/api') ? raw : `${raw}/api`;
}

const API_URL = apiBaseUrl();

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
  const response = await fetch(`${API_URL}${path}`, {
    method: init.method ?? 'GET',
    headers: {
      ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const parsed = isApiErrorBody(body) ? body : {};
    const message = Array.isArray(parsed.message) ? parsed.message.join(', ') : parsed.message;
    throw new ApiError(response.status, parsed.code ?? `HTTP_${response.status}`, message ?? 'เกิดข้อผิดพลาด');
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
