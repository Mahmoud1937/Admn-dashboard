import { faPills } from "@fortawesome/free-solid-svg-icons";
import RowActions from "../../../shared/components/RowActions";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import AvatarImage from "../../../shared/components/AvatarImage";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import StatusBadge from "../../../shared/components/StatusBadge";
import { getMedicineUnitName } from "../constants/medicineUnits";

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
      <table className="w-full min-w-[900px] table-fixed text-center text-sm">
        <thead className="sticky top-0 z-10 bg-slate-100">
          <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-700">
            <th scope="col" className="w-[300px] px-4 py-3 text-left">Medicine</th>
            <th scope="col" className="w-[100px] px-4 py-3 text-center">Form</th>
            <th scope="col" className="w-[100px] px-4 py-3 text-center">Unit</th>
            <th scope="col" className="w-[140px] px-4 py-3 text-center">Origin</th>
            <th scope="col" className="w-[130px] px-4 py-3 text-center">Price</th>
            {showActions && <th scope="col" className="w-[130px] px-4 py-3 text-center">Actions</th>}
          </tr>
        </thead>

        <tbody>
          {medicines.map((medicine) => (
            <tr
              key={medicine.id}
              className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/60"
            >
              {/* Image + names */}
              <td className="px-4 py-3 text-left">
                <div className="flex w-full max-w-[260px] items-center gap-3 text-left">
                  <AvatarImage
                    src={medicine.medicineImageUrl}
                    alt={medicine.enName}
                    size="h-10 w-10 shrink-0"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <p title={medicine.enName} className="truncate font-semibold text-slate-900">
                      {medicine.enName}
                    </p>
                    <p
                      dir="rtl"
                      lang="ar"
                      title={medicine.arName}
                      className="mt-0.5 truncate text-left text-xs text-slate-400"
                      style={{ textAlign: "left" }}
                    >
                      {medicine.arName || "—"}
                    </p>
                  </div>
                </div>
              </td>

              {/* Form */}
              <td className="px-4 py-3 text-center">
                {medicine.medicineForm ? (
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800">
                    {medicine.medicineForm}
                  </span>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>

              <td className="px-4 py-3 text-center">
                {getMedicineUnitName(medicine.unit ?? medicine.Unit) || "—"}
              </td>

              <td className="px-4 py-3 text-center">
                <StatusBadge tone={medicine.isLocal === true ? "emerald" : medicine.isLocal === false ? "primary" : "neutral"}>
                  {medicine.isLocal === true ? "local" : medicine.isLocal === false ? "Imported" : "Not specified"}
                </StatusBadge>
              </td>

              {/* Price */}
              <td className="whitespace-nowrap px-4 py-3 text-center font-semibold tabular-nums text-slate-900">
                {medicine.medicinePrice != null ? (
                  medicine.medicinePrice.toFixed(2)
                ) : (
                  <span className="font-normal text-slate-400">—</span>
                )}
              </td>

              {/* Actions */}
              {showActions && (
                <td className="px-4 py-3 text-center">
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
