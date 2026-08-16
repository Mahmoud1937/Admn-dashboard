import { faMap } from "@fortawesome/free-solid-svg-icons";
import RowActions from "../../../shared/components/RowActions";
import TableEmptyState from "../../../shared/components/TableEmptyState";

export default function GovernoratesTable({ governorates, hasActiveFilters, onEdit, onDeleteRequest }) {
  if (governorates.length === 0) {
    return (
      <TableEmptyState
        icon={faMap}
        title="No governorates found"
        hasActiveFilters={hasActiveFilters}
        emptyMessage="Get started by adding a new governorate."
      />
    );
  }

  return (
    <div className="overflow-x-auto scroll-table">

    <table className="w-full min-w-[500px] text-left text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-400">
          <th className="px-6 py-3">English Name</th>
          <th className="px-6 py-3">Arabic Name</th>
          <th className="px-6 py-3 text-center">Actions</th>
        </tr>
      </thead>

      <tbody>
        {governorates.map((governorate) => (
          <tr key={governorate.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
            <td className="px-6 py-3 font-medium text-slate-900">{governorate.enName}</td>
            <td className="px-6 py-3 text-slate-600">{governorate.arName}</td>
            <td className="px-6 py-3">
              <RowActions onEdit={() => onEdit(governorate)} onDelete={() => onDeleteRequest(governorate)} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}