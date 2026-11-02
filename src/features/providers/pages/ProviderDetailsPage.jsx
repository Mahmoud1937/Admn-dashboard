import { useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faBoxOpen,
  faBuilding,
  faClockRotateLeft,
  faListCheck,
  faPills,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import { useProviderQuery } from "../hooks/useProviderQuery";
import { useProviderMutation } from "../hooks/useProviderMutation";
import ProviderInfoForm from "../components/ProviderInfoForm";
import ProviderBranchesTab from "../../branches/components/ProviderBranchesTab";
import ProviderServicesTab from "../../providerServices/components/ProviderServicesTab";
import ProviderMedicinesTab from "../../Medicines/components/ProviderMedicinesTab";
import ProviderPackagesTab from "../../providerPackages/components/ProviderPackagesTab";
import ProviderRenewalsTab from "../../providerRenewals/components/ProviderRenewalsTab";
import QueryErrorState from "../../../shared/components/QueryErrorState";
import AccessDeniedPage from "../../../shared/components/AccessDeniedPage";
import usePermission from "../../auth/hooks/usePermission";
import { PERMISSION_CODES } from "../../auth/constants/permissionCodes";
import Skeleton from "../../../shared/components/Skeleton";
import { isPharmacyCategory } from "../utils/providerFormHelpers";

const TABS = [
  { key: "info", label: "Provider Info", icon: faBuilding },
  { key: "branches", label: "Branches", icon: faListCheck },
  { key: "services", label: "Services", icon: faTag },
  { key: "packages", label: "Packages", icon: faBoxOpen },
  { key: "renewals", label: "Renewals", icon: faClockRotateLeft },
];

function PageSkeleton() {
  return (
    <Skeleton className="space-y-6">
      <div className="space-y-3">
        <div className="h-4 w-24 rounded bg-slate-200" />
        <div className="h-7 w-64 rounded bg-slate-200" />
        <div className="h-4 w-48 rounded bg-slate-100" />
      </div>
      <div className="h-11 w-full rounded-lg bg-slate-100" />
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-11 rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    </Skeleton>
  );
}

export default function ProviderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isCreateMode = !id;

  const isUpdateRequested = !isCreateMode && searchParams.get("mode") === "edit";
  const canUpdate = usePermission(PERMISSION_CODES.PROVIDERS_UPDATE);
  const canViewBranches = usePermission(PERMISSION_CODES.PROVIDER_BRANCHES_READ);
  const canViewServices = usePermission(PERMISSION_CODES.PROVIDER_SERVICES_READ);
  const canViewPriceLists = usePermission(PERMISSION_CODES.PROVIDER_PRICE_LISTS_READ);
  const canViewMedicines = usePermission(PERMISSION_CODES.MEDICINES_READ);
  const canViewPackages = usePermission(PERMISSION_CODES.PROVIDER_PACKAGES_READ);
  const canViewRenewals = usePermission(PERMISSION_CODES.PROVIDERS_READ);
  const canReadBrokers = usePermission(PERMISSION_CODES.BROKERS_READ);
  const isEditMode = isCreateMode || (isUpdateRequested && canUpdate);

  const { provider, isLoading, isError, error, refetch } = useProviderQuery(
    id,
    isCreateMode
  );
  const isPharmacy = isPharmacyCategory(provider?.providerCategoryId);

  const visibleTabs = useMemo(() => {
    const access = {
      info: true,
      branches: canViewBranches,
      services: isPharmacy ? canViewMedicines : canViewServices || canViewPriceLists,
      packages: canViewPackages,
      renewals: canViewRenewals,
    };
    return TABS.filter((tab) => access[tab.key]).map((tab) =>
      tab.key === "services"
        ? { ...tab, label: isPharmacy ? "Medicines" : canViewServices ? "Services" : "Price lists", icon: isPharmacy ? faPills : tab.icon }
        : tab
    );
  }, [isPharmacy, canViewMedicines, canViewBranches, canViewServices, canViewPriceLists, canViewPackages, canViewRenewals]);

  const [activeTab, setActiveTab] = useState("info");
  const selectedTab = visibleTabs.some((tab) => tab.key === activeTab)
    ? activeTab
    : "info";

  const { mutation } = useProviderMutation({ id, isCreateMode });

  if (isUpdateRequested && !canUpdate) {
    return <AccessDeniedPage />;
  }

  if (!isCreateMode && isLoading) {
    return <PageSkeleton />;
  }

  if (!isCreateMode && isError) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <QueryErrorState
          title="Unable to load provider details"
          error={error}
          onRetry={refetch}
        />
      </div>
    );
  }

  const providerName = provider?.enName || provider?.arName || provider?.name || provider?.nameEn || "Provider";
  const pageTitle = isCreateMode ? "New Provider" : providerName;
  const pageSubtitle = isCreateMode
    ? "Fill in the details below to register a new provider."
    : isEditMode
    ? "Update provider information."
    : `View provider information, branches, ${isPharmacy ? "medicines" : "services"}, packages and renewals.`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-3">
        <button
          type="button"
          onClick={() => navigate("/providers")}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
          Back to providers
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FontAwesomeIcon icon={faBuilding} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-semibold text-slate-900 sm:text-2xl">
                {pageTitle}
              </h1>
              {isEditMode && !isCreateMode && (
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
                  Editing
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500">{pageSubtitle}</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      {!isCreateMode && (
        <nav
          aria-label="Provider sections"
          className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm"
        >
          <div className="flex min-w-max gap-1 sm:min-w-0">
            {visibleTabs.map((tab) => {
              const isActive = selectedTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition sm:flex-initial ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <FontAwesomeIcon icon={tab.icon} className="text-xs" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* Content */}
      <section>
        {selectedTab === "info" && (
          <ProviderInfoForm
            isCreateMode={isCreateMode}
            isEditMode={isEditMode}
            provider={provider}
            mutation={mutation}
            canUpdate={canUpdate}
            onCancelToList={() => navigate("/providers")}
          />
        )}

        {selectedTab === "branches" && canViewBranches && <ProviderBranchesTab />}
        {selectedTab === "services" && (isPharmacy
          ? canViewMedicines && <ProviderMedicinesTab key={id} providerId={id} />
          : (canViewServices || canViewPriceLists) && <ProviderServicesTab />)}
        {selectedTab === "packages" && canViewPackages && <ProviderPackagesTab />}
        {!isCreateMode && selectedTab === "renewals" && canViewRenewals && (
          <ProviderRenewalsTab
            key={id}
            providerId={id}
            canUploadAttachments={canUpdate}
            canCreateRenewals={canUpdate}
            canUpdateRenewals={canUpdate}
            canSelectBroker={canReadBrokers}
          />
        )}
      </section>
    </div>
  );
}
