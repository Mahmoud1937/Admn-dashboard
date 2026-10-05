import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faListCheck, faTag } from "@fortawesome/free-solid-svg-icons";
import { useProviderQuery } from "../hooks/useProviderQuery";
import { useProviderMutation } from "../hooks/useProviderMutation";
import ProviderInfoForm from "../components/ProviderInfoForm";
import ProviderBranchesTab from "../../branches/components/ProviderBranchesTab";
import ProviderServicesTab from "../../providerServices/components/ProviderServicesTab";
import QueryErrorState from "../../../shared/components/QueryErrorState";
import AccessDeniedPage from "../../../shared/components/AccessDeniedPage";
import usePermission from "../../auth/hooks/usePermission";
import { PERMISSION_CODES } from "../../auth/constants/permissionCodes";

const TABS = [
  { key: "info", label: "Provider Info", icon: faBuilding },
  {
    key: "branches",
    label: "Branches",
    icon: faListCheck,
    permission: PERMISSION_CODES.PROVIDER_BRANCHES_READ,
  },
  {
    key: "Services",
    label: "Services",
    icon: faTag,
    permission: PERMISSION_CODES.PROVIDER_SERVICES_READ,
  },
];

export default function ProviderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isCreateMode = !id;

  const isUpdateRequested = !isCreateMode && searchParams.get("mode") === "edit";
  const canUpdate = usePermission(PERMISSION_CODES.PROVIDERS_UPDATE);
  const canViewBranches = usePermission(PERMISSION_CODES.PROVIDER_BRANCHES_READ);
  const canViewServices = usePermission(PERMISSION_CODES.PROVIDER_SERVICES_READ);
  const isEditMode = isCreateMode || (isUpdateRequested && canUpdate);
  const visibleTabs = TABS.filter((tab) => {
    if (!tab.permission) return true;
    if (tab.permission === PERMISSION_CODES.PROVIDER_BRANCHES_READ) {
      return canViewBranches;
    }
    return canViewServices;
  });

  const [activeTab, setActiveTab] = useState("info");

  const { provider, isLoading, isError, error,refetch } =
    useProviderQuery(id, isCreateMode);

  const { mutation } = useProviderMutation({ id, isCreateMode });

  if (isUpdateRequested && !canUpdate) {
    return <AccessDeniedPage />;
  }

  if (!isCreateMode && isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        Loading provider...
      </div>
    );
  }

  if (!isCreateMode && isError) {
    return (
      <div className="flex h-64 items-center justify-center text-red-500">
       {isError && (
         <QueryErrorState
           title="Unable to load Providers Details"
           error={error}
           onRetry={refetch}
         />
       )}
      </div>
    );
  }

  return (
    <div>
      {!isCreateMode && (
        <div className="mb-6 flex gap-2 border-b border-slate-200 sm:gap-6">
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 px-1 py-2.5 text-xs font-medium transition sm:flex-initial sm:justify-start sm:gap-2 sm:py-3 sm:text-sm ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} className="text-[11px] sm:text-sm" />
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      {activeTab === "info" && (
        <ProviderInfoForm
          isCreateMode={isCreateMode}
          isEditMode={isEditMode}
          provider={provider}
          mutation={mutation}
          canUpdate={canUpdate}
          onCancelToList={() => navigate("/providers")}
        />
      )}

      {activeTab === "branches" && canViewBranches && <ProviderBranchesTab />}

      {activeTab === "Services" && canViewServices && <ProviderServicesTab />}
    </div>
  );
}
