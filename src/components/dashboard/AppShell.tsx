import type { PropsWithChildren } from 'react';
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
  const activeService =
    services.find((service) => service.id === activeServiceId) || services[0];

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
          <div className="dashboard-header__copy">
            <span className="eyebrow">{formatRole(role)}</span>
            <h1>{title}</h1>
          </div>

          <div className="dashboard-toolbar">
            <div className="profile-chip">
              <img src={emptyAvatar} alt="" />
              <div>
                <strong>{session?.email}</strong>
                <span>{session?.role}</span>
              </div>
            </div>

            <button type="button" className="ghost-button" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        <section className="dashboard-banner">
          <img src={activeService.image} alt="" className="dashboard-banner__image" />
          <div>
            <span className="section-label">Selected service</span>
            <h2>{activeService.label}</h2>
          </div>
        </section>

        <section className="dashboard-content">{children}</section>
      </section>
    </main>
  );
}
