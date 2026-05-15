import { clearSession, loadSession } from '../utils/authStorage';

const SPRING_API_URL =
  import.meta.env.VITE_SPRING_API_URL?.trim() || 'http://localhost:9090';
const MVC_API_URL =
  import.meta.env.VITE_MVC_API_URL?.trim() || 'http://localhost:8080/courier_management2';

type ApiTarget = 'spring' | 'mvc';

type ApiRequestOptions = {
  target: ApiTarget;
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
};

function getBaseUrl(target: ApiTarget) {
  return target === 'spring' ? SPRING_API_URL : MVC_API_URL;
}

function expireSessionAndRedirect() {
  clearSession();

  if (typeof window !== 'undefined' && window.location.pathname !== '/') {
    window.location.replace('/');
  }
}

async function parseResponse<T>(response: Response) {
  const text = await response.text();

  if (!text) {
    return null as T | null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null as T | null;
  }
}

export async function apiRequest<T>({
  target,
  path,
  method = 'GET',
  body,
  auth = false,
  signal,
}: ApiRequestOptions) {
  const headers: Record<string, string> = {};

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const session = loadSession();

    if (!session?.accessToken) {
      expireSessionAndRedirect();
      throw new Error('Your session is missing. Please sign in again.');
    }

    headers.Authorization = `Bearer ${session.accessToken}`;
  }

  const response = await fetch(`${getBaseUrl(target)}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  const data = await parseResponse<T & { message?: string }>(response);

  if (auth && (response.status === 401 || response.status === 403)) {
    expireSessionAndRedirect();
    throw new Error('Your session has expired. Please sign in again.');
  }

  if (!response.ok) {
    throw new Error(data?.message || 'Something went wrong while contacting the server.');
  }

  return data;
}
