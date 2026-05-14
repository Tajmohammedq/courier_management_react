export type DashboardRole = 'user' | 'employee';

export type DashboardServiceId =
  | 'book-courier'
  | 'active-orders'
  | 'completed-orders'
  | 'cancelled-orders'
  | 'profile'
  | 'available-orders'
  | 'taken-orders'
  | 'completed-deliveries';

export type DashboardService = {
  id: DashboardServiceId;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  image: string;
};

export type CourierRouteOption = {
  from_location: string;
  to_location: string;
  distance: number;
  price: number;
};

export type CourierRouteQuote = {
  canDeliver: boolean;
  message: string;
  price: number | null;
};

export type CreateCourierOrderPayload = {
  email: string;
  from_place: string;
  from_name: string;
  from_phone: string;
  from_address: string;
  to_place: string;
  to_name: string;
  to_phone: string;
  to_address: string;
  item: string;
  status: string;
  order_status: string;
  date: string;
};

export type BookingDraft = {
  email: string;
  accountName: string;
  bookingDate: string;
  fromPlace: string;
  toPlace: string;
  pickupPhone: string;
  pickupAddress: string;
  parcelType: string;
  parcelLabel: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
};

export type UserOrder = {
  trackingNumber: number;
  email: string;
  from_place: string;
  from_name: string;
  from_phone: string;
  from_address: string;
  to_place: string;
  to_name: string;
  to_phone: string;
  to_address: string;
  item: string;
  status: string;
  order_status: string;
  date: string;
};

export type CancelledOrderPayload = {
  trackingNumber: number;
  email: string;
  from_place: string;
  from_name: string;
  from_phone: string;
  from_address: string;
  to_place: string;
  to_name: string;
  to_phone: string;
  to_address: string;
  item: string;
  status: string;
  order_status: string;
};

export type CancelledOrder = CancelledOrderPayload;

export type PricingQuoteRequest = {
  fromPlace: string;
  toPlace: string;
  parcelType: string;
  weightSlab: string;
};

export type PricingQuote = {
  fromPlace: string;
  toPlace: string;
  parcelType: string;
  weightSlab: string;
  distance: number;
  baseFee: number;
  distanceCharge: number;
  parcelTypeCharge: number;
  weightCharge: number;
  total: number;
};
