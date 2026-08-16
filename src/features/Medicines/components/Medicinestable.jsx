import { faPills } from "@fortawesome/free-solid-svg-icons";
import RowActions from "../../../shared/components/RowActions";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import AvatarImage from "../../../shared/components/AvatarImage";

export default function MedicinesTable({ medicines, hasActiveFilters, onEdit, onDeleteRequest }) {
  if (medicines.length === 0) {
    return (
      <TableEmptyState
        icon={faPills}
        title="No medicines found"
        hasActiveFilters={hasActiveFilters}
        emptyMessage="Get started by adding a new medicine."
      />
    );
  }

  return (
  <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-400">
          <th className="px-6 py-3">Image</th>
          <th className="px-6 py-3">English Name</th>
          <th className="px-6 py-3">Arabic Name</th>
          <th className="px-6 py-3">Form</th>
          <th className="px-6 py-3">Price</th>
          <th className="px-6 py-3 text-center">Actions</th>
        </tr>
      </thead>

      <tbody>
        {medicines.map((medicine) => (
          <tr key={medicine.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
            <td className="px-6 py-3">
              <AvatarImage src={medicine.medicineImageUrl} alt={medicine.enName} />
            </td>
            <td className="px-6 py-3 font-medium text-slate-900">{medicine.enName}</td>
            <td className="px-6 py-3 text-slate-600">{medicine.arName}</td>
            <td className="px-6 py-3 text-slate-600">{medicine.medicineForm || "—"}</td>
            <td className="px-6 py-3 text-slate-600">
              {medicine.medicinePrice != null ? medicine.medicinePrice.toFixed(2) : "—"}
            </td>
            <td className="px-6 py-3">
              <RowActions onEdit={() => onEdit(medicine)} onDelete={() => onDeleteRequest(medicine)} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  );
}