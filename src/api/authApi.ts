import { getFriendlyLoginError, getFriendlyRegistrationError } from '../content/authContent';
import type {
  ApiMessageResponse,
  AuthRole,
  AuthSession,
  LoginPayload,
  LoginResponse,
  RegistrationPayload,
} from '../types/auth';

const SPRING_API_URL =
  import.meta.env.VITE_SPRING_API_URL?.trim() || 'http://localhost:9090';
const MVC_API_URL =
  import.meta.env.VITE_MVC_API_URL?.trim() || 'http://localhost:8080/courier_management2';

const LOGIN_ENDPOINTS: Record<AuthRole, string> = {
  user: '/both/userlogin',
  employee: '/both/employeelogin',
};

const REGISTRATION_ENDPOINTS: Record<AuthRole, string> = {
  user: '/signup',
  employee: '/employee',
};

async function parseApiResponse<T>(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function login(role: AuthRole, payload: LoginPayload) {
  const response = await fetch(`${SPRING_API_URL}${LOGIN_ENDPOINTS[role]}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = (await parseApiResponse<LoginResponse>(response)) || {};

  if (!response.ok) {
    throw new Error(getFriendlyLoginError(data.message));
  }

  const accessToken = data.token?.trim() || '';
  const refreshToken = data.refresh?.trim() || '';

  if (data.message && !accessToken) {
    throw new Error(getFriendlyLoginError(data.message));
  }

  if (!accessToken) {
    throw new Error(getFriendlyLoginError('missing-token'));
  }

  const session: AuthSession = {
    email: payload.user,
    role,
    accessToken,
    refreshToken,
  };

  return session;
}

export async function register(role: AuthRole, payload: RegistrationPayload) {
  const response = await fetch(`${MVC_API_URL}${REGISTRATION_ENDPOINTS[role]}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...payload,
      image: '',
    }),
  });

  const data = await parseApiResponse<ApiMessageResponse>(response);

  if (!response.ok) {
    throw new Error(getFriendlyRegistrationError(role, data?.message));
  }

  if (data?.message && response.status !== 200) {
    throw new Error(getFriendlyRegistrationError(role, data.message));
  }
}
