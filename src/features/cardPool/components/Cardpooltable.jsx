import { faFileExcel, faSpinner, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { formatDate } from "../../../utils/formatDate";

const CardPoolTable = ({ items, isLoading, onExport, exportingId, onDelete }) => {
  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  if (!items?.length) {
    return (
      <div className="text-center py-8 text-gray-500">No card pools found</div>
    );
  }

  return (
    <div className="overflow-x-auto min-w-0 border border-gray-200 rounded-lg scroll-table ">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">From</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">To</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Total Cards</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Activated</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Not Activated</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Sold</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Missed</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Created By</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Created At</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Export</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Delete</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {items.map((pool) => (
            <tr key={pool.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-center text-gray-700 font-mono">{pool.from}</td>
              <td className="px-4 py-3 text-sm text-center text-gray-700 font-mono">{pool.to}</td>
              <td className="px-4 py-3 text-sm text-center text-gray-700">{pool.totalCards}</td>
              <td className="px-4 py-3 text-sm text-center">
                <Link
                  to={`/card-activation?cardPoolId=${pool.id}&sourceType=1`}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {pool.activated}
                </Link>
              </td>
              <td className="px-4 py-3 text-sm text-center text-gray-700">{pool.notActivated}</td>
              <td className="px-4 py-3 text-sm text-center text-gray-700">{pool.sold}</td>
              <td className="px-4 py-3 text-sm text-center text-gray-700">{pool.missed}</td>
              <td className="px-4 py-3 text-sm text-center text-gray-700">{pool.createdBy}</td>
              <td className="px-4 py-3 text-sm text-center text-gray-700">{formatDate(pool.createdAt)}</td>
              <td className="px-4 py-3 text-sm text-center">
                <button
                  type="button"
                  onClick={() => onExport(pool.id)}
                  disabled={exportingId === pool.id}
                  className="inline-flex items-center justify-center gap-2 text-green-600 hover:text-green-800 disabled:opacity-50 cursor-pointer"
                  title="Export to Excel"
                >
                  <FontAwesomeIcon
                    icon={exportingId === pool.id ? faSpinner : faFileExcel}
                    spin={exportingId === pool.id}
                  />
                  Export
                </button>
              </td>
              <td className="px-4 py-3 text-sm text-center">
                <button
                  type="button"
                  onClick={() => onDelete(pool)}
                  className="text-red-600 hover:text-red-800 cursor-pointer"
                  title="Delete card pool"
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

export default CardPoolTable;