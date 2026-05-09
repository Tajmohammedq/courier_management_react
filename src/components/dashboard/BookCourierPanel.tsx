import { useEffect, useState } from 'react';
import { createCourierOrder, fetchDestinations, fetchOrigins, fetchRouteQuote } from '../../api/courierApi';
import { useAuth } from '../../hooks/useAuth';
import type { CourierRouteQuote } from '../../types/dashboard';
import { ErrorState } from './ErrorState';

type BookingFormState = {
  fromPlace: string;
  toPlace: string;
  fromName: string;
  fromPhone: string;
  fromAddress: string;
  toName: string;
  toPhone: string;
  toAddress: string;
  item: string;
};

const INITIAL_FORM_STATE: BookingFormState = {
  fromPlace: '',
  toPlace: '',
  fromName: '',
  fromPhone: '',
  fromAddress: '',
  toName: '',
  toPhone: '',
  toAddress: '',
  item: '',
};

function buildTodayLabel() {
  return new Date().toISOString().slice(0, 10);
}

export function BookCourierPanel() {
  const { session } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [origins, setOrigins] = useState<string[]>([]);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [loadError, setLoadError] = useState('');
  const [routeQuote, setRouteQuote] = useState<CourierRouteQuote | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof BookingFormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  useEffect(() => {
    const controller = new AbortController();

    async function loadOrigins() {
      setIsBootstrapping(true);
      setLoadError('');

      try {
        const nextOrigins = await fetchOrigins(controller.signal);
        setOrigins(nextOrigins);
        setForm((current) => ({
          ...current,
          fromPlace: current.fromPlace || nextOrigins[0] || '',
        }));
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : 'We could not load booking routes right now.',
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsBootstrapping(false);
        }
      }
    }

    void loadOrigins();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!form.fromPlace) {
      setDestinations([]);
      return;
    }

    const controller = new AbortController();

    async function loadDestinations() {
      setLoadError('');
      setDestinations([]);
      setRouteQuote(null);

      try {
        const nextDestinations = await fetchDestinations(form.fromPlace, controller.signal);
        setDestinations(nextDestinations);
        setForm((current) => ({
          ...current,
          toPlace: nextDestinations.includes(current.toPlace) ? current.toPlace : nextDestinations[0] || '',
        }));
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : 'We could not load destinations for this origin.',
        );
      }
    }

    void loadDestinations();

    return () => controller.abort();
  }, [form.fromPlace]);

  useEffect(() => {
    if (!form.fromPlace || !form.toPlace) {
      setRouteQuote(null);
      return;
    }

    const controller = new AbortController();

    async function loadQuote() {
      setRouteLoading(true);
      setRouteQuote(null);

      try {
        const nextQuote = await fetchRouteQuote(form.fromPlace, form.toPlace, controller.signal);
        setRouteQuote(nextQuote);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setRouteQuote({
          canDeliver: false,
          message:
            error instanceof Error
              ? error.message
              : 'We could not confirm this route right now.',
          price: null,
        });
      } finally {
        if (!controller.signal.aborted) {
          setRouteLoading(false);
        }
      }
    }

    void loadQuote();

    return () => controller.abort();
  }, [form.fromPlace, form.toPlace]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError('');
    setSubmitMessage('');

    if (!session?.email) {
      setSubmitError('Your session is missing. Please sign in again.');
      return;
    }

    if (!routeQuote?.canDeliver) {
      setSubmitError('Please choose a route that can be delivered before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      await createCourierOrder({
        email: session.email,
        from_place: form.fromPlace,
        from_name: form.fromName.trim(),
        from_phone: form.fromPhone.trim(),
        from_address: form.fromAddress.trim(),
        to_place: form.toPlace,
        to_name: form.toName.trim(),
        to_phone: form.toPhone.trim(),
        to_address: form.toAddress.trim(),
        item: form.item.trim(),
        status: 'Booked',
        order_status: 'Pending',
        date: buildTodayLabel(),
      });

      setSubmitMessage('Courier booked successfully. You can review it in Active Orders next.');
      setForm((current) => ({
        ...INITIAL_FORM_STATE,
        fromPlace: current.fromPlace,
        toPlace: current.toPlace,
      }));
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'We could not create the courier order right now.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loadError && !origins.length) {
    return (
      <ErrorState
        title="Booking data is unavailable"
        message={loadError}
      />
    );
  }

  return (
    <section className="service-grid">
      <article className="service-card booking-card">
        <div className="service-card__header">
          <div>
            <span className="section-label">First service</span>
            <h3>Book Courier</h3>
            <p>Pick a route, confirm price availability, and submit the shipment in one flow.</p>
          </div>
          <div className="booking-pill-group">
            <span className="placeholder-pill">{session?.email}</span>
            <span className="placeholder-pill">Date {buildTodayLabel()}</span>
          </div>
        </div>

        {isBootstrapping ? (
          <p className="panel-note">Loading available routes...</p>
        ) : null}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="field">
              <span>From location</span>
              <select
                value={form.fromPlace}
                onChange={(event) => updateField('fromPlace', event.target.value)}
                required
              >
                <option value="">Select origin</option>
                {origins.map((origin) => (
                  <option key={origin} value={origin}>
                    {origin}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>To location</span>
              <select
                value={form.toPlace}
                onChange={(event) => updateField('toPlace', event.target.value)}
                required
              >
                <option value="">Select destination</option>
                {destinations.map((destination) => (
                  <option key={destination} value={destination}>
                    {destination}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Sender name</span>
              <input
                value={form.fromName}
                onChange={(event) => updateField('fromName', event.target.value)}
                placeholder="Enter pickup contact name"
                required
              />
            </label>

            <label className="field">
              <span>Sender phone</span>
              <input
                value={form.fromPhone}
                onChange={(event) => updateField('fromPhone', event.target.value)}
                placeholder="Enter pickup phone number"
                required
              />
            </label>

            <label className="field field--full">
              <span>Sender address</span>
              <input
                value={form.fromAddress}
                onChange={(event) => updateField('fromAddress', event.target.value)}
                placeholder="Enter the pickup address"
                required
              />
            </label>

            <label className="field">
              <span>Receiver name</span>
              <input
                value={form.toName}
                onChange={(event) => updateField('toName', event.target.value)}
                placeholder="Enter receiver name"
                required
              />
            </label>

            <label className="field">
              <span>Receiver phone</span>
              <input
                value={form.toPhone}
                onChange={(event) => updateField('toPhone', event.target.value)}
                placeholder="Enter receiver phone number"
                required
              />
            </label>

            <label className="field field--full">
              <span>Receiver address</span>
              <input
                value={form.toAddress}
                onChange={(event) => updateField('toAddress', event.target.value)}
                placeholder="Enter the delivery address"
                required
              />
            </label>

            <label className="field field--full">
              <span>Parcel details</span>
              <input
                value={form.item}
                onChange={(event) => updateField('item', event.target.value)}
                placeholder="Describe the item being shipped"
                required
              />
            </label>
          </div>

          {submitError ? <p className="form-message is-error">{submitError}</p> : null}
          {submitMessage ? <p className="form-message is-success">{submitMessage}</p> : null}

          <button type="submit" className="primary-button" disabled={isSubmitting || isBootstrapping}>
            {isSubmitting ? 'Creating booking...' : 'Create courier booking'}
          </button>
        </form>
      </article>

      <article className="service-card booking-summary">
        <span className="section-label">Route check</span>
        <h3>Availability and estimate</h3>
        <p>We check the selected origin and destination before the order is submitted.</p>

        {routeLoading ? <p className="panel-note">Checking route availability...</p> : null}

        {routeQuote ? (
          <div className={`quote-card ${routeQuote.canDeliver ? 'is-ready' : 'is-blocked'}`}>
            <strong>{routeQuote.canDeliver ? 'Route available' : 'Route unavailable'}</strong>
            <p>{routeQuote.message}</p>
            <span>
              Estimated price:{' '}
              <b>{routeQuote.price !== null ? `Rs. ${routeQuote.price}` : 'Not available'}</b>
            </span>
          </div>
        ) : (
          <div className="quote-card">
            <strong>Choose a route</strong>
            <p>Select both locations to fetch delivery availability and price.</p>
          </div>
        )}

        {loadError && origins.length ? (
          <p className="form-message is-error">{loadError}</p>
        ) : null}
      </article>
    </section>
  );
}
