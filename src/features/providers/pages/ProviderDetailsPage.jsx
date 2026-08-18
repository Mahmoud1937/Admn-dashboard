import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faListCheck, faTag } from "@fortawesome/free-solid-svg-icons";
import { useProviderQuery } from "../hooks/useProviderQuery";
import { useProviderCategoriesLookup, useProviderSpecialistsLookup } from "../hooks/useProviderLookups";
import { useProviderMutation } from "../hooks/useProviderMutation";
import ProviderInfoForm from "../components/ProviderInfoForm";
import ProviderBranchesTab from "../../branches/components/ProviderBranchesTab";
import ProviderServicesTab from "../../providerServices/components/ProviderServicesTab";

const TABS = [
  { key: "info", label: "Provider Info", icon: faBuilding },
  { key: "branches", label: "Branches", icon: faListCheck },
  { key: "Services", label: "Services", icon: faTag },
];

export default function ProviderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isCreateMode = !id;

  const isEditMode = isCreateMode || searchParams.get("mode") === "edit";

  const [activeTab, setActiveTab] = useState("info");

  const { provider, isLoading, isError, error } =
    useProviderQuery(id, isCreateMode);
  const { categories, isLoading: isCategoriesLoading } = useProviderCategoriesLookup();
  const { specialists, isLoading: isSpecialistsLoading } = useProviderSpecialistsLookup();

  const { mutation } = useProviderMutation({ id, isCreateMode });

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
        {error?.message || "Failed to load provider."}
      </div>
    );
  }

  return (
    <div>
{!isCreateMode && (
  <div className="mb-6 flex gap-2 border-b border-slate-200 sm:gap-6">
    {TABS.map((tab) => (
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
          categories={categories}
          isCategoriesLoading={isCategoriesLoading}
          specialists={specialists}
          isSpecialistsLoading={isSpecialistsLoading}
          mutation={mutation}
          onCancelToList={() => navigate("/providers")}
        />
      )}

      {activeTab === "branches" && <ProviderBranchesTab />}

      {activeTab === "Services" && <ProviderServicesTab />}
    </div>
  );
}