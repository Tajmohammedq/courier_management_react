import type { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { AuthRole } from '../types/auth';
import { getDashboardPath } from '../utils/routing';

type ProtectedRouteProps = PropsWithChildren<{
  allowedRole: AuthRole;
}>;

export function ProtectedRoute({ allowedRole, children }: ProtectedRouteProps) {
  const { session, isAuthenticated } = useAuth();

  if (!isAuthenticated || !session) {
    return <Navigate to="/" replace />;
  }

  if (session.role !== allowedRole) {
    return <Navigate to={getDashboardPath(session.role)} replace />;
  }

  return children;
}
