import { useState } from "react";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import { useInvoicesQuery } from "../hooks/useInvoicesQuery";
import InvoicesSearchBar from "../components/InvoicesSearchBar";
import { countActiveInvoiceFilters } from "../utils/countActiveInvoiceFilters";
import InvoicesTable from "../components/InvoicesTable";
import Pagination from "../../../shared/components/Pagination";


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

  // resetKey changes whenever search or applied filters change -> page auto-resets to 1
  const { pageNumber, pageSize, goToPage, handlePageSizeChange, getPageNumbers } =
    useServerPagination({ resetKey: `${debouncedSearch}-${JSON.stringify(filters)}` });

  const { data, isLoading } = useInvoicesQuery({
    pageNumber,
    pageSize,
    searchTerm: debouncedSearch,
    filters,
  });

  const handleApplyFilters = () => setFilters(draftFilters);

  const handleClearFilters = () => {
    setFilters(emptyFilters);
    setDraftFilters(emptyFilters);
  };

  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Invoices</h1>

      <div className="rounded-xl border border-slate-200 bg-white">
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
          hasActiveFilters={!!search || countActiveInvoiceFilters(filters) > 0}
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
    </div>
  );
};

export default InvoicesPage;
