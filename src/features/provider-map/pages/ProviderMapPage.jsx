import { useState } from "react";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useProvidersMapQuery } from "../hooks/useProvidersMapQuery";
import { useClientLocationsQuery } from "../hooks/usecCientLocationsQuery";
import CategoryTabs from "../components/CategoryTabs";
import MapFilters from "../components/MapFilters";
import ProviderClusterMap from "../components/ProviderClusterMap";
import QueryErrorState from "../../../shared/components/QueryErrorState";
import { SkeletonText } from "../../../shared/components/Skeleton";
import LocalizedPage from "../../../localization/LocalizedPage";
import useLanguage from "../../../localization/useLanguage";
import useProviderMapText from "../../../localization/useProviderMapText";


export default function ProviderMapPage() {
  const t = useProviderMapText();
  const { language } = useLanguage();
  const [providerCategoryId, setProviderCategoryId] = useState(null); 
  const [governorateId, setGovernorateId] = useState(null);
  const [search, setSearch] = useState("");
  const [showUsers, setShowUsers] = useState(false);



const {
  providers,
  governorates,
  governorateBubbles,
  countryBubble,
  selectedGovernorate,
  totalCount,
  isLoading,
  isError,
  error,
  refetch,
} = useProvidersMapQuery({ providerCategoryId, governorateId, search, language });

  const {
    locationBubbles: clientLocationBubbles,
    isLoading: clientsLoading,
    isError: clientsError,
    refetch: refetchClients,
    totalCount: clientTotalCount,
  } = useClientLocationsQuery(showUsers, language);

  return (
    <LocalizedPage className="flex min-h-[calc(100dvh-7rem)] flex-col gap-3 p-0 sm:gap-4 sm:p-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{t("Provider Directory Map")}</h1>
        <p className="text-sm text-gray-500">
          {t("Visualize healthcare providers across Egyptian governorates")}
        </p>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-center xl:justify-between">
        <CategoryTabs activeCategoryId={providerCategoryId} onChange={setProviderCategoryId} />
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center xl:w-auto">
          <MapFilters
            governorates={governorates}
            governorateId={governorateId}
            onGovernorateChange={setGovernorateId}
            search={search}
            onSearchChange={setSearch}
          />
          <button
            type="button"
            onClick={() => setShowUsers((v) => !v)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              showUsers
                ? "border-blue-700 bg-blue-700 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FontAwesomeIcon icon={faUsers} className="h-3.5 w-3.5" />
            {t("Users")}
            {showUsers && clientsLoading && (
              <span className="text-xs opacity-75">{t("(loading...)")}</span>
            )}
          </button>
        </div>
      </div>

<div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
  <span>
    {t("Showing {{shown}} of {{total}} providers", { shown: providers.length, total: totalCount })}
    {showUsers &&
      !clientsLoading &&
      ` · ${t("{{value}} client locations", { value: clientTotalCount })}`}
  </span>
  {showUsers && clientsError && (
    <button
      type="button"
      onClick={() => refetchClients()}
      className="text-xs font-medium text-red-600 hover:underline"
    >
      {t("Unable to load client locations. Retry")}
    </button>
  )}
</div>

 <div className="relative h-[55dvh] min-h-[22rem] overflow-hidden rounded-lg border border-gray-200 sm:h-[60dvh] sm:min-h-[30rem] lg:h-[calc(100dvh-15rem)]">
  {isLoading && (
    <div className="absolute inset-0 z-[500] flex items-center justify-center bg-white/70">
      <SkeletonText label={t("Loading providers...")} lines={6} />
    </div>
  )}

{isError ? (
  <div className="absolute inset-0 z-[600]">
    <QueryErrorState
      title={t("Unable to load providers")}
      error={error}
      onRetry={refetch}
      loadErrorMessage={t("We couldn't load the data. Please try again.")}
      connectionErrorMessage={t("We couldn't connect to the server. Please check your internet connection and try again.")}
      retryLabel={t("Try Again")}
    />
  </div>
) : (
  <ProviderClusterMap
    providers={providers}
    governorateBubbles={governorateBubbles}
    countryBubble={countryBubble}
    selectedGovernorate={selectedGovernorate}
    onSelectGovernorate={setGovernorateId}
    clientLocationBubbles={clientLocationBubbles}
    showUsers={showUsers}
  />
)}
</div>
    </LocalizedPage>
  );
}
