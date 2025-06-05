import type { ApiClient, ApiOptionsType } from './types';

import { BROWSER_API_URL, DOCKER_API_URL } from './constants';

export const getApiUrl = () => {
  return typeof window === 'undefined' ? DOCKER_API_URL : BROWSER_API_URL;
};

export const client: ApiClient = async (path, options) => {
  const REQUEST_URL = `${getApiUrl()}${path}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const config: ApiOptionsType = {
    method: options?.body ? 'POST' : 'GET',
    ...options,
    headers: {
      ...headers,
      ...(options?.headers || {}),
    },
  };

  try {
    const response = await fetch(REQUEST_URL, config);
    const result = await response.json();

    if (result.status === 'error') {
      throw new Error(result.error?.message ? result.error.message : 'Something went wrong!');
    }
    if (!response.ok) throw new Error('Something went wrong!');

    return result.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return Promise.reject(error.message);
  }
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
