import { apiRequest } from './apiClient';
import type {
  CourierRouteOption,
  CourierRouteQuote,
  CreateCourierOrderPayload,
} from '../types/dashboard';

type RouteAvailabilityResponse = {
  message?: string;
  price?: string;
};

export async function fetchOrigins(signal?: AbortSignal) {
  const data =
    (await apiRequest<CourierRouteOption[]>({
      target: 'mvc',
      path: '/origindata',
      signal,
    })) || [];

  return [...new Set(data.map((route) => route.from_location.trim()))].sort((left, right) =>
    left.localeCompare(right),
  );
}

export async function fetchDestinations(origin: string, signal?: AbortSignal) {
  const data =
    (await apiRequest<CourierRouteOption[]>({
      target: 'mvc',
      path: '/origindata',
      signal,
    })) || [];

  return [
    ...new Set(
      data
        .filter((route) => route.from_location.trim().toLowerCase() === origin.trim().toLowerCase())
        .map((route) => route.to_location.trim()),
    ),
  ].sort((left, right) =>
    left.localeCompare(right),
  );
}

export async function fetchRouteQuote(
  origin: string,
  destination: string,
  signal?: AbortSignal,
): Promise<CourierRouteQuote> {
  const encodedOrigin = encodeURIComponent(origin);
  const encodedDestination = encodeURIComponent(destination);
  const data =
    (await apiRequest<RouteAvailabilityResponse>({
      target: 'mvc',
      path: `/checkorigin/${encodedOrigin}/${encodedDestination}`,
      signal,
    })) || {};

  const canDeliver = data.message === 'true';
  const price = canDeliver && data.price ? Number(data.price) : null;

  return {
    canDeliver,
    price: Number.isFinite(price) ? price : null,
    message:
      canDeliver && price !== null
        ? 'Route confirmed. This lane is ready for booking.'
        : data.message || 'We could not confirm this route right now.',
  };
}

export async function createCourierOrder(payload: CreateCourierOrderPayload) {
  await apiRequest<void>({
    target: 'spring',
    path: '/saveorder',
    method: 'POST',
    body: payload,
    auth: true,
  });
}
