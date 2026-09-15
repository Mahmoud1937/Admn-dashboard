import { useState } from "react";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import { useExportInvoices } from "../hooks/useExportInvoices";
import { useInvoicesQuery } from "../hooks/useInvoicesQuery";
import InvoicesSearchBar from "../components/InvoicesSearchBar";
import { countActiveInvoiceFilters } from "../utils/countActiveInvoiceFilters";
import InvoicesTable from "../components/InvoicesTable";
import Pagination from "../../../shared/components/Pagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileExcel,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

const emptyFilters = {
  providerId: "",
  providerBranchId: "",
  status: "",
  fromDate: "",
  toDate: "",
  isCash: "",
};

const InvoicesPage = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const [filters, setFilters] = useState(emptyFilters);
  const [draftFilters, setDraftFilters] = useState(emptyFilters);

  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    getPageNumbers,
  } = useServerPagination({
    resetKey: `${debouncedSearch}-${JSON.stringify(filters)}`,
  });

  const { data, isLoading } = useInvoicesQuery({
    pageNumber,
    pageSize,
    searchTerm: debouncedSearch,
    filters,
  });

  const { exportToExcel, isExporting } = useExportInvoices();

  const handleApplyFilters = () => {
    setFilters(draftFilters);
  };

  const handleClearFilters = () => {
    setFilters(emptyFilters);
    setDraftFilters(emptyFilters);
  };

  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Invoices</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage and export invoices
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            exportToExcel({
              searchTerm: debouncedSearch,
              filters,
            })
          }
          disabled={isExporting}
          className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-emerald-600 shadow-sm transition-colors hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          title="Export invoices to Excel"
        >
          <FontAwesomeIcon
            icon={isExporting ? faSpinner : faFileExcel}
            spin={isExporting}
          />

          {isExporting ? "Exporting..." : "Export"}
        </button>
      </div>

      <InvoicesSearchBar
        search={search}
        setSearch={setSearch}
        draftFilters={draftFilters}
        setDraftFilters={setDraftFilters}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        activeFilterCount={countActiveInvoiceFilters(filters)}
      />

      <InvoicesTable
        invoices={data?.items ?? []}
        isLoading={isLoading}
        hasActiveFilters={countActiveInvoiceFilters(filters) > 0}
      />

      <Pagination
        pageNumber={pageNumber}
        totalPages={totalPages}
        totalCount={data?.totalCount ?? 0}
        pageSize={pageSize}
        itemLabel="invoices"
        onGoToPage={(page) => goToPage(page, totalPages)}
        onPageSizeChange={handlePageSizeChange}
        getPageNumbers={getPageNumbers}
      />
    </div>
  );
};

export default InvoicesPage;