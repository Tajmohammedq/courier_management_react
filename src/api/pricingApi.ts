import { apiRequest } from './apiClient';
import type { PricingQuote, PricingQuoteRequest } from '../types/dashboard';

export async function fetchPricingQuote(payload: PricingQuoteRequest, signal?: AbortSignal) {
  const quote = await apiRequest<PricingQuote>({
    target: 'spring',
    path: '/user/pricing/quote',
    method: 'POST',
    body: payload,
    auth: true,
    signal,
  });

  if (!quote) {
    throw new Error('The pricing service did not return a quote.');
  }

  return quote;
}
