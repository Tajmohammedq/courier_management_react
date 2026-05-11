import { Link, Navigate } from 'react-router-dom';
import { loadBookingDraft } from '../utils/bookingDraftStorage';

export function PaymentPage() {
  const draft = loadBookingDraft();

  if (!draft) {
    return <Navigate to="/dashboard/user" replace />;
  }

  return (
    <main className="placeholder-shell">
      <section className="placeholder-card success-card">
        <span className="eyebrow">Payment</span>
        <h1>Payment page ready</h1>
        <p>The booking draft has been carried forward. Payment summary and payment actions can be built here next.</p>

        <div className="session-summary">
          <div>
            <span className="section-label">Route</span>
            <p>{draft.fromPlace} to {draft.toPlace}</p>
          </div>
          <div>
            <span className="section-label">Estimate</span>
            <p>Rs. {draft.estimatedPrice.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="placeholder-actions">
          <Link className="quick-link" to="/dashboard/user">
            Back to booking
          </Link>
        </div>
      </section>
    </main>
  );
}
