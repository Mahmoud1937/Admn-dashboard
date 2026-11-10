import ProviderCategorySelect from "./ProviderCategorySelect";
import SpecialistSelect from "../../services-admin/components/SpecialistSelect";
import FilterPanel from "../../../shared/components/FilterPanel";
import FilterPanelHeader from "../../../shared/components/FilterPanelHeader";
import FilterPanelFooter from "../../../shared/components/FilterPanelFooter";
import DateRangeFilterFields from "../../../shared/components/DateRangeFilterFields";
import { useTranslation } from "react-i18next";
import useLanguage from "../../../localization/useLanguage";


export default function ProvidersFilters({ draft, onChange, onApply, onClear, onClose, panelRef }) {
  const { t } = useTranslation("providers");
  const { language, direction } = useLanguage();
  const rtl = direction === "rtl";
  const selectLabels = {
    clearSelection: t("clearSelection"),
    openOptions: t("openOptions"),
    closeOptions: t("closeOptions"),
    loading: t("loading"),
    loadingMore: t("loadingMore"),
    unableToLoadOptions: t("unableToLoadOptions"),
    noResults: t("noResults"),
    tryAgain: t("tryAgain"),
  };
  // SpecialistSelect is a controlled component: onChange receives the raw
  // value directly (not an input change event).
  const setValue = (field) => (val) =>
    onChange((prev) => ({ ...prev, [field]: val }));

  const setStatus = (e) =>
    onChange((prev) => ({ ...prev, status: Number(e.target.value) }));

  return (
    <FilterPanel panelRef={panelRef} onClose={onClose} side={rtl ? "left" : "right"} className="sm:w-80">
      <FilterPanelHeader onClose={onClose} title={t("filters")} closeLabel={t("closeFilters")} />

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            {t("status")}
          </label>
          <select
            value={draft.status}
            onChange={setStatus}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
          >
            <option value={0}>{t("all")}</option>
            <option value={1}>{t("active")}</option>
            <option value={2}>{t("inactive")}</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            {t("joinDate")}
          </label>
          <DateRangeFilterFields
            draft={draft}
            onDraftChange={onChange}
            fromField="joinDateFrom"
            toField="joinDateTo"
            fromLabel={t("from")}
            toLabel={t("to")}
            datePlaceholder={t("datePlaceholder")}
            locale={language}
            weekdayLabels={t("weekdays", { returnObjects: true })}
            previousMonthLabel={t("previousMonth")}
            nextMonthLabel={t("nextMonth")}
            toggleCalendarLabel={t("toggleCalendar")}
          />
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            {t("category")}
          </label>
          <ProviderCategorySelect
            key={language}
            value={draft.categoryId}
            onChange={setValue("categoryId")}
            placeholder={t("allCategories")}
            searchPlaceholder={t("searchCategories")}
            labels={selectLabels}
            language={language}
            rtl={rtl}
          />
        </div>

        <div className="mb-5">
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            {t("specialist")}
          </label>
          <SpecialistSelect
            key={language}
            value={draft.specialistId}
            onChange={setValue("specialistId")}
            placeholder={t("allSpecialists")}
            searchPlaceholder={t("searchSpecialists")}
            labels={selectLabels}
            language={language}
            rtl={rtl}
          />
        </div>

        <FilterPanelFooter onClear={onClear} onApply={onApply} clearLabel={t("clearAll")} applyLabel={t("apply")} />
    </FilterPanel>
  );
}
