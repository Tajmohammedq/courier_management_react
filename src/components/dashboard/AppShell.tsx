import { useEffect, useState, type PropsWithChildren } from 'react';
import { fetchAccountProfile } from '../../api/profileApi';
import emptyAvatar from '../../assets/dashboard/empty-avatar.svg';
import type { DashboardRole, DashboardService, DashboardServiceId } from '../../types/dashboard';
import { useAuth } from '../../hooks/useAuth';

type AppShellProps = PropsWithChildren<{
  role: DashboardRole;
  title: string;
  services: DashboardService[];
  activeServiceId: DashboardServiceId;
  onSelectService: (serviceId: DashboardServiceId) => void;
}>;

function formatRole(role: DashboardRole) {
  return role === 'employee' ? 'Employee workspace' : 'User workspace';
}

export function AppShell({
  role,
  title,
  services,
  activeServiceId,
  onSelectService,
  children,
}: AppShellProps) {
  const { session, logout } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [displayImage, setDisplayImage] = useState('');
  const sessionEmail = session?.email ?? '';
  const sessionRole = session?.role;

  useEffect(() => {
    if (!sessionEmail || !sessionRole) {
      setDisplayName('');
      setDisplayImage('');
      return;
    }

    const role = sessionRole;
    const email = sessionEmail;

    const controller = new AbortController();

    async function loadProfileName() {
      try {
        const profile = await fetchAccountProfile(role, email, controller.signal);
        const fullName = `${profile.firstname} ${profile.lastname}`.trim();
        setDisplayName(fullName || email);
        setDisplayImage(profile.image || '');
      } catch {
        if (!controller.signal.aborted) {
          setDisplayName(email);
          setDisplayImage('');
        }
      }
    }

    void loadProfileName();

    return () => controller.abort();
  }, [sessionEmail, sessionRole]);

  return (
    <main className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand-mark">
          <span className="brand-mark__dot" />
          <div>
            <strong>CourierFlow</strong>
            <span>{formatRole(role)}</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Dashboard services">
          {services.map((service) => (
            <button
              key={service.id}
              type="button"
              className={`sidebar-link ${service.id === activeServiceId ? 'is-active' : ''}`}
              onClick={() => onSelectService(service.id)}
            >
              <img src={service.icon} alt="" />
              <span>{service.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <section className="dashboard-stage">
        <header className="dashboard-header">
          <div className="dashboard-header__side" aria-hidden="true" />

          <div className="dashboard-header__copy">
            <h1>{title}</h1>
          </div>

          <div className="dashboard-toolbar">
            <div className="profile-chip">
              <img src={displayImage || emptyAvatar} alt="" />
              <div>
                <strong>{displayName || 'Account'}</strong>
              </div>
            </div>

            <button type="button" className="ghost-button" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        <section className="dashboard-content">{children}</section>
      </section>
    </main>
  );
}
