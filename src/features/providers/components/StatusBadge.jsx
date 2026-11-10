import StatusBadge from "../../../shared/components/StatusBadge";

export default function ProviderStatusBadge({ isActive, activeLabel = "Active", inactiveLabel = "Inactive" }) {
  return (
    <StatusBadge tone={isActive ? "emerald" : "inactive"} size="sm">
      {isActive ? activeLabel : inactiveLabel}
    </StatusBadge>
  );
}
