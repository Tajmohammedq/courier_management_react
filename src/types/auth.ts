export type AuthRole = 'user' | 'employee';

export type LoginPayload = {
  user: string;
  password: string;
};

export type RegistrationPayload = {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  password: string;
};

export type LoginResponse = {
  token?: string;
  refresh?: string;
  message?: string;
};

export type ApiMessageResponse = {
  message?: string;
  status?: string;
};

export type AuthSession = {
  email: string;
  role: AuthRole;
  accessToken: string;
  refreshToken: string;
};

export type AccountProfile = {
  email: string;
  firstname: string;
  lastname: string;
  phone: string;
  image?: string;
};

export type AccountProfileUpdatePayload = {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  image?: string;
  password?: string;
};

export type AuthSuccessFlow = 'login' | 'registration';
