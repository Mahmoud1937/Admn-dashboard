import LocalizedPage from "../../../localization/LocalizedPage";
import { useTranslation } from "react-i18next";

import { useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import { useSoldCardsQuery } from "../hooks/useSoldCardsQuery";
import SoldCardsTable from "../components/SoldCardsTable";
import Pagination from "../../../shared/components/Pagination";
import QueryErrorState from "../../../shared/components/QueryErrorState";
import { SkeletonTable } from "../../../shared/components/Skeleton";

export default function SoldCardsByPoolPage() {
  const { t } = useTranslation("adminPages");
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const cardPoolId = searchParams.get("cardPoolId");

  const from = location.state?.from;
  const to = location.state?.to;
  const count = location.state?.count;

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    getPageNumbers,
  } = useServerPagination({
    resetKey: `${cardPoolId}-${debouncedSearch}`,
  });

  const {
    soldCards,
    totalCount,
    totalPages,
    isLoading,
    isError,
    error,
    refetch,
    isPlaceholderData,
  } = useSoldCardsQuery({
    cardPoolId,
    searchTerm: debouncedSearch,
    pageNumber,
    pageSize,
  });


  return (
    <LocalizedPage><div>
      <div className="mb-6">
        {cardPoolId && (
          <button
            type="button"
            onClick={() => window.history.back()}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            {t("Back to Card Pools")}
          </button>
        )}

        <h1 className="text-2xl font-bold text-slate-900 sm:text-2xl">
          {t("Sold Cards")}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {cardPoolId && from && to ? (
            <>
              <span className="font-semibold text-slate-700">
                {count ?? 0}
              </span>{" "}
              {t("sold cards from")}{" "}
              <span className="font-medium text-slate-700">
                {from}
              </span>{" "}
              {t("to")}{" "}
              <span className="font-medium text-slate-700">
                {to}
              </span>
              .
            </>
          ) : (
            t("Cards sold from this card pool.")
          )}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-200 p-4">
          <div className="relative flex-1">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("Search by card number, name, or phone...")}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-blue-400 focus:bg-white"
            />
          </div>
        </div>

        {isLoading && (
          <SkeletonTable label={t("Loading sold cards...")} columns={3} />
        )}

{isError && (
  <QueryErrorState
    title={t("Unable to Load Sold Card by Card Pool id")}
    error={error}
    onRetry={refetch}
  />
)}
        {!isLoading && !isError && (
          <div
            className={`transition-opacity ${
              isPlaceholderData
                ? "opacity-60"
                : "opacity-100"
            }`}
          >
            <SoldCardsTable items={soldCards} />

            {(soldCards?.length ?? 0) > 0 && (
              <Pagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                itemLabel={t("sold cards")}
                onGoToPage={(page) =>
                  goToPage(page, totalPages)
                }
                onPageSizeChange={handlePageSizeChange}
                getPageNumbers={getPageNumbers}
              />
            )}
          </div>
        )}
      </div>
    </div></LocalizedPage>
  );
}
