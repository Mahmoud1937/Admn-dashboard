import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatDate } from "../../../utils/formatDate";

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

const CardMissedTable = ({ items, isLoading, onDelete }) => {
  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  if (!items?.length) {
    return (
      <div className="text-center py-8 text-gray-500">No missed or damaged cards found</div>
    );
  }

  return (
    <div className="overflow-x-auto min-w-0 border border-gray-200 rounded-lg scroll-table">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Card Number</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Card Pool ID</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Type</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Created By</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Created At</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Delete</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-center text-gray-700 font-mono">{item.cardNumber}</td>
              <td className="px-4 py-3 text-sm text-center text-gray-700">{item.cardPoolId}</td>
              <td className="px-4 py-3 text-sm text-center">{typeBadge(item.missingType)}</td>
              <td className="px-4 py-3 text-sm text-center text-gray-700">{item.createdBy}</td>
              <td className="px-4 py-3 text-sm text-center text-gray-700">{formatDate(item.createdAt)}</td>
              <td className="px-4 py-3 text-sm text-center">
                <button
                  type="button"
                  onClick={() => onDelete(item)}
                  className="text-red-600 hover:text-red-800 cursor-pointer"
                  title="Delete record"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CardMissedTable;