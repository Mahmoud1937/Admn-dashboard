import { useId, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import AvatarImage from "../../../shared/components/AvatarImage";
import { SkeletonText } from "../../../shared/components/Skeleton";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { getApiErrorMessage } from "../../../shared/helpers/apiErrorHandler";
import { getManualPrescriptionProviders } from "../services/prescriptionsService";

const formatPrice = (price) =>
  typeof price === "number" ? `${price.toFixed(2)} EGP` : "Price unavailable";

export default function PrescriptionProviderSelect({ serviceId, value, onChange, disabled }) {
  const groupId = useId();
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim(), 300);
  const {
    data,
    isPending,
    isError,
    error,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["manual-prescription-providers", serviceId, search],
    queryFn: ({ pageParam, signal }) => getManualPrescriptionProviders({
      serviceId, pageNumber: pageParam, pageSize: 10, search, signal,
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const page = lastPage?.data;
      return page?.pageNumber < page?.totalPages ? page.pageNumber + 1 : undefined;
    },
    enabled: Boolean(serviceId),
  });
  const providers = data?.pages.flatMap((page) => page?.data?.items ?? []) ?? [];

  return (
    <fieldset disabled={disabled} className="min-w-0 space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
      <legend className="sr-only">Providers offering the selected service</legend>
      <div className="flex items-center gap-3">
        <label className="relative block flex-1">
          <span className="sr-only">Search providers</span>
          <FontAwesomeIcon
            icon={faSearch}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search providers..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
          />
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("", null)}
            className="shrink-0 rounded-lg px-2 py-1.5 text-xs font-medium text-blue-800 transition hover:bg-blue-50 disabled:opacity-50"
          >
            Clear selection
          </button>
        )}
      </div>

      {isError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <p>{getApiErrorMessage(error, { details: true, fallback: "Unable to load providers." })}</p>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="mt-2 font-medium underline disabled:opacity-50"
          >
            Try again
          </button>
        </div>
      )}
      {isPending ? (
        <SkeletonText label="Loading providers..." lines={3} />
      ) : !isError && providers.length === 0 ? (
        <p role="status" className="rounded-lg border border-dashed border-slate-300 bg-white py-6 text-center text-sm text-slate-500">
          {search ? "No providers match your search." : "No providers offer this service."}
        </p>
      ) : (
        <div className="max-h-72 space-y-2 overflow-y-auto pr-0.5" aria-busy={isFetching}>
          {providers.map((provider) => {
            const selected = String(value) === String(provider.providerId);
            const name = provider.enName || provider.arName || `Provider #${provider.providerId}`;
            return (
              <label
                key={`${provider.providerId}-${provider.providerPriceListId}`}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-3 transition focus-within:ring-4 focus-within:ring-blue-100 ${
                  selected
                    ? "border-blue-500 bg-blue-50/40 ring-1 ring-blue-500"
                    : "border-slate-200 hover:border-blue-300 hover:shadow-sm"
                }`}
              >
                <input
                  type="radio"
                  name={groupId}
                  value={provider.providerId}
                  checked={selected}
                  onChange={() => onChange(provider.providerId, provider)}
                  className="mt-1 shrink-0 accent-blue-800"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <AvatarImage src={provider.imageUrl} alt={name} size="h-9 w-9 shrink-0" loading="lazy" />
                    <div className="min-w-0">
                      <p className="break-words text-sm font-semibold text-slate-900" dir="auto">{name}</p>
                      {provider.enName && provider.arName && (
                        <p className="break-words text-xs text-slate-500" dir="auto">{provider.arName}</p>
                      )}
                    </div>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs sm:grid-cols-3">
                    <div>
                      <dt className="text-slate-500">Before discount</dt>
                      <dd className="mt-0.5 font-medium text-slate-700">{formatPrice(provider.priceBefore)}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">After discount</dt>
                      <dd className="mt-0.5 font-semibold text-emerald-700">{formatPrice(provider.priceAfter)}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Discount</dt>
                      <dd className="mt-0.5 font-medium text-slate-700">
                        {provider.discountPercentage != null ? `${provider.discountPercentage}%` : "—"}
                      </dd>
                    </div>
                  </dl>
                  {provider.requiresManualPrice && (
                    <p className="mt-2 inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                      Provider uses manual pricing
                    </p>
                  )}
                </div>
              </label>
            );
          })}
          {hasNextPage && (
            <button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-blue-800 transition hover:bg-blue-50 disabled:opacity-50"
            >
              {isFetchingNextPage ? "Loading more providers..." : "Load more providers"}
            </button>
          )}
        </div>
      )}
    </fieldset>
  );
}