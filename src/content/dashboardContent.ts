import bookCourier from '../assets/dashboard/book-courier.svg';
import activeOrders from '../assets/dashboard/active-orders.svg';
import completedOrders from '../assets/dashboard/completed-orders.svg';
import cancelledOrders from '../assets/dashboard/cancelled-orders.svg';
import profileCard from '../assets/dashboard/profile-card.svg';
import availableOrders from '../assets/dashboard/available-orders.svg';
import takenOrders from '../assets/dashboard/taken-orders.svg';
import completedDeliveries from '../assets/dashboard/completed-deliveries.svg';
import type { DashboardRole, DashboardService } from '../types/dashboard';

export const dashboardContent = {
  user: {
    title: 'Courier customer workspace',
    subtitle: 'Book shipments, review routes, and keep every order moving from one clear control panel.',
    services: [
      {
        id: 'book-courier',
        label: 'Book Courier',
        shortLabel: 'Book',
        description: 'Create a new shipment and confirm the route before you submit it.',
        icon: bookCourier,
        image: bookCourier,
      },
      {
        id: 'active-orders',
        label: 'Active Orders',
        shortLabel: 'Active',
        description: 'Track parcels that are booked, assigned, or in transit.',
        icon: activeOrders,
        image: activeOrders,
      },
      {
        id: 'completed-orders',
        label: 'Completed Orders',
        shortLabel: 'Done',
        description: 'Review the deliveries that have already reached their destination.',
        icon: completedOrders,
        image: completedOrders,
      },
      {
        id: 'cancelled-orders',
        label: 'Cancelled Orders',
        shortLabel: 'Cancelled',
        description: 'See shipments that were withdrawn before delivery was completed.',
        icon: cancelledOrders,
        image: cancelledOrders,
      },
      {
        id: 'profile',
        label: 'Profile',
        shortLabel: 'Profile',
        description: 'Update account details, contact information, and avatar later on.',
        icon: profileCard,
        image: profileCard,
      },
    ] satisfies DashboardService[],
  },
  employee: {
    title: 'Courier operations workspace',
    subtitle: 'Claim work, manage active deliveries, and finish route updates from the same shell.',
    services: [
      {
        id: 'available-orders',
        label: 'Available Orders',
        shortLabel: 'Available',
        description: 'Review open delivery work waiting to be claimed.',
        icon: availableOrders,
        image: availableOrders,
      },
      {
        id: 'taken-orders',
        label: 'Taken Orders',
        shortLabel: 'Taken',
        description: 'Manage the orders already assigned to the current employee.',
        icon: takenOrders,
        image: takenOrders,
      },
      {
        id: 'completed-deliveries',
        label: 'Completed Deliveries',
        shortLabel: 'Completed',
        description: 'Look back at successfully closed delivery work.',
        icon: completedDeliveries,
        image: completedDeliveries,
      },
      {
        id: 'profile',
        label: 'Profile',
        shortLabel: 'Profile',
        description: 'Keep employee contact details and profile information current.',
        icon: profileCard,
        image: profileCard,
      },
    ] satisfies DashboardService[],
  },
} satisfies Record<DashboardRole, { title: string; subtitle: string; services: DashboardService[] }>;
