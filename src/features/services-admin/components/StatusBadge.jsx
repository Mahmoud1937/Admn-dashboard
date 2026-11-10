import StatusBadge from "../../../shared/components/StatusBadge";

export default function ServiceStatusBadge({ isActive, activeLabel = "Active", inactiveLabel = "Inactive" }) {
  if (isActive === null || isActive === undefined) {
    return <span className="text-slate-400">—</span>;
  }

  return (
    <StatusBadge tone={isActive ? "success" : "inactive"}>
      {isActive ? activeLabel : inactiveLabel}
    </StatusBadge>
  );
}
