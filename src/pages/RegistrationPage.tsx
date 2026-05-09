import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/authApi';
import { authContent } from '../content/authContent';
import { AuthShowcase } from '../components/AuthShowcase';
import type { AuthRole } from '../types/auth';

type RegistrationPageProps = {
  role: AuthRole;
};

type RegistrationFormState = {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

const INITIAL_FORM_STATE: RegistrationFormState = {
  firstname: '',
  lastname: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

export function RegistrationPage({ role }: RegistrationPageProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const content = authContent.registration;

  function updateField(field: keyof RegistrationFormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError(authContent.errors.registration.passwordMismatch);
      return;
    }

    setIsSubmitting(true);

    try {
      await register(role, {
        firstname: form.firstname.trim(),
        lastname: form.lastname.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });

      navigate(`/auth/success?flow=registration&role=${role}`, { replace: true });
    } catch (registrationError) {
      const message =
        registrationError instanceof Error
          ? registrationError.message
          : authContent.errors.registration.generic;
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
            <span className="eyebrow">{content.title[role]}</span>
            <h2>{content.title[role]}</h2>
            <p>{content.description[role]}</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="field">
                <span>{content.fields.firstname}</span>
                <input
                  type="text"
                  placeholder={content.placeholders.firstname}
                  value={form.firstname}
                  onChange={(event) => updateField('firstname', event.target.value)}
                  required
                />
              </label>

              <label className="field">
                <span>{content.fields.lastname}</span>
                <input
                  type="text"
                  placeholder={content.placeholders.lastname}
                  value={form.lastname}
                  onChange={(event) => updateField('lastname', event.target.value)}
                  required
                />
              </label>

              <label className="field">
                <span>{content.fields.email}</span>
                <input
                  type="email"
                  placeholder={content.placeholders.email}
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  required
                />
              </label>

              <label className="field">
                <span>{content.fields.phone}</span>
                <input
                  type="tel"
                  placeholder={content.placeholders.phone}
                  value={form.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                  required
                />
              </label>

              <label className="field">
                <span>{content.fields.password}</span>
                <input
                  type="password"
                  placeholder={content.placeholders.password}
                  value={form.password}
                  onChange={(event) => updateField('password', event.target.value)}
                  required
                />
              </label>

              <label className="field">
                <span>{content.fields.confirmPassword}</span>
                <input
                  type="password"
                  placeholder={content.placeholders.confirmPassword}
                  value={form.confirmPassword}
                  onChange={(event) => updateField('confirmPassword', event.target.value)}
                  required
                />
              </label>
            </div>

            {error ? <p className="form-message is-error">{error}</p> : null}

            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? content.submit.loading : content.submit[role]}
            </button>
          </form>

          <div className="quick-actions">
            <Link className="quick-link" to="/">
              {content.backToLogin}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
