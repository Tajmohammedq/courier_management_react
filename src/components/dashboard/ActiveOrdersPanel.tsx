import { useEffect, useState } from 'react';
import {
  fetchUserActiveOrders,
  removeTakenOrder,
  removeUserOrder,
  saveCancelledOrder,
} from '../../api/courierApi';
import { useAuth } from '../../hooks/useAuth';
import type { UserOrder } from '../../types/dashboard';
import { ErrorState } from './ErrorState';

type DisplayStatusTone = 'booked' | 'assigned' | 'delivery' | 'delivered';

type DisplayStatus = {
  label: 'Booked' | 'Assigned' | 'Out for delivery' | 'Delivered';
  tone: DisplayStatusTone;
};

function mapUserStatus(order: UserOrder): DisplayStatus {
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

export function ActiveOrdersPanel() {
  const { session } = useAuth();
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const [actionMessageTone, setActionMessageTone] = useState<'success' | 'error'>('success');
  const [processingTrackingNumber, setProcessingTrackingNumber] = useState<number | null>(null);

  useEffect(() => {
    const sessionEmail = session?.email;

    if (!sessionEmail) {
      setOrders([]);
      setLoadError('Your session is missing. Please sign in again.');
      setIsLoading(false);
      return;
    }

    const currentEmail = sessionEmail;

    const controller = new AbortController();

    async function loadOrders() {
      setIsLoading(true);
      setLoadError('');

      try {
        const nextOrders = await fetchUserActiveOrders(currentEmail, controller.signal);
        setOrders(nextOrders);
      } catch (error) {
        if (!controller.signal.aborted) {
          setOrders([]);
          setLoadError(
            error instanceof Error
              ? error.message
              : 'We could not load your active courier orders right now.',
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
    return <ErrorState title="Active orders are unavailable" message={loadError} />;
  }

  async function handleCancel(order: UserOrder) {
    const displayStatus = mapUserStatus(order);

    if (displayStatus.label === 'Out for delivery') {
      setActionMessageTone('error');
      setActionMessage(
        `Order #${order.trackingNumber} is already out for delivery, so it can no longer be canceled online.`,
      );
      return;
    }

    setActionMessage('');
    setProcessingTrackingNumber(order.trackingNumber);

    try {
      await saveCancelledOrder({
        trackingNumber: order.trackingNumber,
        email: order.email,
        from_place: order.from_place,
        from_name: order.from_name,
        from_phone: order.from_phone,
        from_address: order.from_address,
        to_place: order.to_place,
        to_name: order.to_name,
        to_phone: order.to_phone,
        to_address: order.to_address,
        item: order.item,
        status: order.status,
        order_status: order.order_status,
      });

      if (order.order_status.trim().toLowerCase() === 'taken') {
        await removeTakenOrder(order.trackingNumber);
      }

      await removeUserOrder(order.trackingNumber);
      setOrders((currentOrders) =>
        currentOrders.filter((currentOrder) => currentOrder.trackingNumber !== order.trackingNumber),
      );
      setActionMessageTone('success');
      setActionMessage(
        `Order #${order.trackingNumber} was canceled successfully and removed from your active orders.`,
      );
    } catch (error) {
      setActionMessageTone('error');
      setActionMessage(
        error instanceof Error
          ? error.message
          : 'We could not cancel this order right now. Please try again.',
      );
    } finally {
      setProcessingTrackingNumber(null);
    }
  }

  return (
    <section className="service-card orders-panel">
      <div className="service-card__header orders-panel__header">
        <div>
          <span className="section-label">Active orders</span>
          <h3>Track current shipments</h3>
          <p>See every parcel that is booked, assigned, or already out for delivery.</p>
        </div>
      </div>

      {isLoading ? <p className="panel-note">Loading your active orders...</p> : null}
      {loadError && orders.length ? <p className="form-message is-error">{loadError}</p> : null}
      {actionMessage ? (
        <p className={`form-message ${actionMessageTone === 'success' ? 'is-success' : 'is-error'}`}>
          {actionMessage}
        </p>
      ) : null}

      {!isLoading && !orders.length ? (
        <div className="orders-empty-state">
          <span className="section-label">Nothing active</span>
          <h4>No active orders right now</h4>
          <p>New bookings will appear here until they move into completed deliveries.</p>
        </div>
      ) : null}

      {orders.length ? (
        <div className="orders-grid">
          {orders.map((order) => {
            const displayStatus = mapUserStatus(order);

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

                <div className="order-meta-grid">
                  <div>
                    <span>Receiver</span>
                    <strong>{order.to_name}</strong>
                  </div>
                  <div>
                    <span>Receiver phone</span>
                    <strong>{order.to_phone}</strong>
                  </div>
                  <div>
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
                  <button
                    type="button"
                    className="ghost-button order-card__button"
                    onClick={() => void handleCancel(order)}
                    disabled={processingTrackingNumber === order.trackingNumber}
                  >
                    {processingTrackingNumber === order.trackingNumber ? 'Cancelling...' : 'Cancel order'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
