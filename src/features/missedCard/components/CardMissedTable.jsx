import { faTrash, faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatDate } from "../../../utils/formatDate";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import Skeleton, { SkeletonTable } from "../../../shared/components/Skeleton";

const typeBadge = (type) => {
  const isDamaged = type === "Damaged" || type === 1;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        isDamaged ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isDamaged ? "bg-red-500" : "bg-amber-500"
        }`}
        aria-hidden="true"
      />
      {isDamaged ? "Damaged" : "Missed"}
    </span>
  );
};

function TableSkeleton({ rows = 6 }) {
  return (
    <SkeletonTable
      rows={rows}
      rowClassName="flex items-center gap-6 px-6 py-4"
    >
      <Skeleton className="h-3 w-36 rounded bg-slate-100" />
      <Skeleton className="h-6 w-20 rounded-full bg-slate-100" />
      <Skeleton className="hidden h-3 w-28 rounded bg-slate-100 sm:block" />
      <Skeleton className="ml-auto h-3 w-24 rounded bg-slate-100" />
    </SkeletonTable>
  );
}

const CardMissedTable = ({ items, isLoading, hasActiveFilters, onDelete }) => {
  if (isLoading) {
    return <TableSkeleton />;
  }

  if (!items?.length) {
    return (
      <TableEmptyState
        icon={faCircleExclamation}
        title="No missed or damaged cards found"
        hasActiveFilters={hasActiveFilters}
      />
    );
  }

  return (
    <div className="min-w-0">
      <ScrollableTable maxHeight="60vh">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-100">
            <tr className="border-b border-slate-200 text-xs font-medium text-slate-700">
              <th className="px-6 py-3">Card number</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Reported by</th>
              <th className="px-4 py-3">Reported on</th>
              {onDelete && <th className="px-6 py-3 text-center">Actions</th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-slate-50">
                <td className="px-6 py-3.5 font-mono font-medium tabular-nums text-slate-900">
                  {item.cardNumber}
                </td>
                <td className="px-4 py-3.5">{typeBadge(item.missingType)}</td>
                <td className="px-4 py-3.5 text-slate-700">
                  {item.createdBy || "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                  {formatDate(item.createdAt)}
                </td>
                {onDelete && (
                  <td className="px-6 py-3.5">
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                        title="Delete record"
                        aria-label="Delete record"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollableTable>
    </div>
  );
};

export default CardMissedTable;
