import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPills } from "@fortawesome/free-solid-svg-icons";
import AvatarImage from "../../../shared/components/AvatarImage";
import Pagination from "../../../shared/components/Pagination";
import QueryErrorState from "../../../shared/components/QueryErrorState";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import { SkeletonTable } from "../../../shared/components/Skeleton";
import StatusBadge from "../../../shared/components/StatusBadge";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import { PERMISSION_CODES } from "../../auth/constants/permissionCodes";
import usePermission from "../../auth/hooks/usePermission";
import { useProviderMedicinesQuery } from "../hooks/Usemedicinesquery";

export default function ProviderMedicinesTab({ providerId }) {
  const canRead = usePermission(PERMISSION_CODES.MEDICINES_READ);
  const { pageNumber, pageSize, goToPage, handlePageSizeChange, getPageNumbers } =
    useServerPagination({ resetKey: providerId, initialPageSize: 15 });
  const { medicines, totalCount, totalPages, isLoading, isError, error, refetch, isPlaceholderData } =
    useProviderMedicinesQuery({ providerId, pageNumber, pageSize, enabled: canRead });

  if (!canRead) return null;

  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-900">
          <FontAwesomeIcon icon={faPills} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-900">Medicines</h2>
          <p className="text-xs text-slate-500">View medicine prices and discounts for this pharmacy.</p>
        </div>
      </header>

      {isLoading ? (
        <SkeletonTable label="Loading provider medicines..." columns={6} />
      ) : isError ? (
        <QueryErrorState title="Unable to load provider medicines" error={error} onRetry={refetch} />
      ) : medicines.length === 0 ? (
        <TableEmptyState icon={faPills} title="No medicines found" emptyMessage="No medicines are available for this pharmacy." />
      ) : (
        <div aria-busy={isPlaceholderData} className={`transition-opacity ${isPlaceholderData ? "opacity-60" : "opacity-100"}`}>
          <ScrollableTable maxHeight="60vh">
            <table className="w-full min-w-[920px] table-fixed text-center text-sm">
              <thead className="sticky top-0 z-10 bg-slate-100">
                <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-700">
                  <th scope="col" className="w-[300px] px-4 py-3 text-left">Medicine</th>
                  <th scope="col" className="w-[100px] px-4 py-3 text-center">Form</th>
                  <th scope="col" className="w-[140px] px-4 py-3 text-center">Origin</th>
                  <th scope="col" className="w-[120px] px-4 py-3 text-center">Discount (%)</th>
                  <th scope="col" className="w-[130px] px-4 py-3 text-center">Price before</th>
                  <th scope="col" className="w-[130px] px-4 py-3 text-center">Price after</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((medicine) => (
                  <tr key={medicine.medicineId} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-left">
                      <div className="flex w-full max-w-[260px] items-center gap-3 text-left">
                        <AvatarImage src={medicine.medicineImageUrl} alt={medicine.enName || medicine.arName} size="h-10 w-10 shrink-0" loading="lazy" />
                        <div className="min-w-0 flex-1">
                          <p title={medicine.enName} className="truncate font-semibold text-slate-900">{medicine.enName || "—"}</p>
                          <p dir="rtl" lang="ar" title={medicine.arName} className="mt-0.5 truncate text-left text-xs text-slate-400">{medicine.arName || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge tone="primary">{medicine.medicineForm || "—"}</StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge tone={medicine.isLocal === true ? "emerald" : medicine.isLocal === false ? "primary" : "neutral"}>
                        {medicine.medicineType || (medicine.isLocal === true ? "Local" : medicine.isLocal === false ? "Imported" : "Unspecified")}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge tone="emerald" className="tabular-nums">{medicine.appliedDiscountPercentage ?? "—"}</StatusBadge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center tabular-nums text-slate-500">{medicine.priceBefore?.toFixed(2) ?? "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-center font-semibold tabular-nums text-slate-900">{medicine.priceAfter?.toFixed(2) ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollableTable>
          <Pagination
            pageNumber={pageNumber}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            itemLabel="medicines"
            onGoToPage={(page) => goToPage(page, totalPages)}
            onPageSizeChange={handlePageSizeChange}
            getPageNumbers={getPageNumbers}
          />
        </div>
      )}
    </div>
  );
}
