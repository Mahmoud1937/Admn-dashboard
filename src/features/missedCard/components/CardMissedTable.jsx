import { faTrash, faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatDate } from "../../../utils/formatDate";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import TableEmptyState from "../../../shared/components/TableEmptyState";

const typeBadge = (type) => {
  const isDamaged = type === "Damaged" || type === 1;
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
        isDamaged ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
      }`}
    >
      {isDamaged ? "Damaged" : "Missed"}
    </span>
  );
};

const CardMissedTable = ({ items, isLoading, hasActiveFilters, onDelete }) => {
  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
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
        <table className="min-w-full text-center text-sm">
          <thead className="sticky top-0 z-10 bg-slate-100">
            <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3 text-center">Card Number</th>
              <th className="px-4 py-3 text-center">Type</th>
              <th className="px-4 py-3 text-center">Created By</th>
              <th className="px-4 py-3 text-center">Created At</th>
              <th className="px-4 py-3 text-center">Delete</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                <td className="px-4 py-3 text-sm text-center text-gray-700 font-mono">{item.cardNumber}</td>
                <td className="px-4 py-3 text-sm text-center">{typeBadge(item.missingType)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-700">{item.createdBy}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-700">{formatDate(item.createdAt)}</td>
                <td className="px-4 py-3 text-sm text-center">
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    title="Delete record"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollableTable>
    </div>
  );
};

export default CardMissedTable;
