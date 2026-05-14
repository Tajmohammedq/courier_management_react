import { apiRequest } from './apiClient';
import type { AccountProfile, AccountProfileUpdatePayload, AuthRole } from '../types/auth';

const PROFILE_ENDPOINTS: Record<AuthRole, (email: string) => string> = {
  user: (email) => `/login/${encodeURIComponent(email)}`,
  employee: (email) => `/getemployeedetails/${encodeURIComponent(email)}`,
};

const PROFILE_UPDATE_ENDPOINTS: Record<AuthRole, (email: string) => string> = {
  user: (email) => `/update/${encodeURIComponent(email)}`,
  employee: (email) => `/employeeupdate/${encodeURIComponent(email)}`,
};

export async function fetchAccountProfile(role: AuthRole, email: string, signal?: AbortSignal) {
  const data =
    (await apiRequest<Partial<AccountProfile>>({
      target: 'mvc',
      path: PROFILE_ENDPOINTS[role](email),
      signal,
    })) || {};

  return {
    email: data.email?.trim() || email,
    firstname: data.firstname?.trim() || '',
    lastname: data.lastname?.trim() || '',
    phone: data.phone?.trim() || '',
    image: data.image?.trim() || '',
  } satisfies AccountProfile;
}

export async function updateAccountProfile(
  role: AuthRole,
  email: string,
  payload: AccountProfileUpdatePayload,
) {
  await apiRequest<void>({
    target: 'mvc',
    path: PROFILE_UPDATE_ENDPOINTS[role](email),
    method: 'POST',
    body: payload,
  });
}

export async function verifyAccountPassword(email: string, password: string) {
  return (
    (await apiRequest<boolean>({
      target: 'spring',
      path: `/both/alluser/${encodeURIComponent(email)}/${encodeURIComponent(password)}`,
    })) || false
  );
}
