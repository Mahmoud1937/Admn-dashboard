export const NOTIFICATION_EVENTS = [
  { value: 1, label: "Order used", variablesKey: "orderUsed" },
  { value: 2, label: "Order cancelled", variablesKey: "orderCancelled" },
  { value: 3, label: "Point redeemed", variablesKey: "redeemPoint" },
];

export const NOTIFICATION_EVENT_LABELS = Object.fromEntries(
  NOTIFICATION_EVENTS.map(({ value, label }) => [value, label])
);
