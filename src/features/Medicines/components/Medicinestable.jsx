import { faPills } from "@fortawesome/free-solid-svg-icons";
import RowActions from "../../../shared/components/RowActions";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import AvatarImage from "../../../shared/components/AvatarImage";
import ScrollableTable from "../../../shared/components/ScrollableTable";

export default function MedicinesTable({
  medicines,
  hasActiveFilters,
  onEdit,
  onDeleteRequest,
}) {
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

  const showActions = !!(onEdit || onDeleteRequest);

  return (
    <ScrollableTable maxHeight="60vh">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="sticky top-0 z-10 bg-slate-100">
          <tr className="border-b border-slate-200 text-xs font-medium text-slate-500">
            <th className="px-6 py-3">Medicine</th>
            <th className="px-4 py-3">Form</th>
            <th className="px-4 py-3 text-right">Price</th>
            {showActions && <th className="px-6 py-3 text-center">Actions</th>}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {medicines.map((medicine) => (
            <tr
              key={medicine.id}
              className="transition-colors hover:bg-slate-50"
            >
              {/* Image + names */}
              <td className="px-6 py-3">
                <div className="flex items-center gap-3">
                  <AvatarImage
                    src={medicine.medicineImageUrl}
                    alt={medicine.enName}
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {medicine.enName}
                    </p>
                    <p
                      dir="rtl"
                      lang="ar"
                      className="truncate text-xs text-slate-500"
                      style={{ textAlign: "left" }}
                    >
                      {medicine.arName || "—"}
                    </p>
                  </div>
                </div>
              </td>

              {/* Form */}
              <td className="px-4 py-3">
                {medicine.medicineForm ? (
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800">
                    {medicine.medicineForm}
                  </span>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>

              {/* Price */}
              <td className="px-4 py-3 text-right font-medium tabular-nums text-slate-800">
                {medicine.medicinePrice != null ? (
                  medicine.medicinePrice.toFixed(2)
                ) : (
                  <span className="font-normal text-slate-400">—</span>
                )}
              </td>

              {/* Actions */}
              {showActions && (
                <td className="px-6 py-3">
                  <RowActions
                    onEdit={onEdit ? () => onEdit(medicine) : undefined}
                    onDelete={
                      onDeleteRequest
                        ? () => onDeleteRequest(medicine)
                        : undefined
                    }
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollableTable>
  );
}
