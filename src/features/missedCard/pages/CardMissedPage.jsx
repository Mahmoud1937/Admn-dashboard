import LocalizedPage from "../../../localization/LocalizedPage";
import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPlus } from "@fortawesome/free-solid-svg-icons";
import PermissionGuard from "../../auth/components/PermissionGuard";
import { PERMISSION_CODES } from "../../auth/constants/permissionCodes";
import usePermission from "../../auth/hooks/usePermission";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import CardMissedFilters from "../components/CardMissedFilters";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import { emptyFilters, useCardMissedQuery } from "../hooks/useCardMissedQuery";
import { useCardMissedMutations } from "../hooks/useCardMissedMutations";
import SearchBarWithFilters from "../../../shared/components/SearchBarWithFilters";
import CardMissedTable from "../components/CardMissedTable";
import Pagination from "../../../shared/components/Pagination";
import CardMissedCreateModal from "../components/CardMissedCreateModal";
import ConfirmDeleteModal from "../../../shared/components/ConfirmDeleteModal";
import QueryErrorState from "../../../shared/components/QueryErrorState";
import { SkeletonTable } from "../../../shared/components/Skeleton";

const countActiveMissedFilters = (filters) =>
  Object.values(filters).filter((value) => value !== "" && value !== null && value !== undefined).length;

export default function CardMissedPage() {
  const { t } = useTranslation("adminPages");
  const canDelete = usePermission(PERMISSION_CODES.MISSED_CARDS_DELETE);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const cardPoolId = searchParams.get("CardPoolId");

  // Data passed from CardPoolTable's "Missed" link
  const from = location.state?.from;
  const to = location.state?.to;

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState(emptyFilters);
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const filterPanelRef = useRef(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    getPageNumbers,
  } = useServerPagination({
    resetKey: `${cardPoolId}-${debouncedSearch}-${JSON.stringify(filters)}`,
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
    cardMisseds,
    totalCount,
    totalPages,
    isLoading,
    isError,
    error,
    isPlaceholderData,
    refetch
  } = useCardMissedQuery({ cardPoolId, pageNumber, pageSize, searchTerm: debouncedSearch, filters });


  const closeForm = () => {
    setIsFormOpen(false);
    clearServerErrors();
  };

  const { createMutation, deleteMutation, isSaving, serverErrors, clearServerErrors } =
    useCardMissedMutations({
      onCreateSuccess: closeForm,
      onDeleteSuccess: () => setItemToDelete(null),
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

  const openAddForm = () => setIsFormOpen(true);

  const handleSave = (payload) => {
    createMutation.mutate(payload);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id);
    }
  };

  const hasActiveFilters = !!search || countActiveMissedFilters(filters) > 0;

  return (
    <LocalizedPage><div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {cardPoolId && (
            <button
              type="button"
              onClick={() => navigate("/card-pools")}
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              {t("Back to Card Pools")}
            </button>
          )}

          <h1 className="text-2xl font-bold text-slate-900 sm:text-2xl">{t("Missed / Damaged Cards")}</h1>

          <p className="mt-1 text-sm text-slate-500 sm:sm-sm">
  {cardPoolId && from && to ? (
    <>
      <span className="font-semibold text-slate-700">
        {totalCount ?? 0}
      </span>{" "}
      {t("missed cards from")}{" "}
      <span className="font-medium text-slate-700">{from}</span> {t("to")}{" "}
      <span className="font-medium text-slate-700">{to}</span>.
    </>
  ) : (
    t("Track and report missing or damaged cards.")
  )}
</p>
        </div>

        <PermissionGuard permission={PERMISSION_CODES.MISSED_CARDS_CREATE}>
          <button
            onClick={openAddForm}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-3 py-2 text-xs font-medium text-white hover:bg-blue-800 sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <FontAwesomeIcon icon={faPlus} />
            {t("Report Card")}
          </button>
        </PermissionGuard>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="relative">
          <SearchBarWithFilters
            value={search}
            onChange={setSearch}
            placeholder={t("Search by card number...")}
            onFilterClick={openFilters}
            activeFilterCount={countActiveMissedFilters(filters)}
            stacked={false}
          />

          {isFilterOpen && (
            <CardMissedFilters
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
          <SkeletonTable label={t("Loading records...")} columns={4} />
        )}

{isError && (
  <QueryErrorState
    title={t("Unable to load missed card")}
    error={error}
    onRetry={refetch}
  />
)}

        {!isLoading && !isError && (
          <div className={`transition-opacity ${isPlaceholderData ? "opacity-60" : "opacity-100"}`}>
            <CardMissedTable
              items={cardMisseds}
              hasActiveFilters={hasActiveFilters}
              onDelete={canDelete ? (item) => setItemToDelete(item) : undefined}
            />

            {(cardMisseds?.length ?? 0) > 0 && (
              <Pagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                itemLabel={t("records")}
                onGoToPage={(page) => goToPage(page, totalPages)}
                onPageSizeChange={handlePageSizeChange}
                getPageNumbers={getPageNumbers}
              />
            )}
          </div>
        )}
      </div>

      <CardMissedCreateModal
        isOpen={isFormOpen}
        onClose={closeForm}
        onSave={handleSave}
        isSaving={isSaving}
        serverErrors={serverErrors}
      />

      {canDelete && <ConfirmDeleteModal
        isOpen={!!itemToDelete}
        title={t("Delete Record")}
        message={`Are you sure you want to delete the record for card "${itemToDelete?.cardNumber}"? This action cannot be undone.`}
        confirmLabel={t("Delete")}
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setItemToDelete(null)}
      />}
    </div></LocalizedPage>
  );
}
