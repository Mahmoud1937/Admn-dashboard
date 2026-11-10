import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faArrowLeft,faArrowRight,faFileExcel,faSpinner,faUndo,} from "@fortawesome/free-solid-svg-icons";
import { emptyFilters, useClientsQuery } from "../hooks/useClientsQuery";
import { useExportClients } from "../hooks/useExportClients";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import SearchBarWithFilters from "../../../shared/components/SearchBarWithFilters";
import ClientsFiltersPanel from "../components/ClientsFiltersPanel";
import useClientBlockMutation from "../hooks/useClientBlockMutation";
import ClientsTable from "../components/ClientsTable";
import Pagination from "../../../shared/components/Pagination";
import ConfirmDeleteModal from "../../../shared/components/ConfirmDeleteModal";
import QueryErrorState from "../../../shared/components/QueryErrorState";
import usePermission from "../../auth/hooks/usePermission";
import { PERMISSION_CODES } from "../../auth/constants/permissionCodes";
import LocalizedPage from "../../../localization/LocalizedPage";
import useLanguage from "../../../localization/useLanguage";
import useClientsText from "../../../localization/useClientsText";

const ClientsPage = () => {
  const t = useClientsText();
  const { language, direction } = useLanguage();
  const rtl = direction === "rtl";
  const canUpdate = usePermission(PERMISSION_CODES.CLIENTS_UPDATE);
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
  } = useClientsQuery(poolSource, language);
  const { exportToExcel, isExporting } = useExportClients();

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
  const blockMutation = useClientBlockMutation(t);

  const confirmToggleBlock = () => {
    if (!clientPendingToggle) return;
    blockMutation.mutate(
      {
        userId: clientPendingToggle.clientId,
        isBlocked: !clientPendingToggle.isBlocked,
      },
      { onSettled: () => setClientPendingToggle(null) }
    );
  };

  return (
    <LocalizedPage>
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
              <FontAwesomeIcon icon={rtl ? faArrowRight : faArrowLeft} />
              {t(poolSource.sourceType === 1 ? "Back to Card Pool" : "Back to Sold Card")}
            </button>
          )}

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-2xl">{t("Clients")}</h1>

            {poolSource && (
              <button
                type="button"
                onClick={handleResetPoolFilter}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
              >
                <FontAwesomeIcon icon={faUndo} className="text-[11px]" />
                {t("Reset")}
              </button>
            )}
          </div>

          <p className="mt-1 text-sm text-slate-500">
            {poolSource && from && to ? (
              <>
                {t("{{count}} activated cards from {{from}} to {{to}}.", { count: count ?? 0, from, to })}
              </>
            ) : poolSource ? (
              <>{t("Showing activated clients.")}</>
            ) : (
              t("All clients.")
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            exportToExcel({
              filters,
              poolSource,
            })
          }
          disabled={isExporting}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          title={t("Export clients to Excel")}
        >
          <FontAwesomeIcon
            icon={isExporting ? faSpinner : faFileExcel}
            spin={isExporting}
          />
          {isExporting ? t("Exporting...") : t("Export")}
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="relative">
          <SearchBarWithFilters
            value={searchInput}
            onChange={setSearchInput}
            placeholder={t("Search by client name, phone and card no...")}
            filterLabel={t("Filters")}
            rtl={rtl}
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
            title={t("Unable to load clients")}
            error={error}
            onRetry={refetch}
            loadErrorMessage={t("We couldn't load the data. Please try again.")}
            connectionErrorMessage={t("We couldn't connect to the server. Please check your internet connection and try again.")}
            retryLabel={t("Try Again")}
          />
        ) : (
          <ClientsTable
            clients={clients}
            rtl={rtl}
            isLoading={isLoading}
            onToggleBlock={canUpdate ? setClientPendingToggle : undefined}
            togglingClientId={
              blockMutation.isPending ? blockMutation.variables?.userId : null
            }
          />
        )}

        <Pagination
          pageNumber={pageNumber}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          summary={t("Showing page {{page}} of {{totalPages}} ({{count}} clients)", { page: pageNumber, totalPages, count: totalCount })}
          rowsPerPageLabel={t("Rows per page")}
          previousLabel={t("Previous")}
          nextLabel={t("Next")}
          rtl={rtl}
          onGoToPage={(page) => goToPage(page, totalPages)}
          onPageSizeChange={handlePageSizeChange}
          getPageNumbers={getPageNumbers}
        />
      </div>

      {clientPendingToggle && canUpdate && (
        <ConfirmDeleteModal
          isOpen
          variant={clientPendingToggle.isBlocked ? "success" : "danger"}
          title={t(clientPendingToggle.isBlocked ? "Activate client?" : "Block client?")}
          message={t(clientPendingToggle.isBlocked
            ? "Are you sure you want to activate {{name}}?"
            : "Are you sure you want to block {{name}}?", { name: clientPendingToggle.userName ?? "" })}
          confirmLabel={t(clientPendingToggle.isBlocked ? "Activate" : "Block")}
          cancelLabel={t("Cancel")}
          loadingLabel={t("Processing...")}
          isLoading={blockMutation.isPending}
          onConfirm={confirmToggleBlock}
          onCancel={() => setClientPendingToggle(null)}
        />
      )}

    </LocalizedPage>
  );
};

export default ClientsPage;
