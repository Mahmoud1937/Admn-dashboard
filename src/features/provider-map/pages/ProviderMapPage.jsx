import { useState } from "react";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useProvidersMapQuery } from "../hooks/useProvidersMapQuery";
import { useClientLocationsQuery } from "../hooks/usecCientLocationsQuery";
import CategoryTabs from "../components/CategoryTabs";
import MapFilters from "../components/MapFilters";
import ProviderClusterMap from "../components/ProviderClusterMap";


export default function ProviderMapPage() {
  const [category, setCategory] = useState("All");
  const [governorateId, setGovernorateId] = useState(null);
  const [search, setSearch] = useState("");
  const [showUsers, setShowUsers] = useState(false);

  const {
    providers,
    governorates,
    governorateBubbles,
    selectedGovernorate,
    totalCount,
    invalidProviderCount,
    invalidGovernorateCount,
    isLoading,
    isError,
  } = useProvidersMapQuery({ category, governorateId, search });

  const { locations: clientLocations, isLoading: clientsLoading } =
    useClientLocationsQuery(showUsers);

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Provider Directory Map</h1>
        <p className="text-sm text-gray-500">
          Visualize healthcare providers across Egyptian governorates
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <CategoryTabs activeCategory={category} onChange={setCategory} />
        <div className="flex flex-wrap items-center gap-3">
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
            Users
            {showUsers && clientsLoading && (
              <span className="text-xs opacity-75">(loading...)</span>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
        {isError ? (
          <span className="text-red-600">Failed to load providers.</span>
        ) : (
          <span>
            Showing {providers.length} of {totalCount} providers
            {showUsers && !clientsLoading && ` · ${clientLocations.length} client locations`}
          </span>
        )}
        {(invalidProviderCount > 0 || invalidGovernorateCount > 0) && (
          <span className="text-amber-600">
            {invalidProviderCount > 0 && `${invalidProviderCount} providers `}
            {invalidProviderCount > 0 && invalidGovernorateCount > 0 && "and "}
            {invalidGovernorateCount > 0 && `${invalidGovernorateCount} governorate centers `}
            have bad coordinates and were hidden from the map
          </span>
        )}
      </div>

      <div className="relative min-h-[500px] flex-1 overflow-hidden rounded-lg border border-gray-200">
        {isLoading && (
          <div className="absolute inset-0 z-[500] flex items-center justify-center bg-white/60">
            <span className="text-sm text-gray-500">Loading providers...</span>
          </div>
        )}
        <ProviderClusterMap
          providers={providers}
          governorateBubbles={governorateBubbles}
          selectedGovernorate={selectedGovernorate}
          clientLocations={clientLocations}
          showUsers={showUsers}
        />
      </div>
    </div>
  );
}