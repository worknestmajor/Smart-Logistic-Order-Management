export type Id = number | string;

export interface Role {
  id: number;
  name: string;
  code?: string;
  description?: string;
}

export interface User {
  id?: number;
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: string | number;
  user_role?: string | number;
  roles?: Array<string | number>;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email?: string;
  pickup_address?: string;
  dropoff_address?: string;
  distance_km?: string | number;
  weight_kg?: string | number;
  total_price?: string | number;
  status: string;
}

export interface Vehicle {
  id: number;
  number_plate: string;
  vehicle_type: string;
  capacity_kg: string | number;
  is_available: boolean;
}

export interface Driver {
  id: number;
  full_name: string;
  license_number: string;
  phone: string;
  is_available: boolean;
}

export interface Assignment {
  id: number;
  order: Id;
  driver: Id;
  vehicle: Id;
  assigned_at?: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  order: Id;
  amount?: string | number;
  status: string;
  due_date?: string;
}

export interface PricingConfig {
  id: number;
  name: string;
  base_rate_per_km: string | number;
  weight_rate_per_kg: string | number;
  fuel_surcharge_percent: string | number;
}

export interface NotificationItem {
  id: number;
  channel?: string;
  subject?: string;
  message?: string;
  is_read: boolean;
}

export interface SelectOption {
  value: string | number;
  label: string;
}
