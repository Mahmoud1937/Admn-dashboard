import StatusBadge from "../../../shared/components/StatusBadge";

export default function ServiceStatusBadge({ isActive }) {
  if (isActive === null || isActive === undefined) {
    return <span className="text-slate-400">—</span>;
  }

  return (
    <StatusBadge tone={isActive ? "success" : "inactive"}>
      {isActive ? "Active" : "Inactive"}
    </StatusBadge>
  );
}