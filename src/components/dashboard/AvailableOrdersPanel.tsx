import { useEffect, useState } from 'react';
import { claimEmployeeOrder, fetchEmployeeAvailableOrders } from '../../api/courierApi';
import { useAuth } from '../../hooks/useAuth';
import type { UserOrder } from '../../types/dashboard';
import { ErrorState } from './ErrorState';

function getAssignmentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function AvailableOrdersPanel() {
  const { session } = useAuth();
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const [actionMessageTone, setActionMessageTone] = useState<'success' | 'error'>('success');
  const [processingTrackingNumber, setProcessingTrackingNumber] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadOrders() {
      setIsLoading(true);
      setLoadError('');

      try {
        const nextOrders = await fetchEmployeeAvailableOrders(controller.signal);
        setOrders(nextOrders);
      } catch (error) {
        if (!controller.signal.aborted) {
          setOrders([]);
          setLoadError(
            error instanceof Error
              ? error.message
              : 'We could not load available delivery work right now.',
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
  }, []);

  if (loadError && !orders.length) {
    return <ErrorState title="Available orders are unavailable" message={loadError} />;
  }

  async function handleTakeOrder(order: UserOrder) {
    const employeeEmail = session?.email;

    if (!employeeEmail) {
      setActionMessageTone('error');
      setActionMessage('Your employee session is missing. Please sign in again.');
      return;
    }

    setActionMessage('');
    setProcessingTrackingNumber(order.trackingNumber);

    try {
      await claimEmployeeOrder(order, employeeEmail, getAssignmentDate());
      setOrders((currentOrders) =>
        currentOrders.filter((currentOrder) => currentOrder.trackingNumber !== order.trackingNumber),
      );
      setActionMessageTone('success');
      setActionMessage(
        `Order #${order.trackingNumber} has been assigned to you and moved into your taken orders.`,
      );
    } catch (error) {
      setActionMessageTone('error');
      setActionMessage(
        error instanceof Error
          ? error.message
          : 'We could not assign this order right now. Please try again.',
      );
    } finally {
      setProcessingTrackingNumber(null);
    }
  }

  return (
    <section className="service-card orders-panel">
      <div className="service-card__header orders-panel__header">
        <div>
          <span className="section-label">Available orders</span>
        </div>
      </div>

      {isLoading ? <p className="panel-note">Loading available delivery work...</p> : null}
      {loadError && orders.length ? <p className="form-message is-error">{loadError}</p> : null}
      {actionMessage ? (
        <p className={`form-message ${actionMessageTone === 'success' ? 'is-success' : 'is-error'}`}>
          {actionMessage}
        </p>
      ) : null}

      {!isLoading && !orders.length ? (
        <div className="orders-empty-state">
          <span className="section-label">Nothing available</span>
          <h4>No orders are ready to claim</h4>
          <p>New delivery work will appear here as soon as customers create bookings.</p>
        </div>
      ) : null}

      {orders.length ? (
        <div className="orders-grid">
          {orders.map((order) => (
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

                <span className="status-pill is-available">Available</span>
              </div>

              <div className="order-meta-grid">
                <div>
                  <span>Pickup contact</span>
                  <strong>
                    {order.from_name} | {order.from_phone}
                  </strong>
                </div>
                <div>
                  <span>Receiver contact</span>
                  <strong>
                    {order.to_name} | {order.to_phone}
                  </strong>
                </div>
                <div>
                  <span>Parcel</span>
                  <strong>{order.item}</strong>
                </div>
                <div>
                  <span>Customer</span>
                  <strong>{order.email}</strong>
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
                  className="primary-button order-card__button"
                  onClick={() => void handleTakeOrder(order)}
                  disabled={processingTrackingNumber === order.trackingNumber}
                >
                  {processingTrackingNumber === order.trackingNumber ? 'Assigning...' : 'Take order'}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
