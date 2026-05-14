import type { UserOrder } from '../../types/dashboard';

export type DisplayStatusTone = 'booked' | 'assigned' | 'delivery' | 'delivered';

export type DisplayStatus = {
  label: 'Booked' | 'Assigned' | 'Out for delivery' | 'Delivered';
  tone: DisplayStatusTone;
};

export function mapUserStatus(order: UserOrder): DisplayStatus {
  const normalizedStatus = order.status.trim().toLowerCase();
  const normalizedOrderStatus = order.order_status.trim().toLowerCase();

  if (normalizedStatus.includes('delivered')) {
    return {
      label: 'Delivered',
      tone: 'delivered',
    };
  }

  if (
    normalizedStatus.includes('out for delivery') ||
    normalizedStatus.includes('in transit') ||
    normalizedStatus.includes('dispatched')
  ) {
    return {
      label: 'Out for delivery',
      tone: 'delivery',
    };
  }

  if (normalizedStatus.includes('assigned') || normalizedOrderStatus === 'taken') {
    return {
      label: 'Assigned',
      tone: 'assigned',
    };
  }

  return {
    label: 'Booked',
    tone: 'booked',
  };
}
