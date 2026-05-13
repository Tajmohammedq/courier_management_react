import { apiRequest } from './apiClient';
import type {
  CourierRouteOption,
  CourierRouteQuote,
  CreateCourierOrderPayload,
} from '../types/dashboard';

const ROUTE_CACHE_KEY = 'courier-management-routes';

type RouteAvailabilityResponse = {
  message?: string;
  price?: string;
};

function loadCachedRoutes() {
  const rawValue = localStorage.getItem(ROUTE_CACHE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as CourierRouteOption[];
  } catch {
    localStorage.removeItem(ROUTE_CACHE_KEY);
    return null;
  }
}

function saveCachedRoutes(routes: CourierRouteOption[]) {
  localStorage.setItem(ROUTE_CACHE_KEY, JSON.stringify(routes));
}

export async function fetchRoutes(signal?: AbortSignal) {
  const cachedRoutes = loadCachedRoutes();

  if (cachedRoutes?.length) {
    return cachedRoutes;
  }

  const data =
    (await apiRequest<CourierRouteOption[]>({
      target: 'mvc',
      path: '/origindata',
      signal,
    })) || [];

  saveCachedRoutes(data);
  return data;
}

export async function fetchOrigins(signal?: AbortSignal) {
  const data = await fetchRoutes(signal);

  return [...new Set(data.map((route) => route.from_location.trim()))].sort((left, right) =>
    left.localeCompare(right),
  );
}

export async function fetchDestinations(origin: string, signal?: AbortSignal) {
  const data = await fetchRoutes(signal);

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
  const data = await fetchRoutes(signal);
  const matchingRoute = data.find(
    (route) =>
      route.from_location.trim().toLowerCase() === origin.trim().toLowerCase() &&
      route.to_location.trim().toLowerCase() === destination.trim().toLowerCase(),
  );

  const routeAvailability: RouteAvailabilityResponse = matchingRoute
    ? { message: 'true', price: String(matchingRoute.price) }
    : {};

  const canDeliver = routeAvailability.message === 'true';
  const price = canDeliver && routeAvailability.price ? Number(routeAvailability.price) : null;

  return {
    canDeliver,
    price: Number.isFinite(price) ? price : null,
    message:
      canDeliver && price !== null
        ? 'Route confirmed. This lane is ready for booking.'
        : 'We could not confirm this route right now.',
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
