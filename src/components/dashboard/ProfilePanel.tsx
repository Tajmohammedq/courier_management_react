import { useEffect, useState } from 'react';
import {
  fetchAccountProfile,
  updateAccountProfile,
  verifyAccountPassword,
} from '../../api/profileApi';
import emptyAvatar from '../../assets/dashboard/empty-avatar.svg';
import { useAuth } from '../../hooks/useAuth';
import type { AccountProfile } from '../../types/auth';
import { ErrorState } from './ErrorState';

type ProfileFormState = {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

function toFormState(profile: AccountProfile): ProfileFormState {
  return {
    firstname: profile.firstname,
    lastname: profile.lastname,
    email: profile.email,
    phone: profile.phone,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
}

export function ProfilePanel() {
  const { session } = useAuth();
  const sessionEmail = session?.email ?? '';
  const sessionRole = session?.role;
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [form, setForm] = useState<ProfileFormState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formMessageTone, setFormMessageTone] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (!sessionEmail || !sessionRole) {
      setProfile(null);
      setForm(null);
      setLoadError('Your session is missing. Please sign in again.');
      setIsLoading(false);
      return;
    }

    const email = sessionEmail;
    const role = sessionRole;
    const controller = new AbortController();

    async function loadProfile() {
      setIsLoading(true);
      setLoadError('');

      try {
        const nextProfile = await fetchAccountProfile(role, email, controller.signal);
        setProfile(nextProfile);
        setForm(toFormState(nextProfile));
      } catch (error) {
        if (!controller.signal.aborted) {
          setProfile(null);
          setForm(null);
          setLoadError(
            error instanceof Error
              ? error.message
              : 'We could not load your profile information right now.',
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => controller.abort();
  }, [sessionEmail, sessionRole]);

  function updateField(field: keyof ProfileFormState, value: string) {
    setFormMessage('');
    setForm((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current,
    );
  }

  function handleStartEdit() {
    if (!profile) {
      return;
    }

    setForm(toFormState(profile));
    setFormMessage('');
    setIsEditing(true);
  }

  function handleCancelEdit() {
    if (profile) {
      setForm(toFormState(profile));
    }

    setFormMessage('');
    setIsEditing(false);
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile || !form || !sessionRole) {
      setFormMessageTone('error');
      setFormMessage('Your session is missing. Please sign in again.');
      return;
    }

    setIsSaving(true);
    setFormMessage('');

    try {
      const wantsPasswordChange =
        form.currentPassword.trim() !== '' ||
        form.newPassword.trim() !== '' ||
        form.confirmPassword.trim() !== '';

      if (wantsPasswordChange) {
        if (
          !form.currentPassword.trim() ||
          !form.newPassword.trim() ||
          !form.confirmPassword.trim()
        ) {
          throw new Error('Enter current, new, and confirm password to change your password.');
        }

        if (form.newPassword !== form.confirmPassword) {
          throw new Error('New password and confirm password must match.');
        }

        const isCurrentPasswordValid = await verifyAccountPassword(
          profile.email,
          form.currentPassword,
        );

        if (!isCurrentPasswordValid) {
          throw new Error('The current password you entered is incorrect.');
        }
      }

      await updateAccountProfile(sessionRole, profile.email, {
        firstname: form.firstname.trim(),
        lastname: form.lastname.trim(),
        email: profile.email,
        phone: form.phone.trim(),
        image: profile.image || '',
        password: form.newPassword.trim(),
      });

      const nextProfile: AccountProfile = {
        ...profile,
        firstname: form.firstname.trim(),
        lastname: form.lastname.trim(),
        email: profile.email,
        phone: form.phone.trim(),
      };

      setProfile(nextProfile);
      setForm(toFormState(nextProfile));
      setIsEditing(false);
      setFormMessageTone('success');
      setFormMessage('Profile updated successfully.');
    } catch (error) {
      setFormMessageTone('error');
      setFormMessage(
        error instanceof Error
          ? error.message
          : 'We could not save your profile changes right now.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (loadError && !profile) {
    return <ErrorState title="Profile is unavailable" message={loadError} />;
  }

  return (
    <section className="service-card profile-panel">
      <div className="service-card__header profile-panel__header">
        <div>
          <span className="section-label">Profile</span>
        </div>

        {!isEditing ? (
          <button type="button" className="ghost-button" onClick={handleStartEdit} disabled={isLoading}>
            Edit profile
          </button>
        ) : null}
      </div>

      {isLoading ? <p className="panel-note">Loading your profile details...</p> : null}
      {loadError && profile ? <p className="form-message is-error">{loadError}</p> : null}
      {formMessage ? (
        <p className={`form-message ${formMessageTone === 'success' ? 'is-success' : 'is-error'}`}>
          {formMessage}
        </p>
      ) : null}

      {profile && form ? (
        <form className="profile-layout" onSubmit={handleSave}>
          <section className="profile-overview">
            <img src={emptyAvatar} alt="" className="profile-hero__avatar" />
            <div className="profile-overview__body">
              <div className="profile-hero__copy">
                <span className="section-label">Account overview</span>
                <strong>{`${profile.firstname} ${profile.lastname}`.trim() || profile.email}</strong>
                <span>{profile.email}</span>
              </div>

              <div className="profile-overview__meta">
                <div>
                  <span>Phone</span>
                  <strong>{profile.phone || 'Not provided'}</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="profile-details">
            <div className="profile-details__header">
              <div>
                <span className="section-label">Personal details</span>
              </div>
            </div>

            <div className="profile-grid">
              <label className="field">
                <span>First name</span>
                {isEditing ? (
                  <input
                    value={form.firstname}
                    onChange={(event) => updateField('firstname', event.target.value)}
                    required
                  />
                ) : (
                  <div className="profile-value">{profile.firstname || 'Not provided'}</div>
                )}
              </label>

              <label className="field">
                <span>Last name</span>
                {isEditing ? (
                  <input
                    value={form.lastname}
                    onChange={(event) => updateField('lastname', event.target.value)}
                    required
                  />
                ) : (
                  <div className="profile-value">{profile.lastname || 'Not provided'}</div>
                )}
              </label>

              <label className="field">
                <span>Email</span>
                {isEditing ? (
                  <input value={form.email} disabled readOnly />
                ) : (
                  <div className="profile-value">{profile.email}</div>
                )}
              </label>

              <label className="field">
                <span>Phone number</span>
                {isEditing ? (
                  <input
                    value={form.phone}
                    onChange={(event) => updateField('phone', event.target.value)}
                    required
                  />
                ) : (
                  <div className="profile-value">{profile.phone || 'Not provided'}</div>
                )}
              </label>
            </div>

            {isEditing ? (
              <>
                <div className="profile-password-section">
                  <div>
                    <span className="section-label">Security</span>
                    <p className="panel-note profile-note">
                      Leave the password fields blank if you only want to update your profile details.
                    </p>
                  </div>

                  <div className="profile-password-grid">
                    <label className="field">
                      <span>Current password</span>
                      <input
                        type="password"
                        value={form.currentPassword}
                        onChange={(event) => updateField('currentPassword', event.target.value)}
                      />
                    </label>

                    <label className="field">
                      <span>New password</span>
                      <input
                        type="password"
                        value={form.newPassword}
                        onChange={(event) => updateField('newPassword', event.target.value)}
                      />
                    </label>

                    <label className="field field--full">
                      <span>Confirm new password</span>
                      <input
                        type="password"
                        value={form.confirmPassword}
                        onChange={(event) => updateField('confirmPassword', event.target.value)}
                      />
                    </label>
                  </div>
                </div>

                <div className="profile-actions">
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="primary-button" disabled={isSaving}>
                    {isSaving ? 'Saving changes...' : 'Save changes'}
                  </button>
                </div>
              </>
            ) : null}
          </section>
        </form>
      ) : null}
    </section>
  );
}
