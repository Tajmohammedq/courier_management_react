import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { createCourierOrder } from '../api/courierApi';
import { fetchPricingQuote } from '../api/pricingApi';
import type { PricingQuote } from '../types/dashboard';
import { clearBookingDraft, loadBookingDraft } from '../utils/bookingDraftStorage';
import { getDashboardPath } from '../utils/routing';

type WeightSlabOption = {
  value: string;
  label: string;
};

const WEIGHT_SLABS: WeightSlabOption[] = [
  { value: 'up-to-500g', label: 'Up to 500 g' },
  { value: '500g-to-2kg', label: '500 g to 2 kg' },
  { value: '2kg-to-5kg', label: '2 kg to 5 kg' },
  { value: '5kg-to-10kg', label: '5 kg to 10 kg' },
];

function formatCurrency(value: number) {
  return `Rs. ${value.toLocaleString('en-IN')}`;
}

export function PaymentPage() {
  const navigate = useNavigate();
  const [draft] = useState(() => loadBookingDraft());
  const [weightSlab, setWeightSlab] = useState('');
  const [quote, setQuote] = useState<PricingQuote | null>(null);
  const [quoteError, setQuoteError] = useState('');
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const currentDraft = draft;

    if (!currentDraft || !weightSlab) {
      setQuote(null);
      setQuoteError('');
      return;
    }

    const quoteDraft = currentDraft;

    const controller = new AbortController();

    async function loadQuote() {
      setIsLoadingQuote(true);
      setQuoteError('');

      try {
        const nextQuote = await fetchPricingQuote(
          {
            fromPlace: quoteDraft.fromPlace,
            toPlace: quoteDraft.toPlace,
            parcelType: quoteDraft.parcelType,
            weightSlab,
          },
          controller.signal,
        );

        setQuote(nextQuote);
      } catch (error) {
        if (!controller.signal.aborted) {
          setQuote(null);
          setQuoteError(
            error instanceof Error ? error.message : 'We could not calculate the payment total.',
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingQuote(false);
        }
      }
    }

    void loadQuote();

    return () => controller.abort();
  }, [draft, weightSlab]);

  if (!draft) {
    return <Navigate to="/dashboard/user" replace />;
  }

  const currentDraft = draft;

  const selectedWeightSlab =
    WEIGHT_SLABS.find((option) => option.value === weightSlab)?.label ?? 'Not selected';

  async function handlePayment() {
    if (!quote || !weightSlab) {
      setPaymentError('Select the weight slab and load the pricing quote before continuing.');
      return;
    }

    setPaymentError('');
    setIsSubmittingPayment(true);

    try {
      await createCourierOrder({
        email: currentDraft.email,
        from_place: currentDraft.fromPlace,
        from_name: currentDraft.accountName,
        from_phone: currentDraft.pickupPhone,
        from_address: currentDraft.pickupAddress,
        to_place: currentDraft.toPlace,
        to_name: currentDraft.receiverName,
        to_phone: currentDraft.receiverPhone,
        to_address: currentDraft.receiverAddress,
        item: `${currentDraft.parcelLabel} | ${selectedWeightSlab}`,
        status: 'Booked',
        order_status: 'Not Taken',
        date: currentDraft.bookingDate,
      });

      clearBookingDraft();
      setShowSuccessModal(true);
    } catch (error) {
      setPaymentError(
        error instanceof Error ? error.message : 'We could not submit the payment right now.',
      );
    } finally {
      setIsSubmittingPayment(false);
    }
  }

  return (
    <>
      <main className="placeholder-shell payment-shell">
        <section className="placeholder-card payment-card">
          <div className="payment-card__header">
            <div>
              <span className="eyebrow">Payment</span>
              <h1>Review payment summary</h1>
              <p>
                Confirm the delivery details, choose the weight slab, and then submit the final
                payment.
              </p>
            </div>

            <Link className="quick-link" to="/dashboard/user">
              Back to booking
            </Link>
          </div>

          <div className="payment-layout">
            <section className="payment-panel">
              <span className="section-label">Booking summary</span>

              <div className="payment-summary-grid">
                <article className="payment-summary-card">
                  <span>Route</span>
                  <strong>
                    {currentDraft.fromPlace} to {currentDraft.toPlace}
                  </strong>
                </article>

                <article className="payment-summary-card">
                  <span>Parcel type</span>
                  <strong>{currentDraft.parcelLabel}</strong>
                </article>

                <article className="payment-summary-card">
                  <span>Pickup phone</span>
                  <strong>{currentDraft.pickupPhone}</strong>
                </article>

                <article className="payment-summary-card">
                  <span>Receiver</span>
                  <strong>{currentDraft.receiverName}</strong>
                </article>
              </div>

              <div className="quote-card payment-selection-card">
                <span className="section-label">Current selection</span>
                <p>
                  Parcel: <strong>{currentDraft.parcelLabel}</strong>
                </p>
                <p>
                  Weight: <strong>{selectedWeightSlab}</strong>
                </p>
              </div>

              <div className="session-summary">
                <div>
                  <span className="section-label">Pickup address</span>
                  <p>{currentDraft.pickupAddress}</p>
                </div>
                <div>
                  <span className="section-label">Receiver address</span>
                  <p>{currentDraft.receiverAddress}</p>
                </div>
              </div>
            </section>

            <section className="payment-panel payment-panel--quote">
              <span className="section-label">Pricing quote</span>

              <label className="field">
                <span>Weight slab</span>
                <select value={weightSlab} onChange={(event) => setWeightSlab(event.target.value)}>
                  <option value="">Select weight slab</option>
                  {WEIGHT_SLABS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {isLoadingQuote ? <p className="panel-note">Calculating payment total...</p> : null}
              {quoteError ? <p className="form-message is-error">{quoteError}</p> : null}
              {paymentError ? <p className="form-message is-error">{paymentError}</p> : null}

              {!weightSlab && !quoteError ? (
                <div className="quote-card">
                  <p>Select the parcel weight slab to load the payment total.</p>
                </div>
              ) : null}

              {quote ? (
                <>
                  <div className="payment-breakdown">
                    <div className="summary-row">
                      <span>Distance</span>
                      <strong>{quote.distance} km</strong>
                    </div>
                    <div className="summary-row">
                      <span>Base fee</span>
                      <strong>{formatCurrency(quote.baseFee)}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Route charge</span>
                      <strong>{formatCurrency(quote.distanceCharge)}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Parcel handling</span>
                      <strong>{formatCurrency(quote.parcelTypeCharge)}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Weight charge</span>
                      <strong>{formatCurrency(quote.weightCharge)}</strong>
                    </div>
                    <div className="payment-total">
                      <span>Total payable</span>
                      <strong>{formatCurrency(quote.total)}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="primary-button payment-submit"
                    onClick={handlePayment}
                    disabled={isSubmittingPayment || isLoadingQuote}
                  >
                    {isSubmittingPayment ? 'Submitting payment...' : 'Complete Payment'}
                  </button>
                </>
              ) : null}
            </section>
          </div>
        </section>
      </main>

      {showSuccessModal ? (
        <div className="booking-modal-backdrop" role="dialog" aria-modal="true">
          <div className="booking-modal">
            <span className="section-label">Payment submitted</span>
            <h3>Order saved successfully</h3>
            <p>
              Your payment has been submitted and the courier order is now saved in the system.
            </p>

            <div className="booking-modal__actions">
              <button
                type="button"
                className="primary-button"
                onClick={() => navigate(getDashboardPath('user'))}
              >
                Back to workspace
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
