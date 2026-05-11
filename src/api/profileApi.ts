import { apiRequest } from './apiClient';
import type { AccountProfile, AuthRole } from '../types/auth';

const PROFILE_ENDPOINTS: Record<AuthRole, (email: string) => string> = {
  user: (email) => `/login/${encodeURIComponent(email)}`,
  employee: (email) => `/getemployeedetails/${encodeURIComponent(email)}`,
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
