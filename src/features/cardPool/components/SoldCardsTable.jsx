import { faCreditCard } from "@fortawesome/free-solid-svg-icons";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import TableEmptyState from "../../../shared/components/TableEmptyState";

const SoldCardsTable = ({ items, isLoading, hasActiveFilters = false }) => {
  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
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
    <div className="min-w-0 border border-gray-200 rounded-lg">
      <ScrollableTable maxHeight="60vh">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Card Number</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Client Name</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Client Phone</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {items.map((card) => (
              <tr key={card.cardNumber} className="hover:bg-gray-50">
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