import { useTranslation } from "react-i18next";
import TableActionsCell from "../../../shared/components/TableActionsCell";
import { faFileExcel, faSpinner, faTrash, faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { formatDate } from "../../../utils/formatDate";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import { SkeletonTable } from "../../../shared/components/Skeleton";

const CardPoolTable = ({
  items,
  isLoading,
  hasActiveFilters,
  onExport,
  exportingId,
  onDelete,
}) => {
  const { t } = useTranslation("adminPages");
  if (isLoading) {
    return <SkeletonTable label={t("Loading card pools...")} columns={6} />;
  }

  if (!items?.length) {
    return (
      <TableEmptyState
        icon={faLayerGroup}
        title={t("No card pools found")}
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
              <th className="px-4 py-3 text-center">
                {t("From")}
              </th>

              <th className="px-4 py-3 text-center">
                {t("To")}
              </th>

              <th className="px-4 py-3 text-center">
                {t("Total Cards")}
              </th>

              <th className="px-4 py-3 text-center">
                {t("Activated")}
              </th>

              <th className="px-4 py-3 text-center">
                {t("Not Activated")}
              </th>

              <th className="px-4 py-3 text-center">
                {t("Sold")}
              </th>

              <th className="px-4 py-3 text-center">
                {t("Missed")}
              </th>

              <th className="px-4 py-3 text-center">
                {t("Created By")}
              </th>

              <th className="px-4 py-3 text-center">
                {t("Created At")}
              </th>

              <TableActionsCell as="th" column="export" className="px-4 py-3 text-center">
                {t("Export")}
              </TableActionsCell>

              <TableActionsCell as="th" column="delete" className="px-4 py-3 text-center">
                {t("Delete")}
              </TableActionsCell>
            </tr>
          </thead>

          <tbody>
            {items.map((pool) => (
              <tr
                key={pool.id}
                className="border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50/60"
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
                <TableActionsCell column="export" className="px-4 py-3 text-center text-sm">
                  {onDelete && <button
                    type="button"
                    onClick={() => onExport(pool.id)}
                    disabled={exportingId === pool.id}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 text-green-600 hover:text-green-800 disabled:opacity-50"
                    title={t("Export to Excel")}
                  >
                    <FontAwesomeIcon
                      icon={
                        exportingId === pool.id
                          ? faSpinner
                          : faFileExcel
                      }
                      spin={exportingId === pool.id}
                    />
                    {t("Export")}
                  </button>}
                </TableActionsCell>

                {/* Delete */}
                <TableActionsCell column="delete" className="px-4 py-3 text-center text-sm">
                  <button
                    type="button"
                    onClick={() => onDelete(pool)}
                    className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    title={t("Delete card pool")}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </TableActionsCell>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollableTable>
    </div>
  );
};

export default CardPoolTable;
