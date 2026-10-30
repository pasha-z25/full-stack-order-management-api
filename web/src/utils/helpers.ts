import type { ApiClient, ApiOptionsType } from './types';

import Cookies from 'js-cookie';

import {
  AUTH_TOKEN_COOKIE,
  BROWSER_API_URL,
  DOCKER_API_URL,
  protectedApiPrefixes,
} from './constants';

export const getApiUrl = () => {
  return typeof window === 'undefined' ? DOCKER_API_URL : BROWSER_API_URL;
};

const needsAuthHeader = (path: string) =>
  protectedApiPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

const FALLBACK_ERROR = 'Something went wrong!';

function apiErrorMessage(body: unknown, ok: boolean): string | null {
  if (!body || typeof body !== 'object') return ok ? null : FALLBACK_ERROR;

  const record = body as {
    status?: unknown;
    message?: unknown;
    error?: { message?: unknown };
  };
  const top = typeof record.message === 'string' ? record.message : '';
  const nested = typeof record.error?.message === 'string' ? record.error.message : '';
  const text = top || nested;

  if (record.status === 'error' || !ok) return text || FALLBACK_ERROR;
  return null;
}

export const client: ApiClient = async (path, options) => {
  const REQUEST_URL = `${getApiUrl()}${path}`;
  const token = needsAuthHeader(path) ? Cookies.get(AUTH_TOKEN_COOKIE) : undefined;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config: ApiOptionsType = {
    method: options?.body ? 'POST' : 'GET',
    ...options,
    headers: {
      ...headers,
      ...(options?.headers || {}),
    },
  };

  const response = await fetch(REQUEST_URL, config);

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    throw new Error(FALLBACK_ERROR);
  }

  const message = apiErrorMessage(body, response.ok);
  if (message) throw new Error(message);

  return body && typeof body === 'object' && 'data' in body
    ? (body as { data: unknown }).data
    : undefined;
};

client.get = function (endpoint: string, config = {}) {
  return client(endpoint, config);
};

client.post = function (endpoint: string, body: BodyInit, config = {}) {
  return client(endpoint, { ...config, body });
};

client.delete = function (endpoint: string, config = {}) {
  return client(endpoint, { ...config, method: 'DELETE' });
};

client.patch = function (endpoint: string, body: BodyInit, config = {}) {
  return client(endpoint, { ...config, body, method: 'PATCH' });
};
