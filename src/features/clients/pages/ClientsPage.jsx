import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faUndo } from "@fortawesome/free-solid-svg-icons";
import { emptyFilters, useClientsQuery } from "../hooks/useClientsQuery";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import SearchBarWithFilters from "../../../shared/components/SearchBarWithFilters";
import ClientsFiltersPanel from "../components/ClientsFiltersPanel";
import useClientBlockMutation from "../hooks/useClientBlockMutation";
import ClientsTable from "../components/ClientsTable";
import Pagination from "../../../shared/components/Pagination";
import ConfirmDeleteModal from "../../../shared/components/ConfirmDeleteModal";
import QueryErrorState from "../../../shared/components/QueryErrorState";

const ClientsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const poolId = searchParams.get("poolId");
  const sourceType = searchParams.get("sourceType");

  const poolSource =
    poolId && sourceType
      ? { id: Number(poolId), sourceType: Number(sourceType) }
      : undefined;

  // Data passed from CardPoolTable's "Activated" link
  const from = location.state?.from;
  const to = location.state?.to;
  const count = location.state?.count;

  const handleResetPoolFilter = () => {
    setSearchParams({});
  };

  const {
    clients,
    totalCount,
    totalPages,
    isLoading,
    isError,
    error,
    refetch,
    filters,
    updateFilters,
    resetFilters,
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    getPageNumbers,
  } = useClientsQuery(poolSource);

  // --- search box (debounced, applied straight to filters.searchTerm) ---
  const [searchInput, setSearchInput] = useState(filters.searchTerm);
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  useEffect(() => {
    updateFilters({ searchTerm: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // --- filters panel (draft state, only applied on "Apply") ---
  const [panelOpen, setPanelOpen] = useState(false);
  const [draft, setDraft] = useState(emptyFilters);
  const panelRef = useRef(null);

  const openPanel = () => {
    setDraft({
      platformType: filters.platformType,
      isMale: filters.isMale,
      hasCard: filters.hasCard,
    });
    setPanelOpen(true);
  };

  const closePanel = () => setPanelOpen(false);

  const applyPanel = () => {
    updateFilters(draft);
    setPanelOpen(false);
  };

  const clearPanel = () => {
    setDraft(emptyFilters);
    setSearchInput("");
    resetFilters();
    setPanelOpen(false);
  };

  useEffect(() => {
    if (!panelOpen) return;
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        closePanel();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [panelOpen]);

  const activeFilterCount = ["platformType", "isMale", "hasCard"].filter(
    (key) => filters[key] !== ""
  ).length;

  // --- block / activate confirmation ---
  const [clientPendingToggle, setClientPendingToggle] = useState(null);
  const blockMutation = useClientBlockMutation();

  const confirmToggleBlock = () => {
    if (!clientPendingToggle) return;
    blockMutation.mutate(
      { userId: clientPendingToggle.clientId, isBlocked: !clientPendingToggle.isBlocked },
      { onSettled: () => setClientPendingToggle(null) }
    );
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {poolSource && (
            <button
              type="button"
              onClick={() =>
                navigate(poolSource.sourceType === 1 ? "/card-pools" : "/sold-card")
              }
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Back to {poolSource.sourceType === 1 ? "Card Pool" : "Sold Card"}
            </button>
          )}

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-2xl">Clients</h1>

            {poolSource && (
              <button
                type="button"
                onClick={handleResetPoolFilter}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
              >
                <FontAwesomeIcon icon={faUndo} className="text-[11px]" />
                Reset
              </button>
            )}
          </div>

          <p className="mt-1 text-sm text-slate-500">
            {poolSource && from && to ? (
              <>
                <span className="font-semibold text-slate-700">{count ?? 0}</span> activated
                cards from{" "}
                <span className="font-medium text-slate-700">{from}</span> to{" "}
                <span className="font-medium text-slate-700">{to}</span>.
              </>
            ) : poolSource ? (
              <>Showing activated clients.</>
            ) : (
              "All clients."
            )}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="relative">
          <SearchBarWithFilters
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search by client name, phone and card no..."
            onFilterClick={panelOpen ? closePanel : openPanel}
            activeFilterCount={activeFilterCount}
          />

          {panelOpen && (
            <ClientsFiltersPanel
              draft={draft}
              onChange={setDraft}
              onApply={applyPanel}
              onClear={clearPanel}
              onClose={closePanel}
              panelRef={panelRef}
            />
          )}
        </div>

        {isError ? (
          <QueryErrorState
            title="Unable to load clients"
            error={error}
            onRetry={refetch}
          />
        ) : (
          <ClientsTable
            clients={clients}
            isLoading={isLoading}
            onToggleBlock={setClientPendingToggle}
          />
        )}

        <Pagination
          pageNumber={pageNumber}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          itemLabel="clients"
          onGoToPage={(page) => goToPage(page, totalPages)}
          onPageSizeChange={handlePageSizeChange}
          getPageNumbers={getPageNumbers}
        />
      </div>

      {clientPendingToggle && (
        <ConfirmDeleteModal
          isOpen
          variant={clientPendingToggle.isBlocked ? "success" : "danger"}
          title={clientPendingToggle.isBlocked ? "Activate client?" : "Block client?"}
          message={`Are you sure you want to ${
            clientPendingToggle.isBlocked ? "activate" : "block"
          } ${clientPendingToggle.userName ?? ""}?`}
          confirmLabel={clientPendingToggle.isBlocked ? "Activate" : "Block"}
          isLoading={blockMutation.isPending}
          onConfirm={confirmToggleBlock}
          onCancel={() => setClientPendingToggle(null)}
        />
      )}
    </div>
  );
};

export default ClientsPage;