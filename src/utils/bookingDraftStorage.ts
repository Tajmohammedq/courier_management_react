import type { BookingDraft } from '../types/dashboard';

const BOOKING_DRAFT_KEY = 'courier-management-booking-draft';

export function loadBookingDraft() {
  const rawValue = localStorage.getItem(BOOKING_DRAFT_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as BookingDraft;
  } catch {
    localStorage.removeItem(BOOKING_DRAFT_KEY);
    return null;
  }
}

export function saveBookingDraft(draft: BookingDraft) {
  localStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(draft));
}

export function clearBookingDraft() {
  localStorage.removeItem(BOOKING_DRAFT_KEY);
}
