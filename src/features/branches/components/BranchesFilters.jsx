import GovernorateSelect from "../../cities/components/GovernorateSelect";
import CitySelect from "./CitySelect";
import FilterPanel from "../../../shared/components/FilterPanel";
import FilterPanelHeader from "../../../shared/components/FilterPanelHeader";
import FilterPanelFooter from "../../../shared/components/FilterPanelFooter";
import useProviderDetailsText from "../../../localization/useProviderDetailsText";
import useLanguage from "../../../localization/useLanguage";

export default function BranchesFilters({
  draft,
  onChange,
  onApply,
  onClear,
  onClose,
  panelRef,
  localized = false,
}) {
  const tr = useProviderDetailsText(localized);
  const { direction, language } = useLanguage();
  const rtl = localized && direction === "rtl";
  const selectLabels = localized ? {
    clearSelection: tr("Clear selection"),
    openOptions: tr("Open options"),
    closeOptions: tr("Close options"),
    loading: tr("Loading..."),
    loadingMore: tr("Loading more..."),
    unableToLoadOptions: tr("Unable to load options."),
    noResults: tr("No results found."),
    tryAgain: tr("Try again"),
  } : undefined;
  const bilingualOptionLabel = (item) => rtl
    ? `${item.arName} - ${item.enName}`
    : `${item.enName} - ${item.arName}`;
  return (
    <FilterPanel panelRef={panelRef} onClose={onClose} className="sm:w-80" side={rtl ? "left" : "right"}>
      <FilterPanelHeader title={tr("Filters")} closeLabel={tr("Close filters")} onClose={onClose} />

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {tr("Governorate")}
        </label>
        <GovernorateSelect
          key={localized ? language : "default"}
          value={draft.governorateId}
          onChange={(value) => onChange((previous) => ({
            ...previous,
            governorateId: value ?? "",
            cityId: "",
          }))}
          placeholder={tr("All Governorates")}
          searchPlaceholder={tr("Search governorates...")}
          labels={selectLabels}
          language={localized ? language : undefined}
          rtl={rtl}
          getOptionLabel={bilingualOptionLabel}
        />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {tr("City")}
        </label>
        <CitySelect
          key={localized ? language : "default"}
          governorateId={draft.governorateId}
          value={draft.cityId}
          onChange={(value) => onChange((previous) => ({ ...previous, cityId: value ?? "" }))}
          placeholder={tr("All Cities")}
          searchPlaceholder={tr("Search cities...")}
          chooseFirstPlaceholder={tr("Choose Governorate First ")}
          labels={selectLabels}
          language={localized ? language : undefined}
          rtl={rtl}
          getOptionLabel={bilingualOptionLabel}
        />
      </div>

      <div className="mb-5">
        <label htmlFor="branch-status-filter" className="mb-1.5 block text-sm font-medium text-slate-700">
          {tr("Status")}
        </label>
        <select
          id="branch-status-filter"
          value={draft.status}
          onChange={(event) => onChange((previous) => ({ ...previous, status: event.target.value }))}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
        >
          <option value="">{tr("All Statuses")}</option>
          <option value="1">{tr("Active")}</option>
          <option value="2">{tr("Inactive")}</option>
        </select>
      </div>

      <FilterPanelFooter onClear={onClear} onApply={onApply} clearLabel={tr("Clear all")} applyLabel={tr("Apply")} />
    </FilterPanel>
  );
}
