import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRoutes } from '../../api/courierApi';
import { fetchAccountProfile } from '../../api/profileApi';
import { useAuth } from '../../hooks/useAuth';
import type { BookingDraft, CourierRouteOption } from '../../types/dashboard';
import { saveBookingDraft } from '../../utils/bookingDraftStorage';
import { getPaymentPath } from '../../utils/routing';
import { ErrorState } from './ErrorState';

type BookingFormState = {
  fromPlace: string;
  toPlace: string;
  pickupPhone: string;
  pickupAddress: string;
  parcelType: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
};

type ParcelTypeOption = {
  value: string;
  label: string;
  surcharge: number;
};

const INITIAL_FORM_STATE: BookingFormState = {
  fromPlace: '',
  toPlace: '',
  pickupPhone: '',
  pickupAddress: '',
  parcelType: '',
  receiverName: '',
  receiverPhone: '',
  receiverAddress: '',
};

const PARCEL_TYPES: ParcelTypeOption[] = [
  { value: 'document', label: 'Document', surcharge: 0 },
  { value: 'small-package', label: 'Small Package', surcharge: 30 },
  { value: 'medium-package', label: 'Medium Package', surcharge: 60 },
  { value: 'large-package', label: 'Large Package', surcharge: 100 },
  { value: 'fragile-item', label: 'Fragile Item', surcharge: 120 },
];

function normalizePlace(value: string) {
  return value.trim().toLowerCase();
}

function buildTodayLabel() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

function getUniquePlaces(routes: CourierRouteOption[], key: 'from_location' | 'to_location') {
  return [...new Set(routes.map((route) => route[key].trim()))].sort((left, right) =>
    left.localeCompare(right),
  );
}

