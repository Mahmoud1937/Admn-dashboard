import { faCircleCheck, faCircleXmark, faCoins } from "@fortawesome/free-solid-svg-icons";

export const NOTIFICATION_EVENTS = [
  { value: 1, name: "WhenOrderUsed", label: "Order used", variablesKey: "orderUsed", tone: "success", icon: faCircleCheck },
  { value: 2, name: "WhenOrderCancelled", label: "Order cancelled", variablesKey: "orderCancelled", tone: "orange", icon: faCircleXmark },
  { value: 3, name: "WhenPointRedeemed", label: "Point redeemed", variablesKey: "redeemPoint", tone: "violet", icon: faCoins },
];

export const NOTIFICATION_EVENT_LABELS = Object.fromEntries(
  NOTIFICATION_EVENTS.map(({ value, label }) => [value, label])
);

export function resolveNotificationEvent(currentValue) {
  if (currentValue === "" || currentValue == null) return undefined;
  const asString = String(currentValue).toLowerCase();
  return NOTIFICATION_EVENTS.find(({ value, name, label, variablesKey }) => {
    if (String(value) === String(currentValue)) return true;
    return [name, name?.replace(/^When/, ""), label, variablesKey].some((v) => v && String(v).toLowerCase() === asString);
  });
}
