export const ORDER_STATUS = [
  'CREATED',
  'APPROVED',
  'ASSIGNED',
  'IN_TRANSIT',
  'DELIVERED',
  'INVOICED',
] as const;

export type OrderStatus = (typeof ORDER_STATUS)[number];

export const ORDER_STATUS_LABELS = {
  CREATED: 'Created',
  APPROVED: 'Approved',
  ASSIGNED: 'Assigned',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
  INVOICED: 'Invoiced',
} as const;
