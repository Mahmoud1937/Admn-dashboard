import { useNavigate, useSearchParams } from "react-router-dom";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import { useCardActivationQuery } from "../hooks/useCardActivationQuery";
import CardActivationTable from "../components/CardActivationTable";
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
  const [searchParams] = useSearchParams();
  const id = searchParams.get("cardPoolId") || searchParams.get("id");
  const sourceType = searchParams.get("sourceType") || "1";

  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    lockPageSize,
    getPageNumbers,
  } = useServerPagination({ resetKey: `${id}-${sourceType}` });

  const {
    cards,
    totalCount,
    totalPages,
    serverPageSize,
    isLoading,
    isError,
    error,
    isPlaceholderData,
  } = useCardActivationQuery({ id, sourceType, pageNumber, pageSize });

  lockPageSize(serverPageSize);

  const backPath = SOURCE_TYPE_BACK_PATH[sourceType];

  return (
    <div>
      <div className="mb-6">
        {id && backPath && (
          <button
            type="button"
            onClick={() => navigate(backPath)}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to {SOURCE_TYPE_LABELS[sourceType]}
          </button>
        )}
        <h1 className="text-2xl font-bold text-slate-900 sm:text-2xl">Activated Cards</h1>
        <p className="mt-1 text-sm text-slate-500 sm:sm-sm">
          {id
            ? `Showing activated cards for ${SOURCE_TYPE_LABELS[sourceType] || "source"} #${id}`
            : "No source specified."}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        {!id && (
          <p className="p-8 text-center text-sm text-slate-400">
            Navigate here from a Card Pool or Sold Card row.
          </p>
        )}

        {id && isLoading && (
          <p className="p-8 text-center text-sm text-slate-400">Loading activated cards...</p>
        )}

        {id && isError && (
          <p className="p-8 text-center text-sm text-red-500">
            {error?.message || "Failed to load activated cards."}
          </p>
        )}

        {id && !isLoading && !isError && (
          <div className={`transition-opacity ${isPlaceholderData ? "opacity-60" : "opacity-100"}`}>
            <CardActivationTable items={cards} />

            {(cards?.length ?? 0) > 0 && (
              <Pagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                itemLabel="cards"
                onGoToPage={(page) => goToPage(page, totalPages)}
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