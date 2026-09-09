import StatusBadge from "../../../shared/components/StatusBadge";

export default function ProviderStatusBadge({ isActive }) {
  return (
    <StatusBadge tone={isActive ? "emerald" : "inactive"} size="sm">
      {isActive ? "Active" : "Inactive"}
    </StatusBadge>
  );
}