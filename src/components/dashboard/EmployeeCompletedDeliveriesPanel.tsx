import { useEffect, useState } from 'react';
import { fetchEmployeeCompletedOrders } from '../../api/courierApi';
import { useAuth } from '../../hooks/useAuth';
import type { EmployeeOrder } from '../../types/dashboard';
import { ErrorState } from './ErrorState';

export function EmployeeCompletedDeliveriesPanel() {
  const { session } = useAuth();
  const [orders, setOrders] = useState<EmployeeOrder[]>([]);
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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
        const nextOrders = await fetchEmployeeCompletedOrders(currentEmail, controller.signal);
        setOrders(nextOrders);
      } catch (error) {
        if (!controller.signal.aborted) {
          setOrders([]);
          setLoadError(
            error instanceof Error
              ? error.message
              : 'We could not load your completed deliveries right now.',
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
    return <ErrorState title="Completed deliveries are unavailable" message={loadError} />;
  }

  return (
    <section className="service-card orders-panel orders-panel--compact">
      <div className="service-card__header orders-panel__header">
        <div>
          <span className="section-label">Completed deliveries</span>
        </div>
      </div>

      {isLoading ? <p className="panel-note">Loading your completed deliveries...</p> : null}
      {loadError && orders.length ? <p className="form-message is-error">{loadError}</p> : null}

      {!isLoading && !orders.length ? (
        <div className="orders-empty-state">
          <span className="section-label">Nothing delivered</span>
          <h4>No completed deliveries yet</h4>
          <p>Orders you finish as delivered will appear here.</p>
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

                <span className="status-pill is-delivered">Delivered</span>
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
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
