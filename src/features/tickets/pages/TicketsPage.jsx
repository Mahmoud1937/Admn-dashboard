import LocalizedPage from "../../../localization/LocalizedPage";
import { useTranslation } from "react-i18next";
import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import Pagination from "../../../shared/components/Pagination";
import QueryErrorState from "../../../shared/components/QueryErrorState";
import SearchBarWithFilters from "../../../shared/components/SearchBarWithFilters";
import TicketDetailsModal from "../components/TicketDetailsModal";
import TicketFormModal from "../components/TicketFormModal";
import TicketsFiltersPanel from "../components/TicketsFiltersPanel";
import PermissionGuard from "../../auth/components/PermissionGuard";
import { PERMISSION_CODES } from "../../auth/constants/permissionCodes";
import usePermission from "../../auth/hooks/usePermission";
import TicketsBoard from "../components/TicketsBoard";
import { useTicketMutations } from "../hooks/useTicketMutations";
import { useTicketsQuery } from "../hooks/useTicketsQuery";
import { countActiveTicketFilters } from "../utils/countActiveTicketFilters";

const emptyFilters = {
  userId: "",
  ticketTypeId: "",
  providerId: "",
  employeeGroupId: "",
  priority: "",
  isClosed: "",
};

export default function TicketsPage() {
  const { t } = useTranslation("adminPages");
  const canUpdate = usePermission(PERMISSION_CODES.TICKETS_UPDATE);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [filters, setFilters] = useState(emptyFilters);
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [panelOpen, setPanelOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [detailsTicketId, setDetailsTicketId] = useState(null);
  const [detailsColor, setDetailsColor] = useState(null);
  const panelRef = useRef(null);

  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    getPageNumbers,
  } = useServerPagination({
    resetKey: `${debouncedSearch}-${JSON.stringify(filters)}`,
    initialPageSize: 50,
  });

  const {
    tickets,
    totalCount,
    totalPages,
    isLoading,
    isError,
    error,
    isPlaceholderData,
    refetch,
  } = useTicketsQuery({
    pageNumber,
    pageSize,
    searchTerm: debouncedSearch,
    filters,
  });

  const closeForm = () => {
    setIsFormOpen(false);
    clearServerErrors();
  };

  const { createMutation, updateMutation, isSaving, serverErrors, clearServerErrors } =
    useTicketMutations({
      onCreateSuccess: closeForm,
    });

  const handleSaveTicket = (payload) => {
    createMutation.mutate(payload);
  };

  const handleUpdateTicket = (payload, options) => {
    updateMutation.mutate({ id: detailsTicketId, payload }, options);
  };

  const openDetails = (ticketId, colorName) => {
    clearServerErrors();
    setDetailsColor(colorName ?? null);
    setDetailsTicketId(ticketId);
  };

  const closeDetails = () => {
    setDetailsTicketId(null);
    setDetailsColor(null);
    clearServerErrors();
  };

  const handleApplyFilters = () => {
    setFilters(draftFilters);
    setPanelOpen(false);
  };

  const handleClearFilters = () => {
    setFilters(emptyFilters);
    setDraftFilters(emptyFilters);
  };

  const activeFilterCount = countActiveTicketFilters(filters);

  return (
    <LocalizedPage><div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            {t("Tickets Management")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {t("View and filter support tickets across the platform.")}
          </p>
        </div>

        <PermissionGuard permission={PERMISSION_CODES.TICKETS_CREATE}>
          <button
            type="button"
            onClick={() => {
              clearServerErrors();
              setIsFormOpen(true);
            }}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-900 px-3 py-2 text-xs font-medium text-white hover:bg-blue-800 sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <FontAwesomeIcon icon={faPlus} />
            {t("Add Ticket")}
          </button>
        </PermissionGuard>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="relative">
          <SearchBarWithFilters
            value={search}
            onChange={setSearch}
            placeholder={t("Search by user phone number or card number...")}
            onFilterClick={() => setPanelOpen((prev) => !prev)}
            activeFilterCount={activeFilterCount}
          />

          {panelOpen && (
            <TicketsFiltersPanel
              draft={draftFilters}
              onChange={setDraftFilters}
              onApply={handleApplyFilters}
              onClear={handleClearFilters}
              onClose={() => setPanelOpen(false)}
              panelRef={panelRef}
            />
          )}
        </div>

        {isError ? (
          <QueryErrorState
            title={t("Unable to load tickets")}
            error={error}
            onRetry={refetch}
          />
        ) : (
          <div
            className={`transition-opacity ${
              isPlaceholderData ? "opacity-60" : "opacity-100"
            }`}
          >
            <TicketsBoard
              tickets={tickets}
              isLoading={isLoading}
              hasActiveFilters={!!debouncedSearch || activeFilterCount > 0}
              onViewTicket={openDetails}
            />

            {tickets.length > 0 && (
              <Pagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                itemLabel={t("tickets")}
                onGoToPage={(page) => goToPage(page, totalPages)}
                onPageSizeChange={handlePageSizeChange}
                getPageNumbers={getPageNumbers}
              />
            )}
          </div>
        )}
      </div>

      <TicketFormModal
        isOpen={isFormOpen}
        onSave={handleSaveTicket}
        onClose={closeForm}
        isSaving={isSaving}
        serverErrors={serverErrors}
      />

      {detailsTicketId && (
        <TicketDetailsModal
          ticketId={detailsTicketId}
          headerColor={detailsColor}
          onClose={closeDetails}
          onUpdate={canUpdate ? handleUpdateTicket : undefined}
          isSaving={isSaving}
          serverErrors={serverErrors}
        />
      )}
    </div></LocalizedPage>
  );
}
