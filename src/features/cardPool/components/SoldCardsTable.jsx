import { faCreditCard } from "@fortawesome/free-solid-svg-icons";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import { SkeletonTable } from "../../../shared/components/Skeleton";

const SoldCardsTable = ({ items, isLoading, hasActiveFilters = false }) => {
  if (isLoading) {
    return <SkeletonTable label="Loading sold cards..." columns={3} />;
  }

  if (!items?.length) {
    return (
      <TableEmptyState
        icon={faCreditCard}
        title="No sold cards found"
        hasActiveFilters={hasActiveFilters}
      />
    );
  }

  return (
    <div className="min-w-0">
      <ScrollableTable maxHeight="60vh">
        <table className="min-w-full text-center text-sm">
          <thead className="sticky top-0 z-10 bg-slate-100">
            <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-700">
              <th className="px-4 py-3 text-center">Card Number</th>
              <th className="px-4 py-3 text-center">Client Name</th>
              <th className="px-4 py-3 text-center">Client Phone</th>
            </tr>
          </thead>
          <tbody>
            {items.map((card) => (
              <tr key={card.cardNumber} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                <td className="px-4 py-3 text-sm text-center text-gray-700 font-mono">{card.cardNumber}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-700">{card.clientName}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-700 font-mono">{card.clientPhoneNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollableTable>
    </div>
  );
};

export default SoldCardsTable;
