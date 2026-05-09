import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AuthShowcase } from '../components/AuthShowcase';
import { RoleSwitch } from '../components/RoleSwitch';
import { authContent } from '../content/authContent';
import { useAuth } from '../hooks/useAuth';
import type { AuthRole } from '../types/auth';
import { getDashboardPath, getRegistrationPath } from '../utils/routing';

export function LoginPage() {
  const navigate = useNavigate();
  const { session, login } = useAuth();
  const [role, setRole] = useState<AuthRole>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (session) {
    return <Navigate to={getDashboardPath(session.role)} replace />;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await login(role, email.trim(), password);
      navigate(`/auth/success?flow=login&role=${role}`, { replace: true });
    } catch (loginError) {
      const message =
        loginError instanceof Error
          ? loginError.message
          : authContent.errors.login.generic;
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <div className="auth-layout">
        <AuthShowcase />

        <section className="auth-panel">
          <div className="auth-panel__header">
            <span className="eyebrow">{authContent.login.eyebrow}</span>
            <h2>{authContent.login.title[role]}</h2>
          </div>

          <RoleSwitch value={role} onChange={(nextRole) => setRole(nextRole)} />

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>{authContent.login.fields.email}</span>
              <input
                type="email"
                placeholder={authContent.login.placeholders[role].email}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                required
              />
            </label>

            <label className="field">
              <span>{authContent.login.fields.password}</span>
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={authContent.login.placeholders.password}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword
                    ? authContent.login.passwordActions.hide
                    : authContent.login.passwordActions.show}
                </button>
              </div>
            </label>

            {error ? <p className="form-message is-error">{error}</p> : null}

            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting
                ? authContent.login.submit.loading
                : authContent.login.submit[role]}
            </button>
          </form>

          <div className="quick-actions">
            <div>
              <span className="section-label">{authContent.login.registrationLabel}</span>
              <div className="quick-links">
                <Link className="quick-link" to={getRegistrationPath('user')}>
                  {authContent.login.registrationActions.user}
                </Link>
                <Link className="quick-link" to={getRegistrationPath('employee')}>
                  {authContent.login.registrationActions.employee}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
