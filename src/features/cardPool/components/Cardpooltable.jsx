import { faFileExcel, faSpinner, faTrash, faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { formatDate } from "../../../utils/formatDate";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import TableEmptyState from "../../../shared/components/TableEmptyState";

const CardPoolTable = ({
  items,
  isLoading,
  hasActiveFilters,
  onExport,
  exportingId,
  onDelete,
}) => {
  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  if (!items?.length) {
    return (
      <TableEmptyState
        icon={faLayerGroup}
        title="No card pools found"
        hasActiveFilters={hasActiveFilters}
      />
    );
  }

  return (
    <div className="min-w-0 border border-gray-200 rounded-lg">
      <ScrollableTable maxHeight="60vh">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                From
              </th>

              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                To
              </th>

              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                Total Cards
              </th>

              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                Activated
              </th>

              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                Not Activated
              </th>

              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                Sold
              </th>

              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                Missed
              </th>

              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                Created By
              </th>

              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                Created At
              </th>

              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                Export
              </th>

              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                Delete
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {items.map((pool) => (
              <tr
                key={pool.id}
                className="transition-colors hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-center text-sm font-mono text-gray-700">
                  {pool.from}
                </td>

                <td className="px-4 py-3 text-center text-sm font-mono text-gray-700">
                  {pool.to}
                </td>

                <td className="px-4 py-3 text-center text-sm text-gray-700">
                  {pool.totalCards}
                </td>

                {/* Activated */}
                <td className="px-4 py-3 text-center text-sm">
               <Link
  to={`/clients?poolId=${pool.id}&sourceType=1`}
  state={{
    from: pool.from,
    to: pool.to,
    count: pool.activated,
  }}
  className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
>
  {pool.activated}
</Link>
                </td>

                {/* Not Activated */}
                <td className="px-4 py-3 text-center text-sm">
                  <Link
                    to={`/card-activation?cardPoolId=${pool.id}&sourceType=1&status=not-activated`}
                    state={{
                      from: pool.from,
                      to: pool.to,
                      count: pool.notActivated,
                    }}
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {pool.notActivated}
                  </Link>
                </td>

                {/* Sold */}
                <td className="px-4 py-3 text-center text-sm">
                  <Link
                    to={`/card-pool/sold-cards?cardPoolId=${pool.id}`}
                    state={{
                      from: pool.from,
                      to: pool.to,
                      count: pool.sold,
                    }}
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {pool.sold}
                  </Link>
                </td>

                {/* Missed */}
                <td className="px-4 py-3 text-center text-sm">
                  <Link
                    to={`/card-missed?CardPoolId=${pool.id}`}
                    state={{
                      from: pool.from,
                      to: pool.to,
                      count: pool.missed,
                    }}
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {pool.missed}
                  </Link>
                </td>

                <td className="px-4 py-3 text-center text-sm text-gray-700">
                  {pool.createdBy}
                </td>

                <td className="px-4 py-3 text-center text-sm text-gray-700">
                  {formatDate(pool.createdAt)}
                </td>

                {/* Export */}
                <td className="px-4 py-3 text-center text-sm">
                  <button
                    type="button"
                    onClick={() => onExport(pool.id)}
                    disabled={exportingId === pool.id}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 text-green-600 hover:text-green-800 disabled:opacity-50"
                    title="Export to Excel"
                  >
                    <FontAwesomeIcon
                      icon={
                        exportingId === pool.id
                          ? faSpinner
                          : faFileExcel
                      }
                      spin={exportingId === pool.id}
                    />
                    Export
                  </button>
                </td>

                {/* Delete */}
                <td className="px-4 py-3 text-center text-sm">
                  <button
                    type="button"
                    onClick={() => onDelete(pool)}
                    className="cursor-pointer text-red-600 hover:text-red-800"
                    title="Delete card pool"
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

export default CardPoolTable;