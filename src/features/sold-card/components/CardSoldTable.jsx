import { useState } from "react";
import { Link } from "react-router-dom";
import { faFileExcel, faSpinner, faTrash, faCreditCard } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatDate } from "../../../utils/formatDate";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import LazyImageCell from "../../../shared/components/LazyImageCell";
import ImageLightbox from "../../../shared/components/ImageLightbox";

const CardSoldTable = ({ items, isLoading, hasActiveFilters, onExport, exportingId, onDelete }) => {
  const isArabic = (text) => /[\u0600-\u06FF]/.test(text || "");
  const [previewImage, setPreviewImage] = useState(null);

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
    <>
      <div className="min-w-0">
        <ScrollableTable maxHeight="60vh">
          <table className="min-w-full text-center text-sm">
            <thead className="sticky top-0 z-10 bg-slate-100">
              <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 text-center">From</th>
                <th className="px-4 py-3 text-center">To</th>
                <th className="px-4 py-3 text-center">Count</th>
                <th className="px-4 py-3 text-center">Client Name</th>
                <th className="px-4 py-3 text-center">Client Phone</th>
                <th className="px-4 py-3 text-center">Active</th>
                <th className="px-4 py-3 text-center">Non Active</th>
                <th className="px-4 py-3 text-center">Proof</th>
                <th className="px-4 py-3 text-center">Created By</th>
                <th className="px-4 py-3 text-center">Created At</th>
                <th className="px-4 py-3 text-center">Export</th>
                <th className="px-4 py-3 text-center">Delete</th>
              </tr>
            </thead>
            <tbody>
              {items.map((sold) => (
                <tr key={sold.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                  <td className="px-4 py-3 text-sm text-center text-gray-700 font-mono">{sold.from}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-700 font-mono">{sold.to}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-700">{sold.count}</td>
                  <td
                    className="px-4 py-3 text-sm text-center text-gray-700"
                    title={sold.clientName}
                    dir={isArabic(sold.clientName) ? "rtl" : "ltr"}
                  >
                    {sold.clientName?.length > 15 ? `${sold.clientName.slice(0, 15)}...` : sold.clientName}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-700">{sold.clientPhone}</td>
                  <td className="px-4 py-3 text-sm text-center">
                    <Link
                      to={`/clients?poolId=${sold.id}&sourceType=2`}
                      state={{
                        from: sold.from,
                        to: sold.to,
                        count: sold.active,
                      }}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {sold.active}
                    </Link>
                  </td>

                  <td className="px-4 py-3 text-sm text-center">
                    <Link
                      to={`/card-activation?cardPoolId=${sold.id}&sourceType=2&status=not-activated`}
                      state={{
                        from: sold.from,
                        to: sold.to,
                        count: sold.nonActive,
                      }}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {sold.nonActive}
                    </Link>
                  </td>

                  <td className="px-4 py-3 text-sm text-center">
                    {sold.proofPayment ? (
                      <LazyImageCell
                        url={sold.proofPayment}
                        label="Proof of payment"
                        onPreview={(url, label) => setPreviewImage({ url, label })}
                        size="h-9 w-9"
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-700">{sold.createdBy}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-700">{formatDate(sold.createdAt)}</td>
                  <td className="px-4 py-3 text-sm text-center">
                    <button
                      type="button"
                      onClick={() => onExport(sold.id)}
                      disabled={exportingId === sold.id}
                      className="inline-flex items-center justify-center gap-2 text-green-600 hover:text-green-800 disabled:opacity-50 cursor-pointer"
                      title="Export to Excel"
                    >
                      <FontAwesomeIcon
                        icon={exportingId === sold.id ? faSpinner : faFileExcel}
                        spin={exportingId === sold.id}
                      />
                      Export
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <button
                      type="button"
                      onClick={() => onDelete(sold)}
                      className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      title="Delete sold card"
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

      <ImageLightbox
        image={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </>
  );
};

export default CardSoldTable;
