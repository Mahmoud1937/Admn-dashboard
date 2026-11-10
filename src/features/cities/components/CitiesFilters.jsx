import { useTranslation } from "react-i18next";
import GovernorateSelect from "./GovernorateSelect";
import FilterPanel from "../../../shared/components/FilterPanel";
import FilterPanelHeader from "../../../shared/components/FilterPanelHeader";
import FilterPanelFooter from "../../../shared/components/FilterPanelFooter";

export default function CitiesFilters({
  draft,
  onChange,
  onApply,
  onClear,
  onClose,
  panelRef,
}) {
  const { t } = useTranslation("adminPages");
  return (
    <FilterPanel panelRef={panelRef} onClose={onClose}>
      <FilterPanelHeader onClose={onClose} />
      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">{t("Governorate")}</label>
        <GovernorateSelect
          value={draft.governorateId}
          onChange={(value) => onChange({ ...draft, governorateId: value ?? "" })}
          placeholder={t("All Governorates")}
        />
      </div>
      <FilterPanelFooter onClear={onClear} onApply={onApply} />
    </FilterPanel>
  );
}
