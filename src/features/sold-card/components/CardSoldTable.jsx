import { useTranslation } from "react-i18next";
import TableActionsCell from "../../../shared/components/TableActionsCell";
import { useState } from "react";
import { Link } from "react-router-dom";
import { faFileExcel, faSpinner, faTrash, faCreditCard } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatDate } from "../../../utils/formatDate";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import LazyImageCell from "../../../shared/components/LazyImageCell";
import ImageLightbox from "../../../shared/components/ImageLightbox";
import { SkeletonTable } from "../../../shared/components/Skeleton";

const CardSoldTable = ({ items, isLoading, hasActiveFilters, onExport, exportingId, onDelete }) => {
  const { t } = useTranslation("adminPages");
  const isArabic = (text) => /[\u0600-\u06FF]/.test(text || "");
  const [previewImage, setPreviewImage] = useState(null);

  if (isLoading) {
    return <SkeletonTable label={t("Loading sold cards...")} columns={6} />;
  }

  if (!items?.length) {
    return (
      <TableEmptyState
        icon={faCreditCard}
        title={t("No sold cards found")}
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
              <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-700">
                <th className="px-4 py-3 text-center">{t("From")}</th>
                <th className="px-4 py-3 text-center">{t("To")}</th>
                <th className="px-4 py-3 text-center">{t("Count")}</th>
                <th className="px-4 py-3 text-center">{t("Client Name")}</th>
                <th className="px-4 py-3 text-center">{t("Client Phone")}</th>
                <th className="px-4 py-3 text-center">{t("Active")}</th>
                <th className="px-4 py-3 text-center">{t("Non Active")}</th>
                <th className="px-4 py-3 text-center">{t("Proof")}</th>
                <th className="px-4 py-3 text-center">{t("Created By")}</th>
                <th className="px-4 py-3 text-center">{t("Created At")}</th>
                <TableActionsCell as="th" column="export" className="px-4 py-3 text-center">{t("Export")}</TableActionsCell>
                <TableActionsCell as="th" column="delete" className="px-4 py-3 text-center">{t("Delete")}</TableActionsCell>
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
                        label={t("Proof of payment")}
                        onPreview={(url, label) => setPreviewImage({ url, label })}
                        size="h-9 w-9"
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-700">{sold.createdBy}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-700">{formatDate(sold.createdAt)}</td>
                  <TableActionsCell column="export" className="px-4 py-3 text-sm text-center">
                    {onDelete && <button
                      type="button"
                      onClick={() => onExport(sold.id)}
                      disabled={exportingId === sold.id}
                      className="inline-flex items-center justify-center gap-2 text-green-600 hover:text-green-800 disabled:opacity-50 cursor-pointer"
                      title={t("Export to Excel")}
                    >
                      <FontAwesomeIcon
                        icon={exportingId === sold.id ? faSpinner : faFileExcel}
                        spin={exportingId === sold.id}
                      />
                      {t("Export")}
                    </button>}
                  </TableActionsCell>
                  <TableActionsCell column="delete" className="px-4 py-3 text-sm text-center">
                    <button
                      type="button"
                      onClick={() => onDelete(sold)}
                      className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      title={t("Delete sold card")}
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

      <ImageLightbox
        image={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </>
  );
};

export default CardSoldTable;