export function BookCourierPanel() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const bookingDate = buildTodayLabel();
  const sessionEmail = session?.email ?? '';
  const sessionRole = session?.role;

  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [routes, setRoutes] = useState<CourierRouteOption[]>([]);
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [accountName, setAccountName] = useState('');

  function updateField(field: keyof BookingFormState, value: string) {
    setSubmitError('');
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleOriginChange(value: string) {
    setSubmitError('');
    setForm((current) => ({
      ...current,
      fromPlace: value,
      toPlace: '',
    }));
    setShowOriginSuggestions(value.trim().length > 0);
    setShowDestinationSuggestions(false);
  }

  useEffect(() => {
    const controller = new AbortController();

    async function loadRoutes() {
      setIsBootstrapping(true);
      setLoadError('');

      try {
        const nextRoutes = await fetchRoutes(controller.signal);
        setRoutes(nextRoutes);
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

    void loadRoutes();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!sessionEmail || !sessionRole) {
      setAccountName('');
      return;
    }

    const role = sessionRole;
    const email = sessionEmail;

    const controller = new AbortController();

    async function loadAccountName() {
      try {
        const profile = await fetchAccountProfile(role, email, controller.signal);
        const fullName = `${profile.firstname} ${profile.lastname}`.trim();
        setAccountName(fullName || email);
      } catch {
        if (!controller.signal.aborted) {
          setAccountName(email);
        }
      }
    }

    void loadAccountName();

    return () => controller.abort();
  }, [sessionEmail, sessionRole]);

  const normalizedOrigin = normalizePlace(form.fromPlace);
  const normalizedDestination = normalizePlace(form.toPlace);

  const originSuggestions = getUniquePlaces(routes, 'from_location').filter((origin) =>
    normalizePlace(origin).includes(normalizedOrigin),
  );

  const originRoutes = routes.filter(
    (route) => normalizePlace(route.from_location) === normalizedOrigin,
  );
  const hasExactOrigin = originRoutes.length > 0;

  const destinationSuggestions = getUniquePlaces(originRoutes, 'to_location').filter((destination) =>
    normalizePlace(destination).includes(normalizedDestination),
  );

  const shouldShowOriginSuggestions =
    showOriginSuggestions && form.fromPlace.trim().length > 0 && originSuggestions.length > 0;
  const shouldShowDestinationSuggestions =
    showDestinationSuggestions && form.toPlace.trim().length > 0 && destinationSuggestions.length > 0;

  const selectedRoute =
    originRoutes.find(
      (route) => normalizePlace(route.to_location) === normalizedDestination,
    ) || null;

  const selectedParcelType =
    PARCEL_TYPES.find((parcelType) => parcelType.value === form.parcelType) || null;

  const basePrice = selectedRoute?.price ?? null;
  const estimatedPrice =
    basePrice !== null && selectedParcelType
      ? basePrice + selectedParcelType.surcharge
      : null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError('');

    if (!session?.email) {
      setSubmitError('Your session is missing. Please sign in again.');
      return;
    }

    if (!selectedRoute || !selectedParcelType || estimatedPrice === null) {
      setSubmitError('Choose a supported route and parcel type before continuing.');
      return;
    }

    const draft: BookingDraft = {
      email: session.email,
      accountName: (accountName || session.email).trim(),
      bookingDate,
      fromPlace: selectedRoute.from_location.trim(),
      toPlace: selectedRoute.to_location.trim(),
      pickupPhone: form.pickupPhone.trim(),
      pickupAddress: form.pickupAddress.trim(),
      parcelType: selectedParcelType.value,
      parcelLabel: selectedParcelType.label,
      receiverName: form.receiverName.trim(),
      receiverPhone: form.receiverPhone.trim(),
      receiverAddress: form.receiverAddress.trim(),
      distance: selectedRoute.distance,
      basePrice: selectedRoute.price,
      estimatedPrice,
    };

    saveBookingDraft(draft);
    navigate(getPaymentPath('user'));
  }

  if (loadError && !routes.length) {
    return (
      <ErrorState
        title="Booking data is unavailable"
        message={loadError}
      />
    );
  }

  return (
    <>
      <form className="service-card booking-single" onSubmit={handleSubmit}>
        <div className="service-card__header">
          <div>
            <span className="section-label">User booking</span>
            <h3>Book Courier</h3>
          </div>
        </div>

        {isBootstrapping ? <p className="panel-note">Loading delivery lanes...</p> : null}

        <div className="booking-main-grid">
          <section className="booking-pane booking-pane--pickup">
            <div className="booking-pane__header">
              <h4>Pickup details</h4>
            </div>

            <div className="form-grid booking-compact-grid">
              <label className="field">
                <span>From location</span>
                <div className="autocomplete-field">
                  <input
                    value={form.fromPlace}
                    onChange={(event) => handleOriginChange(event.target.value)}
                    onFocus={() => setShowOriginSuggestions(false)}
                    onBlur={() => {
                      window.setTimeout(() => setShowOriginSuggestions(false), 120);
                    }}
                    placeholder="Search pickup zone"
                    autoComplete="off"
                    required
                  />
                  {shouldShowOriginSuggestions ? (
                    <div className="autocomplete-menu" role="listbox" aria-label="Pickup locations">
                      {originSuggestions.map((origin) => (
                        <button
                          key={origin}
                          type="button"
                          className="autocomplete-option"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            handleOriginChange(origin);
                            setShowOriginSuggestions(false);
                          }}
                        >
                          {origin}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </label>

              <label className="field">
                <span>To location</span>
                <div className="autocomplete-field">
                  <input
                    value={form.toPlace}
                    onChange={(event) => {
                      updateField('toPlace', event.target.value);
                      setShowDestinationSuggestions(event.target.value.trim().length > 0);
                    }}
                    onFocus={() => setShowDestinationSuggestions(false)}
                    onBlur={() => {
                      window.setTimeout(() => setShowDestinationSuggestions(false), 120);
                    }}
                    placeholder={hasExactOrigin ? 'Search destination zone' : 'Choose pickup zone first'}
                    autoComplete="off"
                    disabled={!hasExactOrigin}
                    required
                  />
                  {shouldShowDestinationSuggestions ? (
                    <div className="autocomplete-menu" role="listbox" aria-label="Destination locations">
                      {destinationSuggestions.map((destination) => (
                        <button
                          key={destination}
                          type="button"
                          className="autocomplete-option"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            updateField('toPlace', destination);
                            setShowDestinationSuggestions(false);
                          }}
                        >
                          {destination}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </label>

              <label className="field">
                <span>Pickup phone</span>
                <input
                  type="tel"
                  inputMode="tel"
                  value={form.pickupPhone}
                  onChange={(event) => updateField('pickupPhone', event.target.value)}
                  placeholder="Enter pickup phone number"
                  required
                />
              </label>

              <label className="field">
                <span>Parcel type</span>
                <select
                  value={form.parcelType}
                  onChange={(event) => updateField('parcelType', event.target.value)}
                  required
                >
                  <option value="">Select parcel type</option>
                  {PARCEL_TYPES.map((parcelType) => (
                    <option key={parcelType.value} value={parcelType.value}>
                      {parcelType.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field field--full">
                <span>Pickup address</span>
                <textarea
                  value={form.pickupAddress}
                  onChange={(event) => updateField('pickupAddress', event.target.value)}
                  placeholder="Enter pickup address"
                  rows={2}
                  required
                />
              </label>
            </div>
          </section>

          <div className="booking-side-column">
            <section className="booking-pane booking-pane--receiver">
              <div className="booking-pane__header">
                <h4>Receiver details</h4>
              </div>

              <div className="form-grid booking-compact-grid">
                <label className="field">
                  <span>Receiver name</span>
                  <input
                    value={form.receiverName}
                    onChange={(event) => updateField('receiverName', event.target.value)}
                    placeholder="Enter receiver name"
                    required
                  />
                </label>

                <label className="field">
                  <span>Receiver phone</span>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={form.receiverPhone}
                    onChange={(event) => updateField('receiverPhone', event.target.value)}
                    placeholder="Enter receiver phone number"
                    required
                  />
                </label>

                <label className="field field--full">
                  <span>Receiver address</span>
                  <textarea
                    value={form.receiverAddress}
                    onChange={(event) => updateField('receiverAddress', event.target.value)}
                    placeholder="Enter receiver address"
                    rows={2}
                    required
                  />
                </label>
              </div>
            </section>

            <section className="booking-footer">
              {submitError ? <p className="form-message is-error">{submitError}</p> : null}
              {loadError && routes.length ? <p className="form-message is-error">{loadError}</p> : null}

              <button
                type="submit"
                className="primary-button booking-submit"
                disabled={isBootstrapping || !selectedRoute || !selectedParcelType}
              >
                Complete Payment
              </button>
            </section>
          </div>
        </div>
      </form>
    </>
  );
}
