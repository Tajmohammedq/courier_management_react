import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { authContent, getSuccessCopy } from '../content/authContent';
import { useAuth } from '../hooks/useAuth';
import type { AuthRole, AuthSuccessFlow } from '../types/auth';
import { getDashboardPath } from '../utils/routing';

function isRole(value: string | null): value is AuthRole {
  return value === 'user' || value === 'employee';
}

function isFlow(value: string | null): value is AuthSuccessFlow {
  return value === 'login' || value === 'registration';
}

export function AuthSuccessPage() {
  const [params] = useSearchParams();
  const { session } = useAuth();

  const roleParam = params.get('role');
  const flowParam = params.get('flow');

  if (!isRole(roleParam) || !isFlow(flowParam)) {
    return <Navigate to="/" replace />;
  }

  if (flowParam === 'login' && (!session || session.role !== roleParam)) {
    return <Navigate to="/" replace />;
  }

  const content = getSuccessCopy(flowParam, roleParam);

  return (
    <main className="placeholder-shell">
      <section className="placeholder-card success-card">
        <span className="eyebrow">{content.eyebrow}</span>
        <h1>{content.title}</h1>
        <p>{content.description}</p>

        <div className="placeholder-actions">
          {flowParam === 'login' ? (
            <Link className="primary-button primary-button--link" to={getDashboardPath(roleParam)}>
              {authContent.success.actions.continueToDashboard[roleParam]}
            </Link>
          ) : (
            <Link className="primary-button primary-button--link" to="/">
              {authContent.success.actions.returnToLogin}
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
