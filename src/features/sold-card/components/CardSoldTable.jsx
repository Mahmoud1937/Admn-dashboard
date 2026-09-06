import { useState } from "react";
import { Link } from "react-router-dom";
import { faFileExcel, faSpinner, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatDate } from "../../../utils/formatDate";
import ScrollableTable from "../../../shared/components/ScrollableTable";

const CardSoldTable = ({ items, isLoading, onExport, exportingId, onDelete }) => {
  const isArabic = (text) => /[\u0600-\u06FF]/.test(text || "");
  const [previewImage, setPreviewImage] = useState(null);

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  if (!items?.length) {
    return (
      <div className="text-center py-8 text-gray-500">No sold cards found</div>
    );
  }

  return (
    <>
      <div className="min-w-0 border border-gray-200 rounded-lg">
        <ScrollableTable maxHeight="60vh">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">From</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">To</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Count</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Client Name</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Client Phone</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Active</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Non Active</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Proof</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Created By</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Created At</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Export</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {items.map((sold) => (
                <tr key={sold.id} className="hover:bg-gray-50">
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
                      <button
                        type="button"
                        onClick={() => setPreviewImage(sold.proofPayment)}
                        className="inline-block cursor-pointer"
                        title="View proof of payment"
                      >
                        <img
                          src={sold.proofPayment}
                          alt="Proof of payment"
                          className="mx-auto h-9 w-9 rounded-full border border-gray-200 object-cover hover:opacity-80"
                        />
                      </button>
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
                      className="text-red-600 hover:text-red-800 cursor-pointer"
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

      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-h-[85vh] max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
              title="Close"
            >
              <FontAwesomeIcon icon={faXmark} size="lg" />
            </button>
            <img
              src={previewImage}
              alt="Proof of payment preview"
              className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default CardSoldTable;