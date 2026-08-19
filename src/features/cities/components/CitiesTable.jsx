import { faCity } from "@fortawesome/free-solid-svg-icons";
import RowActions from "../../../shared/components/RowActions";
import TableEmptyState from "../../../shared/components/TableEmptyState";

export default function CitiesTable({ cities, hasActiveFilters, onEdit, onDeleteRequest }) {
  if (cities.length === 0) {
    return (
      <TableEmptyState
        icon={faCity}
        title="No cities found"
        hasActiveFilters={hasActiveFilters}
        emptyMessage="Get started by adding a new city."
      />
    );
  }

  return (
    <div className="scroll-table">
      <table className="w-full text-center text-sm">
        <thead className="sticky top-0 bg-white">
          <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-400">
            <th className="px-6 py-3">English Name</th>
            <th className="px-6 py-3">Arabic Name</th>
            <th className="px-6 py-3">Governorate</th>
            <th className="px-6 py-3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {cities.map((city) => (
            <tr key={city.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
              <td className="px-6 py-3 font-medium text-slate-900">{city.enName}</td>
              <td className="px-6 py-3 text-slate-600">{city.arName}</td>
<td className="px-6 py-3 text-slate-600">
  <p className="truncate font-semibold text-slate-900">{city.governorateEnName || "—"}</p>
  <p className="truncate text-xs text-slate-400">{city.governorateArName || ""}</p>
</td>
           
              <td className="px-6 py-3">
                <RowActions onEdit={() => onEdit(city)} onDelete={() => onDeleteRequest(city)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}