import { useEffect, useState } from 'react';
import {
  fetchEmployeeTakenOrders,
  updateEmployeeTakenOrderStatus,
} from '../../api/courierApi';
import { useAuth } from '../../hooks/useAuth';
import type { EmployeeOrder } from '../../types/dashboard';
import { ErrorState } from './ErrorState';

type EmployeeDisplayStatus = {
  label: 'Assigned' | 'Out for delivery' | 'Delivered';
  tone: 'assigned' | 'delivery' | 'delivered';
};

const EMPLOYEE_STATUS_OPTIONS = ['Assigned', 'Out for delivery', 'Delivered'] as const;

function getStatusDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function mapEmployeeStatus(order: EmployeeOrder): EmployeeDisplayStatus {
  const normalizedStatus = order.status.trim().toLowerCase();

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

  return {
    label: 'Assigned',
    tone: 'assigned',
  };
}

export function TakenOrdersPanel() {
  const { session } = useAuth();
  const [orders, setOrders] = useState<EmployeeOrder[]>([]);
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const [actionMessageTone, setActionMessageTone] = useState<'success' | 'error'>('success');
  const [processingTrackingNumber, setProcessingTrackingNumber] = useState<number | null>(null);

  useEffect(() => {
    const sessionEmail = session?.email;

    if (!sessionEmail) {
      setOrders([]);
      setLoadError('Your employee session is missing. Please sign in again.');
      setIsLoading(false);
      return;
    }

    const currentEmail = sessionEmail;
    const controller = new AbortController();

    async function loadOrders() {
      setIsLoading(true);
      setLoadError('');

      try {
        const nextOrders = await fetchEmployeeTakenOrders(currentEmail, controller.signal);
        setOrders(nextOrders);
      } catch (error) {
        if (!controller.signal.aborted) {
          setOrders([]);
          setLoadError(
            error instanceof Error
              ? error.message
              : 'We could not load your taken delivery work right now.',
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadOrders();

    return () => controller.abort();
  }, [session?.email]);

  if (loadError && !orders.length) {
    return <ErrorState title="Taken orders are unavailable" message={loadError} />;
  }

  async function handleStatusUpdate(
    order: EmployeeOrder,
    nextStatus: (typeof EMPLOYEE_STATUS_OPTIONS)[number],
  ) {
    const currentStatus = mapEmployeeStatus(order).label;

    if (currentStatus === nextStatus) {
      return;
    }

    const nextDate = getStatusDate();

    setActionMessage('');
    setProcessingTrackingNumber(order.trackingNumber);

    try {
      await updateEmployeeTakenOrderStatus(order.trackingNumber, nextStatus, nextDate);

      if (nextStatus === 'Delivered') {
        setOrders((currentOrders) =>
          currentOrders.filter((currentOrder) => currentOrder.trackingNumber !== order.trackingNumber),
        );
        setActionMessageTone('success');
        setActionMessage(
          `Order #${order.trackingNumber} was marked as delivered and moved to completed deliveries.`,
        );
      } else {
        setOrders((currentOrders) =>
          currentOrders.map((currentOrder) =>
            currentOrder.trackingNumber === order.trackingNumber
              ? {
                  ...currentOrder,
                  status: nextStatus,
                  date: nextDate,
                }
              : currentOrder,
          ),
        );
        setActionMessageTone('success');
        setActionMessage(
          `Order #${order.trackingNumber} is now marked as ${nextStatus.toLowerCase()}.`,
        );
      }
    } catch (error) {
      setActionMessageTone('error');
      setActionMessage(
        error instanceof Error
          ? error.message
          : 'We could not update this delivery status right now. Please try again.',
      );
    } finally {
      setProcessingTrackingNumber(null);
    }
  }

  return (
    <section className="service-card orders-panel orders-panel--compact">
      <div className="service-card__header orders-panel__header">
        <div>
          <span className="section-label">Taken orders</span>
        </div>
      </div>

      {isLoading ? <p className="panel-note">Loading your taken delivery work...</p> : null}
      {loadError && orders.length ? <p className="form-message is-error">{loadError}</p> : null}
      {actionMessage ? (
        <p className={`form-message ${actionMessageTone === 'success' ? 'is-success' : 'is-error'}`}>
          {actionMessage}
        </p>
      ) : null}

      {!isLoading && !orders.length ? (
        <div className="orders-empty-state">
          <span className="section-label">Nothing assigned</span>
          <h4>No taken orders right now</h4>
          <p>Orders you claim from available work will move here for delivery updates.</p>
        </div>
      ) : null}

      {orders.length ? (
        <div className="orders-grid">
          {orders.map((order) => {
            const displayStatus = mapEmployeeStatus(order);

            return (
              <article key={order.trackingNumber} className="order-card">
                <div className="order-card__top">
                  <div className="order-card__route">
                    <strong>
                      {order.from_place} to {order.to_place}
                    </strong>
                    <div className="order-card__subline">
                      <span>Tracking ID: {order.trackingNumber}</span>
                      <span>{order.date}</span>
                    </div>
                  </div>

                  <span className={`status-pill is-${displayStatus.tone}`}>{displayStatus.label}</span>
                </div>

                <div className="order-meta-grid order-meta-grid--employee">
                  <div className="order-meta-card order-meta-card--pickup">
                    <span>Pickup contact</span>
                    <strong>
                      {order.from_name} | {order.from_phone}
                    </strong>
                  </div>
                  <div className="order-meta-card order-meta-card--receiver">
                    <span>Receiver contact</span>
                    <strong>
                      {order.to_name} | {order.to_phone}
                    </strong>
                  </div>
                  <div className="order-meta-card order-meta-card--parcel">
                    <span>Parcel</span>
                    <strong>{order.item}</strong>
                  </div>
                </div>

                <div className="order-address-grid">
                  <div className="order-address-card">
                    <span className="section-label">Pickup address</span>
                    <p>{order.from_address}</p>
                  </div>
                  <div className="order-address-card">
                    <span className="section-label">Receiver address</span>
                    <p>{order.to_address}</p>
                  </div>
                </div>

                <div className="order-card__actions">
                  <label className="order-status-select">
                    <span>Update status</span>
                    <select
                      value={displayStatus.label}
                      onChange={(event) =>
                        void handleStatusUpdate(
                          order,
                          event.target.value as (typeof EMPLOYEE_STATUS_OPTIONS)[number],
                        )
                      }
                      disabled={processingTrackingNumber === order.trackingNumber}
                    >
                      {EMPLOYEE_STATUS_OPTIONS.map((statusOption) => (
                        <option key={statusOption} value={statusOption}>
                          {statusOption}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
