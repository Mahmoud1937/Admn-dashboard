import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import { useCardActivationQuery } from "../hooks/useCardActivationQuery";
import CardNotActivatedTable from "../components/CardNotActivatedTable";
import Pagination from "../../../shared/components/Pagination";

const SOURCE_TYPE_LABELS = {
  1: "Card Pool",
  2: "Sold Card",
};

const SOURCE_TYPE_BACK_PATH = {
  1: "/card-pools",
  2: "/sold-card",
};

export default function CardActivationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const id =
    searchParams.get("cardPoolId") || searchParams.get("id");

  const sourceType = searchParams.get("sourceType") || "1";

  /*
   * Data passed from CardPoolTable
   */
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
    lockPageSize,
    getPageNumbers,
  } = useServerPagination({
    resetKey: `${id}-${sourceType}-${debouncedSearch}`,
  });

  const {
    cards,
    totalCount,
    totalPages,
    serverPageSize,
    isLoading,
    isError,
    error,
    isPlaceholderData,
  } = useCardActivationQuery({
    id,
    sourceType,
    searchTerm: debouncedSearch,
    pageNumber,
    pageSize,
  });

  lockPageSize(serverPageSize);

  const backPath = SOURCE_TYPE_BACK_PATH[sourceType];

  return (
    <div>
      <div className="mb-6">
        {id && backPath && (
          <button
            type="button"
            onClick={() => navigate(backPath)}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to {SOURCE_TYPE_LABELS[sourceType]}
          </button>
        )}

        <h1 className="text-2xl font-bold text-slate-900 sm:text-2xl">
          Not Activated Cards
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {id && from && to ? (
            <>
              <span className="font-semibold text-slate-700">
                {count ?? 0}
              </span>{" "}
              not-activated cards from{" "}
              <span className="font-medium text-slate-700">
                {from}
              </span>{" "}
              to{" "}
              <span className="font-medium text-slate-700">
                {to}
              </span>
              .
            </>
          ) : id ? (
            <>Showing not-activated cards.</>
          ) : (
            "No source specified."
          )}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        {!id && (
          <p className="p-8 text-center text-sm text-slate-400">
            Navigate here from a Card Pool or Sold Card row.
          </p>
        )}

        {id && isLoading && (
          <p className="p-8 text-center text-sm text-slate-400">
            Loading cards...
          </p>
        )}

        {id && isError && (
          <p className="p-8 text-center text-sm text-red-500">
            {error?.message || "Failed to load cards."}
          </p>
        )}

        {id && !isLoading && !isError && (
          <div
            className={`transition-opacity ${
              isPlaceholderData
                ? "opacity-60"
                : "opacity-100"
            }`}
          >
            <CardNotActivatedTable
              items={cards}
              search={search}
              onSearchChange={setSearch}
              id={id}
              sourceType={sourceType}
              pageNumber={pageNumber}
              pageSize={pageSize}
            />

            {(cards?.length ?? 0) > 0 && (
              <Pagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                itemLabel="cards"
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
    </div>
  );
}