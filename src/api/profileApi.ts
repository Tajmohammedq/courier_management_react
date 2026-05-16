import { apiRequest } from './apiClient';
import type { AccountProfile, AccountProfileUpdatePayload, AuthRole } from '../types/auth';

const MVC_API_URL =
  import.meta.env.VITE_MVC_API_URL?.trim() || 'http://localhost:8080/courier_management2';

const PROFILE_ENDPOINTS: Record<AuthRole, (email: string) => string> = {
  user: (email) => `/login/${encodeURIComponent(email)}`,
  employee: (email) => `/getemployeedetails/${encodeURIComponent(email)}`,
};

const PROFILE_UPDATE_ENDPOINTS: Record<AuthRole, (email: string) => string> = {
  user: (email) => `/update/${encodeURIComponent(email)}`,
  employee: (email) => `/employeeupdate/${encodeURIComponent(email)}`,
};

const PROFILE_IMAGE_UPLOAD_ENDPOINTS: Record<AuthRole, (email: string) => string> = {
  user: (email) => `/profile-image/${encodeURIComponent(email)}`,
  employee: (email) => `/employee-profile-image/${encodeURIComponent(email)}`,
};

type ImageUploadResponse = {
  imageUrl?: string;
  message?: string;
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

export async function uploadAccountProfileImage(role: AuthRole, email: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${MVC_API_URL}${PROFILE_IMAGE_UPLOAD_ENDPOINTS[role](email)}`, {
    method: 'POST',
    body: formData,
  });

  let data: ImageUploadResponse | null = null;

  try {
    data = (await response.json()) as ImageUploadResponse;
  } catch {
    data = null;
  }

  if (!response.ok || !data?.imageUrl) {
    throw new Error(data?.message || 'We could not upload your profile photo right now.');
  }

  return data.imageUrl;
}

export async function verifyAccountPassword(email: string, password: string) {
  return (
    (await apiRequest<boolean>({
      target: 'spring',
      path: `/both/alluser/${encodeURIComponent(email)}/${encodeURIComponent(password)}`,
    })) || false
  );
}
