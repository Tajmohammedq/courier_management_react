import type { AuthRole } from '../types/auth';

export function getDashboardPath(role: AuthRole) {
  return role === 'employee' ? '/dashboard/employee' : '/dashboard/user';
}

export function getRegistrationPath(role: AuthRole) {
  return role === 'employee' ? '/register/employee' : '/register/user';
}

export function getPaymentPath(role: AuthRole) {
  return role === 'employee' ? '/dashboard/employee' : '/payment/user';
}
