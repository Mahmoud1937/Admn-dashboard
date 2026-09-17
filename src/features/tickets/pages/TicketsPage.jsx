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
import TicketsTable from "../components/TicketsTable";
import { useTicketMutations } from "../hooks/useTicketMutations";
import { useTicketsQuery } from "../hooks/useTicketsQuery";
import { countActiveTicketFilters } from "../utils/countActiveTicketFilters";

const emptyFilters = {
  ticketTypeId: "",
  providerId: "",
  employeeGroupId: "",
  priority: "",
  isClosed: "",
};

export default function TicketsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [filters, setFilters] = useState(emptyFilters);
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [panelOpen, setPanelOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [detailsTicketId, setDetailsTicketId] = useState(null);
  const panelRef = useRef(null);

  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    getPageNumbers,
  } = useServerPagination({
    resetKey: `${debouncedSearch}-${JSON.stringify(filters)}`,
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

  const openDetails = (ticketId) => {
    clearServerErrors();
    setDetailsTicketId(ticketId);
  };

  const closeDetails = () => {
    setDetailsTicketId(null);
    clearServerErrors();
  };

  const handleApplyFilters = () => {
    setFilters(draftFilters);
    setPanelOpen(false);
  };

  const handleClearFilters = () => {
    setFilters(emptyFilters);
    setDraftFilters(emptyFilters);
    setPanelOpen(false);
  };

  const activeFilterCount = countActiveTicketFilters(filters);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Tickets Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View and filter support tickets across the platform.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            clearServerErrors();
            setIsFormOpen(true);
          }}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-900 px-3 py-2 text-xs font-medium text-white hover:bg-blue-800 sm:px-4 sm:py-2.5 sm:text-sm"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Ticket
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="relative">
          <SearchBarWithFilters
            value={search}
            onChange={setSearch}
            placeholder="Search by user phone number or card number..."
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
            title="Unable to load tickets"
            error={error}
            onRetry={refetch}
          />
        ) : (
          <div
            className={`transition-opacity ${
              isPlaceholderData ? "opacity-60" : "opacity-100"
            }`}
          >
            <TicketsTable
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
                itemLabel="tickets"
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
          onClose={closeDetails}
          onUpdate={handleUpdateTicket}
          isSaving={isSaving}
          serverErrors={serverErrors}
        />
      )}
    </div>
  );
}
