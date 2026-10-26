import { useState, useRef, useEffect } from "react";
import { faFileExcel, faSpinner, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import { useProviderToggleMutation } from "../hooks/useProviderToggleMutation";
import { useProvidersQuery } from "../hooks/useProvidersQuery";
import { useExportProviders } from "../hooks/useExportProviders";
import ProvidersTable from "../components/ProvidersTable";
import Pagination from "../../../shared/components/Pagination";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import ConfirmDeleteModal from "../../../shared/components/ConfirmDeleteModal";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import ProvidersHeader from "../components/ProvidersHeader";
import SearchBarWithFilters from "../../../shared/components/SearchBarWithFilters";
import { countActiveFilters } from "../utils/countActiveFilters";
import ProvidersFilters, { emptyFilters } from "../components/ProvidersFilters";
import QueryErrorState from "../../../shared/components/QueryErrorState";
import usePermission from "../../auth/hooks/usePermission";
import { PERMISSION_CODES } from "../../auth/constants/permissionCodes";



export default function ProvidersPage() {
  const canUpdate = usePermission(PERMISSION_CODES.PROVIDERS_UPDATE);
  const canExport = usePermission(PERMISSION_CODES.PROVIDERS_READ);
  const { exportToExcel, isExporting, exportError } = useExportProviders();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [providerToToggle, setProviderToToggle] = useState(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState(emptyFilters);
  const [draftFilters, setDraftFilters] = useState(emptyFilters);

  const filterPanelRef = useRef(null);

  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    getPageNumbers,
  } = useServerPagination({
    resetKey: `${search}-${JSON.stringify(filters)}`,
  });

  useEffect(() => {
    if (!isFilterOpen) return;

    const handleClickOutside = (e) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(e.target)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFilterOpen]);

  const {
    providers,
    totalCount,
    totalPages,
    isLoading,
    isError,
    error,
    refetch,
    isPlaceholderData,
  } = useProvidersQuery({ pageNumber, pageSize, search, filters });


  const { toggleMutation } = useProviderToggleMutation({
    onSuccess: () => setProviderToToggle(null),
  });

  const openFilters = () => {
    setDraftFilters(filters);
    setIsFilterOpen(true);
  };

  const applyFilters = () => {
    setFilters(draftFilters);
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    setDraftFilters(emptyFilters);
  };

const handleEdit = (provider) => {
  navigate(`/providers/${provider.id}?mode=edit`);
};

  const handleToggleClick = (provider) => {
    setProviderToToggle(provider);
  };

  const confirmToggle = () => {
    if (providerToToggle) {
      toggleMutation.mutate(providerToToggle);
    }
  };

  const isDeactivating = providerToToggle?.isActive;

  const handleExport = () => {
    if (canExport) exportToExcel({ searchTerm: search, filters });
  };

  return (
    <div>
      <ProvidersHeader />
      {exportError && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {exportError}
        </p>
      )}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white">
        <div className="relative">
          <SearchBarWithFilters
            value={search}
            onChange={setSearch}
            placeholder="Search by name (EN/AR) or ID..."
            onFilterClick={openFilters}
            activeFilterCount={countActiveFilters(filters)}
          >
            {canExport && (
              <button
                type="button"
                onClick={handleExport}
                disabled={isExporting}
                aria-busy={isExporting}
                title="Export providers to Excel"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FontAwesomeIcon icon={isExporting ? faSpinner : faFileExcel} spin={isExporting} />
                {isExporting ? "Exporting..." : "Export"}
              </button>
            )}
          </SearchBarWithFilters>

          {isFilterOpen && (
            <ProvidersFilters
              draft={draftFilters}
              onChange={setDraftFilters}
              onApply={applyFilters}
              onClear={clearFilters}
              onClose={() => setIsFilterOpen(false)}
              panelRef={filterPanelRef}
            />
          )}
        </div>

        {isLoading && (
          <p className="p-6 text-center text-sm text-slate-400">Loading providers...</p>
        )}

{isError && (
  <QueryErrorState
    title="Unable to load providers"
    error={error}
    onRetry={refetch}
  />
)}     {!isLoading && !isError && (
          <div
            className={`overflow-hidden rounded-b-xl transition-opacity ${isPlaceholderData ? "opacity-60" : "opacity-100"
              }`}
          >
            <ScrollableTable maxHeight="60vh">
              <ProvidersTable
                providers={providers}
                onEdit={canUpdate ? handleEdit : undefined}
                onToggleStatus={canUpdate ? handleToggleClick : undefined}
              />
            </ScrollableTable>

            {providers.length === 0 && (
              <TableEmptyState
                icon={faUsers}
                title="No providers found"
                emptyMessage="Get started by adding a new provider."
              />
            )}

            {providers.length > 0 && (
              <Pagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                itemLabel="providers"
                onGoToPage={(page) => goToPage(page, totalPages)}
                onPageSizeChange={handlePageSizeChange}
                getPageNumbers={getPageNumbers}
              />
            )}
          </div>
        )}

        {canUpdate && <ConfirmDeleteModal
          isOpen={!!providerToToggle}
          title={isDeactivating ? "Deactivate Provider" : "Activate Provider"}
          message={
            isDeactivating
              ? `Are you sure you want to deactivate "${providerToToggle?.enName}"? You can reactivate it later.`
              : `Are you sure you want to activate "${providerToToggle?.enName}"?`
          }
          confirmLabel={isDeactivating ? "Deactivate" : "Activate"}
          variant={isDeactivating ? "danger" : "success"}
          isLoading={toggleMutation.isPending}
          onConfirm={confirmToggle}
          onCancel={() => setProviderToToggle(null)}
        />}

        {toggleMutation.isError && (
          <p className="mt-3 px-6 text-sm text-red-500">
            {toggleMutation.error?.response?.data?.message ||
              "Failed to update provider status. Please try again."}
          </p>
        )}
      </div>
    </div>
  );
}
