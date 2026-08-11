import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faListCheck, faTag } from "@fortawesome/free-solid-svg-icons";
import { useProviderCategoriesLookup, useProviderSpecialistsLookup } from "../hooks/useProviderLookups";
import { useProviderMutation } from "../hooks/useProviderMutation";
import ProviderInfoForm from "../components/ProviderInfoForm";
import ProviderBranchesTab from "../../branches/components/ProviderBranchesTab";
import { useProviderQuery } from "../hooks/useProviderQuery";

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
        <div className="mb-6 flex gap-6 border-b border-slate-200">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} />
              {tab.label}
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

      {activeTab === "Services" && (
        <div className="rounded-xl border border-slate-100 bg-white p-8 text-slate-500 shadow-sm">
          Services content here...
        </div>
      )}
    </div>
  );
}