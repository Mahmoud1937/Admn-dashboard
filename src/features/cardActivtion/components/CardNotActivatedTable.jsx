import { useState } from "react";
import { faSearch, faSpinner, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { exportNotActivatedCards } from "../services/cardActivationService";
import ScrollableTable from "../../../shared/components/ScrollableTable";


/**
 * Triggers a browser download from an axios blob response.
 * Tries to read the real filename from Content-Disposition, falls back otherwise.
 */
function downloadBlobResponse(response, fallbackName) {
  const disposition = response.headers?.["content-disposition"];
  let filename = fallbackName;

  if (disposition) {
    const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^;"]+)"?/i);
    if (match?.[1]) {
      filename = decodeURIComponent(match[1]);
    }
  }

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

const CardNotActivatedTable = ({
  items,
  search,
  onSearchChange,
  id,
  sourceType,
  pageNumber,
  pageSize,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await exportNotActivatedCards({
        id,
        sourceType,
        searchTerm: search,
        pageNumber,
        pageSize,
      });
      downloadBlobResponse(response, "not-activated-cards.xlsx");
    } catch (err) {
      console.error("Failed to export not-activated cards", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-4">
      {/* Search + Export */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search card number..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
          />
        </div>

        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          title="Download Excel file"
          className="flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-green-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FontAwesomeIcon
            icon={isExporting ? faSpinner : faFileExcel}
            className={isExporting ? "animate-spin" : ""}
          />
          {isExporting ? "Exporting..." : "Export"}
        </button>
      </div>

      {/* Empty */}
      {!items?.length ? (
        <div className="py-8 text-center text-sm text-slate-400">
          No not-activated cards found
        </div>
      ) : (
        <div className="min-w-0 overflow-hidden rounded-lg border border-slate-200">
          <ScrollableTable maxHeight="60vh">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="sticky top-0 z-10 bg-slate-50">
                <tr>
                  <th className="w-20 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                    #
                  </th>

                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Card Number
                  </th>

                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {items.map((card, index) => (
                  <tr
                    key={card.id ?? card.cardNumber}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 text-center text-sm font-medium text-slate-400">
                      {index + 1}
                    </td>

                    <td className="px-4 py-3 text-center text-sm font-mono font-medium text-slate-700">
                      {card.cardNumber}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                        Not Activated
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollableTable>
        </div>
      )}
    </div>
  );
};

export default CardNotActivatedTable;
