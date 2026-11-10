import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import CategorySelect from "./CategorySelect";
import useLanguage from "../../../localization/useLanguage";
import useServicesAdminText from "../../../localization/useServicesAdminText";

export default function ServicesFilters({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  children,
}) {
  const t = useServicesAdminText();
  const { language, direction } = useLanguage();
  const rtl = direction === "rtl";
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative flex-1">
        <FontAwesomeIcon
          icon={faSearch}
          className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${rtl ? "right-4" : "left-4"}`}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          style={rtl ? { direction: "rtl", textAlign: "right" } : undefined}
          placeholder={t("Search services by name (EN/AR) or CPT...")}
          aria-label={t("Search services by name (EN/AR) or CPT...")}
          className={`w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white ${rtl ? "pr-11 pl-4" : "pl-11 pr-4"}`}
        />
      </div>

      <CategorySelect
        key={language}
        localized
        value={categoryFilter}
        onChange={onCategoryFilterChange}
        placeholder={t("All Categories")}
      />
      {children}
    </div>
  );
}
