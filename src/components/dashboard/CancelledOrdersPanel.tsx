import { useEffect, useState } from 'react';
import { fetchUserCancelledOrders } from '../../api/courierApi';
import { useAuth } from '../../hooks/useAuth';
import type { CancelledOrder } from '../../types/dashboard';
import { ErrorState } from './ErrorState';

export function CancelledOrdersPanel() {
  const { session } = useAuth();
  const [orders, setOrders] = useState<CancelledOrder[]>([]);
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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
        const nextOrders = await fetchUserCancelledOrders(currentEmail, controller.signal);
        setOrders(nextOrders);
      } catch (error) {
        if (!controller.signal.aborted) {
          setOrders([]);
          setLoadError(
            error instanceof Error
              ? error.message
              : 'We could not load your cancelled courier orders right now.',
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
    return <ErrorState title="Cancelled orders are unavailable" message={loadError} />;
  }

  return (
    <section className="service-card orders-panel">
      <div className="service-card__header orders-panel__header">
        <div>
          <span className="section-label">Cancelled orders</span>
        </div>
      </div>

      {isLoading ? <p className="panel-note">Loading your cancelled orders...</p> : null}
      {loadError && orders.length ? <p className="form-message is-error">{loadError}</p> : null}

      {!isLoading && !orders.length ? (
        <div className="orders-empty-state">
          <span className="section-label">Nothing cancelled</span>
          <h4>No cancelled orders yet</h4>
          <p>Orders you cancel before delivery will appear here.</p>
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
                  </div>
                </div>

                <span className="status-pill is-cancelled">Cancelled</span>
              </div>

              <div className="order-meta-grid">
                <div>
                  <span>Status</span>
                  <strong>Cancelled</strong>
                </div>
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
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
