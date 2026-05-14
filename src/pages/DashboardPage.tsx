import { useState } from 'react';
import { ActiveOrdersPanel } from '../components/dashboard/ActiveOrdersPanel';
import { AppShell } from '../components/dashboard/AppShell';
import { BookCourierPanel } from '../components/dashboard/BookCourierPanel';
import { CancelledOrdersPanel } from '../components/dashboard/CancelledOrdersPanel';
import { CompletedOrdersPanel } from '../components/dashboard/CompletedOrdersPanel';
import { PlaceholderPanel } from '../components/dashboard/PlaceholderPanel';
import { ProfilePanel } from '../components/dashboard/ProfilePanel';
import { dashboardContent } from '../content/dashboardContent';
import type { AuthRole } from '../types/auth';
import type { DashboardServiceId } from '../types/dashboard';

type DashboardPageProps = {
  role: AuthRole;
};

export function DashboardPage({ role }: DashboardPageProps) {
  const content = dashboardContent[role];
  const [activeServiceId, setActiveServiceId] = useState<DashboardServiceId>(content.services[0].id);

  const activeService =
    content.services.find((service) => service.id === activeServiceId) || content.services[0];

  function renderPanel() {
    if (role === 'user' && activeServiceId === 'book-courier') {
      return <BookCourierPanel />;
    }

    if (role === 'user' && activeServiceId === 'active-orders') {
      return <ActiveOrdersPanel />;
    }

    if (role === 'user' && activeServiceId === 'completed-orders') {
      return <CompletedOrdersPanel />;
    }

    if (role === 'user' && activeServiceId === 'cancelled-orders') {
      return <CancelledOrdersPanel />;
    }

    if (role === 'user' && activeServiceId === 'profile') {
      return <ProfilePanel />;
    }

    return (
      <PlaceholderPanel
        title={activeService.label}
        description={`${activeService.description} This panel is now framed inside the shared dashboard shell and ready for the next backend-connected step.`}
        image={activeService.image}
      />
    );
  }

  return (
    <AppShell
      role={role}
      title={content.title}
      services={content.services}
      activeServiceId={activeServiceId}
      onSelectService={setActiveServiceId}
    >
      {renderPanel()}
    </AppShell>
  );
}
